"""Allô Québec - Backend API
AI-powered assistant for navigating Quebec government services.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Server-side fixed packages (NEVER trust the frontend on price)
PREMIUM_PACKAGES = {
    "premium_monthly": {
        "amount": 4.99,
        "currency": "cad",
        "days": 30,
        "label": "Allô Québec Pro — 30 jours",
    },
}
FREE_MONTHLY_AI_LIMIT = 10

app = FastAPI(title="Allô Québec API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ============ MODELS ============
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SessionRequest(BaseModel):
    session_id: str


class ReminderCreate(BaseModel):
    title: str
    category: str  # ramq, saaq, impots, logement, autre
    due_date: str  # ISO date
    notes: Optional[str] = ""


class Reminder(BaseModel):
    id: str
    user_id: str
    title: str
    category: str
    due_date: str
    notes: str = ""
    created_at: str


class ChatMessageCreate(BaseModel):
    message: str
    session_id: Optional[str] = None  # chat session id (not auth session)


class Guide(BaseModel):
    id: str
    slug: str
    title: str
    category: str
    icon: str
    color: str
    short_description: str
    steps: List[dict]
    resources: List[dict]
    faq: List[dict]


# ============ AUTH HELPERS ============
SYSTEM_PROMPT_QC = """Tu es Allô Québec, un assistant IA chaleureux qui aide les Québécois à naviguer les démarches administratives au Québec.

TON ROLE:
- Réponds en français québécois, ton chaleureux et accessible (tutoie l'utilisateur, comme un ami qui aide)
- Tu es expert en services publics du Québec: RAMQ (carte soleil, assurance maladie), SAAQ (permis, immatriculation), Revenu Québec (impôts), GAMF (médecin de famille), CNESST, Hydro-Québec, logement (TAL/RDL), aide sociale, AFE (aide financière aux études), curateur public, etc.
- Donne des réponses CONCRÈTES et PRATIQUES: étapes claires, documents requis, délais, coûts, liens officiels gouv.qc.ca quand pertinent
- Si la question dépasse ton expertise (juridique, médical), suggère gentiment de contacter le bon service

STYLE:
- Phrases courtes et claires
- Utilise des listes à puces quand utile
- Inclus toujours les liens officiels (ex: ramq.gouv.qc.ca, saaq.gouv.qc.ca, revenuquebec.ca)
- Termine par une question d'aide si pertinent: "Tu veux que je détaille une étape?"

IMPORTANT: Tu ne donnes JAMAIS de conseil juridique ou médical formel. Tu informes seulement."""


async def get_current_user(request: Request) -> Optional[dict]:
    """Extract user from session_token (cookie or Bearer header)."""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth = request.headers.get("authorization", "")
        if auth.startswith("Bearer "):
            session_token = auth[7:]
    if not session_token:
        return None

    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return None

    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None

    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user


async def require_user(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return user


def is_premium(user: dict) -> bool:
    """Check if user has active premium subscription."""
    pu = user.get("premium_until")
    if not pu:
        return False
    if isinstance(pu, str):
        try:
            pu = datetime.fromisoformat(pu)
        except Exception:
            return False
    if pu.tzinfo is None:
        pu = pu.replace(tzinfo=timezone.utc)
    return pu > datetime.now(timezone.utc)


async def monthly_ai_usage(user_id: str) -> int:
    """Count user's AI messages this calendar month."""
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    count = await db.chat_messages.count_documents({
        "user_id": user_id,
        "role": "user",
        "created_at": {"$gte": month_start},
    })
    return count


# ============ AUTH ROUTES ============
@api_router.post("/auth/session")
async def create_session(payload: SessionRequest, response: Response):
    """Exchange session_id from Emergent OAuth for a session_token."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            r = await http_client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": payload.session_id},
            )
    except Exception as e:
        logger.exception("Network error contacting Emergent auth")
        raise HTTPException(status_code=502, detail=f"Erreur réseau auth: {str(e)}")

    if r.status_code != 200:
        logger.warning("Emergent auth returned %s: %s (session_id_prefix=%s)",
                       r.status_code, r.text[:200], payload.session_id[:8])
        raise HTTPException(
            status_code=401,
            detail=f"Session invalide ({r.status_code}). Le lien de connexion est peut-être expiré ou déjà utilisé. Reconnecte-toi.",
        )
    data = r.json()
    email = data["email"]
    name = data.get("name", email)
    picture = data.get("picture")
    session_token = data["session_token"]

    # Find or create user
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    if not user_doc:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user_doc)
    else:
        await db.users.update_one(
            {"user_id": user_doc["user_id"]},
            {"$set": {"name": name, "picture": picture}}
        )
        user_doc["name"] = name
        user_doc["picture"] = picture

    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "user_id": user_doc["user_id"],
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )

    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    user_doc.pop("_id", None)
    return {"user": user_doc}


@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await require_user(request)
    user.pop("_id", None)
    user["premium"] = is_premium(user)
    return user


@api_router.get("/me/usage")
async def me_usage(request: Request):
    user = await require_user(request)
    used = await monthly_ai_usage(user["user_id"])
    premium = is_premium(user)
    return {
        "premium": premium,
        "premium_until": user.get("premium_until"),
        "used": used,
        "limit": None if premium else FREE_MONTHLY_AI_LIMIT,
        "remaining": None if premium else max(0, FREE_MONTHLY_AI_LIMIT - used),
    }


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token") or ""
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}


# ============ CHAT ROUTES ============
@api_router.post("/chat")
async def chat(payload: ChatMessageCreate, request: Request):
    user = await require_user(request)
    user_id = user["user_id"]

    # Enforce free tier limit
    if not is_premium(user):
        used = await monthly_ai_usage(user_id)
        if used >= FREE_MONTHLY_AI_LIMIT:
            raise HTTPException(
                status_code=402,
                detail=f"Limite mensuelle atteinte ({FREE_MONTHLY_AI_LIMIT} messages). Passe à Allô Québec Pro pour une utilisation illimitée.",
            )

    # Get or create chat session
    chat_session_id = payload.session_id
    if not chat_session_id:
        chat_session_id = f"chat_{uuid.uuid4().hex[:16]}"
        await db.chat_sessions.insert_one({
            "session_id": chat_session_id,
            "user_id": user_id,
            "title": payload.message[:60],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })

    # Load prior history for this session and feed it via system / messages
    prior = await db.chat_messages.find(
        {"session_id": chat_session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    # Save user message
    user_msg = {
        "id": str(uuid.uuid4()),
        "session_id": chat_session_id,
        "user_id": user_id,
        "role": "user",
        "content": payload.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_messages.insert_one(user_msg.copy())

    # Build chat with full history by replaying messages in a fresh LlmChat
    ai_text: str = ""
    try:
        chat_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=chat_session_id,
            system_message=SYSTEM_PROMPT_QC,
        ).with_model("anthropic", "claude-sonnet-4-6")

        # Compose a contextual prompt: include history summary if exists
        if prior:
            history_text = "\n".join(
                [f"{'Utilisateur' if m['role']=='user' else 'Toi'}: {m['content']}" for m in prior[-10:]]
            )
            full_text = f"Historique récent:\n{history_text}\n\nNouvelle question:\n{payload.message}"
        else:
            full_text = payload.message

        response = await chat_client.send_message(UserMessage(text=full_text))
        ai_text = response if isinstance(response, str) else str(response)
    except Exception as e:
        logger.exception("LLM error")
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")

    # Save AI message
    ai_msg = {
        "id": str(uuid.uuid4()),
        "session_id": chat_session_id,
        "user_id": user_id,
        "role": "assistant",
        "content": ai_text,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_messages.insert_one(ai_msg.copy())

    await db.chat_sessions.update_one(
        {"session_id": chat_session_id},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )

    return {
        "session_id": chat_session_id,
        "reply": ai_text,
        "user_message_id": user_msg["id"],
        "assistant_message_id": ai_msg["id"],
    }


@api_router.get("/chat/sessions")
async def list_chat_sessions(request: Request):
    user = await require_user(request)
    sessions = await db.chat_sessions.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("updated_at", -1).to_list(50)
    return sessions


@api_router.get("/chat/sessions/{session_id}/messages")
async def get_chat_messages(session_id: str, request: Request):
    user = await require_user(request)
    msgs = await db.chat_messages.find(
        {"session_id": session_id, "user_id": user["user_id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    return msgs


# ============ REMINDERS ============
@api_router.get("/reminders")
async def list_reminders(request: Request):
    user = await require_user(request)
    items = await db.reminders.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("due_date", 1).to_list(200)
    return items


@api_router.post("/reminders")
async def create_reminder(payload: ReminderCreate, request: Request):
    user = await require_user(request)
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "title": payload.title,
        "category": payload.category,
        "due_date": payload.due_date,
        "notes": payload.notes or "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reminders.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


@api_router.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str, request: Request):
    user = await require_user(request)
    result = await db.reminders.delete_one({"id": reminder_id, "user_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rappel introuvable")
    return {"ok": True}


# ============ GUIDES ============
GUIDES_SEED = [
    {
        "slug": "ramq-carte-soleil",
        "title": "Renouveler ta carte soleil (RAMQ)",
        "category": "Santé",
        "icon": "HeartPulse",
        "color": "#FF5757",
        "short_description": "Ta carte d'assurance maladie expire? Voici comment la renouveler sans stress.",
        "steps": [
            {"title": "Vérifie la date d'expiration", "detail": "Regarde au verso de ta carte. La RAMQ t'envoie un avis 6 mois avant."},
            {"title": "Rassemble tes documents", "detail": "Photo récente (selon les normes), preuve d'identité, et formulaire pré-rempli reçu par la poste."},
            {"title": "Soumets en ligne ou par la poste", "detail": "Utilise le service en ligne sur ramq.gouv.qc.ca ou retourne le formulaire par la poste avec ta photo."},
            {"title": "Reçois ta nouvelle carte", "detail": "Compte 4 à 6 semaines. Ton ancienne carte reste valide jusqu'à la date d'expiration."},
        ],
        "resources": [
            {"label": "Site officiel RAMQ", "url": "https://www.ramq.gouv.qc.ca"},
            {"label": "Service en ligne", "url": "https://www.ramq.gouv.qc.ca/fr/citoyens"},
        ],
        "faq": [
            {"q": "C'est combien?", "a": "Le renouvellement est gratuit."},
            {"q": "J'ai perdu ma carte!", "a": "Demande un remplacement en ligne. Frais de 17$."},
        ],
    },
    {
        "slug": "saaq-permis-conduire",
        "title": "Renouveler ton permis de conduire (SAAQ)",
        "category": "Transport",
        "icon": "Car",
        "color": "#38B6FF",
        "short_description": "Ton permis expire bientôt? Voici la marche à suivre.",
        "steps": [
            {"title": "Reçois ton avis de renouvellement", "detail": "La SAAQ t'envoie un avis avec ton montant à payer environ 60 jours avant l'expiration."},
            {"title": "Paye le montant", "detail": "Tu peux payer en ligne, par téléphone, ou en personne dans un point de service SAAQ."},
            {"title": "Mise à jour de photo (si demandé)", "detail": "Tous les 8 ans, tu dois te présenter en personne pour une nouvelle photo."},
            {"title": "Reçois ton nouveau permis", "detail": "Compte 1 à 2 semaines par la poste."},
        ],
        "resources": [
            {"label": "Site officiel SAAQ", "url": "https://saaq.gouv.qc.ca"},
            {"label": "SAAQclic (service en ligne)", "url": "https://saaq.gouv.qc.ca/saaqclic"},
        ],
        "faq": [
            {"q": "Combien ça coûte?", "a": "Environ 92$ pour un permis classe 5 (varie selon les points d'inaptitude)."},
            {"q": "Je conduis depuis l'étranger, que faire?", "a": "Tu as 6 mois pour échanger ton permis. Contacte la SAAQ."},
        ],
    },
    {
        "slug": "gamf-medecin-famille",
        "title": "Trouver un médecin de famille (GAMF)",
        "category": "Santé",
        "icon": "Stethoscope",
        "color": "#00D084",
        "short_description": "Inscris-toi au Guichet d'accès à un médecin de famille pour être jumelé.",
        "steps": [
            {"title": "Va sur le portail GAMF", "detail": "Visite gamf.gouv.qc.ca avec ta carte d'assurance maladie en main."},
            {"title": "Remplis le formulaire", "detail": "Indique tes infos, ton état de santé, et tes préférences (langue, sexe du médecin, etc.)."},
            {"title": "Attends ton jumelage", "detail": "L'attente varie de quelques mois à plusieurs années selon ta région et ta priorité clinique."},
            {"title": "Réponds rapidement au médecin", "detail": "Quand un médecin te contacte, prends rendez-vous rapidement pour confirmer."},
        ],
        "resources": [
            {"label": "GAMF (inscription)", "url": "https://www.quebec.ca/sante/trouver-une-ressource/inscription-aupres-d-un-medecin-de-famille"},
            {"label": "Bottin Santé", "url": "https://santequebec.ca"},
        ],
        "faq": [
            {"q": "Combien de temps d'attente?", "a": "Très variable. Médiane d'environ 600 jours, mais ça dépend de ta priorité clinique."},
            {"q": "Et en attendant?", "a": "Tu peux consulter en sans rendez-vous, GMF accès, ou via le 811."},
        ],
    },
    {
        "slug": "impots-revenu-quebec",
        "title": "Faire ta déclaration d'impôts (Revenu Québec)",
        "category": "Finances",
        "icon": "Receipt",
        "color": "#FFD500",
        "short_description": "C'est la saison des impôts? Suis ces étapes pour les déclarer sans tracas.",
        "steps": [
            {"title": "Rassemble tes feuillets", "detail": "T4, Relevé 1, Relevé 31 (loyer), reçus de dons, frais médicaux, RRSP, REER, etc."},
            {"title": "Choisis ton logiciel", "detail": "TurboImpôt, ImpôtNet, H&R Block, ou un comptable. Plusieurs sont gratuits jusqu'à un certain revenu."},
            {"title": "Remplis fédéral ET provincial", "detail": "Au Québec, tu fais 2 déclarations: une à l'ARC (Canada) et une à Revenu Québec."},
            {"title": "Envoie avant le 30 avril", "detail": "Date limite. Sinon, pénalité de 5% + 1% par mois de retard."},
        ],
        "resources": [
            {"label": "Revenu Québec", "url": "https://www.revenuquebec.ca"},
            {"label": "ARC (Canada)", "url": "https://www.canada.ca/fr/agence-revenu.html"},
        ],
        "faq": [
            {"q": "Je suis étudiant, dois-je déclarer?", "a": "Oui! Même sans revenu. Tu peux récupérer des crédits (frais de scolarité, transport, etc.)."},
            {"q": "Mon proprio refuse de me donner mon Relevé 31", "a": "C'est illégal. Tu peux le dénoncer à Revenu Québec."},
        ],
    },
    {
        "slug": "logement-droits-locataire",
        "title": "Tes droits comme locataire (TAL)",
        "category": "Logement",
        "icon": "Home",
        "color": "#9B59B6",
        "short_description": "Ton proprio veut te mettre dehors? Hausse abusive? Voici tes droits.",
        "steps": [
            {"title": "Connais ton bail", "detail": "Garde une copie. Le bail au Québec se renouvelle automatiquement (reconduction)."},
            {"title": "Hausse de loyer", "detail": "Tu peux la refuser! Réponds par écrit dans les 30 jours suivant l'avis (3-6 mois avant la fin du bail)."},
            {"title": "Reprise de logement / éviction", "detail": "Le proprio doit suivre une procédure stricte. Avis 6 mois avant la fin du bail. Tu peux contester."},
            {"title": "Dépose une demande au TAL", "detail": "Tribunal administratif du logement. Frais d'ouverture environ 87$, mais peut être réduit."},
        ],
        "resources": [
            {"label": "Tribunal administratif du logement", "url": "https://www.tal.gouv.qc.ca"},
            {"label": "Calculateur de hausse", "url": "https://www.tal.gouv.qc.ca/fr/calcul-pour-la-fixation-de-loyer"},
            {"label": "RCLALQ (regroupement comités logement)", "url": "https://rclalq.qc.ca"},
        ],
        "faq": [
            {"q": "Mon proprio peut-il entrer chez moi?", "a": "Non, sans préavis de 24h sauf urgence. C'est ta vie privée."},
            {"q": "Et le dépôt de sécurité?", "a": "INTERDIT au Québec! Le proprio ne peut exiger que le 1er mois de loyer."},
        ],
    },
    {
        "slug": "afe-aide-financiere-etudes",
        "title": "Aide financière aux études (AFE)",
        "category": "Études",
        "icon": "GraduationCap",
        "color": "#FF5757",
        "short_description": "Prêts et bourses pour étudier. Comment appliquer et maximiser ton aide.",
        "steps": [
            {"title": "Crée ton compte AFE", "detail": "Va sur afe.gouv.qc.ca avec ton code permanent du MEES."},
            {"title": "Remplis ta demande", "detail": "Tu as besoin de ta déclaration d'impôts, celle de tes parents (si tu dépends d'eux), preuve d'inscription."},
            {"title": "Soumets avant la date limite", "detail": "Idéalement avant le début de l'année scolaire. Les versements commencent dès l'inscription confirmée."},
            {"title": "Renouvelle chaque année", "detail": "Une nouvelle demande chaque année scolaire. Garde tes preuves d'inscription à jour."},
        ],
        "resources": [
            {"label": "Aide financière aux études", "url": "https://www.quebec.ca/education/aide-financiere-aux-etudes"},
            {"label": "Calculateur d'aide", "url": "https://www.afe.gouv.qc.ca/en-cours-detudes/calculer-ses-droits/"},
        ],
        "faq": [
            {"q": "Bourse ou prêt?", "a": "Ça dépend de ta situation. Plus tu es en région ou seul, plus tu auras de bourse."},
            {"q": "Je suis à temps partiel, j'ai droit?", "a": "Oui! Il existe un programme spécifique études à temps partiel."},
        ],
    },
    {
        "slug": "hydro-quebec-compte",
        "title": "Ouvrir un compte Hydro-Québec",
        "category": "Logement",
        "icon": "Zap",
        "color": "#38B6FF",
        "short_description": "Tu déménages? Voici comment ouvrir ton compte d'électricité.",
        "steps": [
            {"title": "Rassemble tes infos", "detail": "Adresse, date d'emménagement, NAS, preuve d'identité, références de crédit ou caution."},
            {"title": "Appelle ou va en ligne", "detail": "1 888 385-7252 ou hydroquebec.com. Aussi via l'app Hydro-Québec."},
            {"title": "Confirme la date d'activation", "detail": "Tu peux choisir la date exacte. Le service est généralement actif le jour même ou le lendemain."},
            {"title": "Configure ton paiement", "detail": "Préautorisé, paiement égal, ou facture mensuelle. L'app permet de suivre ta consommation."},
        ],
        "resources": [
            {"label": "Hydro-Québec", "url": "https://www.hydroquebec.com"},
            {"label": "Espace client", "url": "https://www.hydroquebec.com/residentiel/espace-clients/"},
        ],
        "faq": [
            {"q": "Dois-je payer un dépôt?", "a": "Possible si tu n'as pas d'historique de crédit. Sinon non."},
            {"q": "C'est combien par mois?", "a": "Moyenne ~80-120$ pour un 4½ chauffé à l'électricité, selon la saison."},
        ],
    },
    {
        "slug": "cnesst-accident-travail",
        "title": "Accident de travail (CNESST)",
        "category": "Travail",
        "icon": "Briefcase",
        "color": "#00D084",
        "short_description": "Blessé au travail? Voici comment faire ta réclamation.",
        "steps": [
            {"title": "Avise ton employeur immédiatement", "detail": "Le plus tôt possible. Idéalement par écrit. C'est ton droit le plus fondamental."},
            {"title": "Consulte un médecin", "detail": "Le médecin doit remplir une 'Attestation médicale CNESST'. Garde une copie!"},
            {"title": "Remplis le formulaire de réclamation", "detail": "Formulaire 'Réclamation du travailleur' à envoyer à la CNESST dans les 6 mois."},
            {"title": "Suis ton dossier", "detail": "La CNESST a 20 jours pour répondre. Tu peux contester une décision défavorable."},
        ],
        "resources": [
            {"label": "CNESST", "url": "https://www.cnesst.gouv.qc.ca"},
            {"label": "Mon Espace CNESST", "url": "https://www.cnesst.gouv.qc.ca/fr/mon-espace"},
        ],
        "faq": [
            {"q": "Je suis remboursé pendant l'arrêt?", "a": "Oui, 90% de ton salaire net pendant l'incapacité."},
            {"q": "Mon boss me menace de me congédier", "a": "C'est ILLÉGAL. Contacte la CNESST immédiatement."},
        ],
    },
]


@api_router.get("/guides")
async def list_guides():
    guides = await db.guides.find({}, {"_id": 0}).to_list(200)
    return guides


@api_router.get("/guides/{slug}")
async def get_guide(slug: str):
    guide = await db.guides.find_one({"slug": slug}, {"_id": 0})
    if not guide:
        raise HTTPException(status_code=404, detail="Guide introuvable")
    return guide


@api_router.post("/admin/seed-guides")
async def seed_guides():
    """Seed default guides. Idempotent."""
    count = 0
    for g in GUIDES_SEED:
        existing = await db.guides.find_one({"slug": g["slug"]})
        if not existing:
            await db.guides.insert_one({"id": str(uuid.uuid4()), **g})
            count += 1
    return {"seeded": count, "total": len(GUIDES_SEED)}


# ============ PAYMENTS (Stripe) ============
class CheckoutPayload(BaseModel):
    package_id: str
    origin_url: str


@api_router.get("/payments/packages")
async def list_packages():
    """Public list of premium packages."""
    return PREMIUM_PACKAGES


def _make_stripe_checkout(request: Request) -> StripeCheckout:
    """Build a configured StripeCheckout client for this request."""
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe non configuré")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)


@api_router.post("/payments/checkout")
async def create_checkout(payload: CheckoutPayload, request: Request):
    user = await require_user(request)
    pkg = PREMIUM_PACKAGES.get(payload.package_id)
    if not pkg:
        raise HTTPException(status_code=400, detail="Forfait invalide")

    stripe_checkout = _make_stripe_checkout(request)

    success_url = f"{payload.origin_url.rstrip('/')}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{payload.origin_url.rstrip('/')}/pricing"
    metadata = {
        "user_id": user["user_id"],
        "email": user["email"],
        "package_id": payload.package_id,
        "days": str(pkg["days"]),
    }
    req = CheckoutSessionRequest(
        amount=float(pkg["amount"]),
        currency=pkg["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: Optional[CheckoutSessionResponse] = None
    try:
        session = await stripe_checkout.create_checkout_session(req)
    except Exception as e:
        logger.exception("Stripe checkout creation failed")
        raise HTTPException(status_code=500, detail=f"Erreur Stripe: {str(e)}")
    if session is None:
        raise HTTPException(status_code=500, detail="Erreur Stripe: session vide")

    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "user_id": user["user_id"],
        "email": user["email"],
        "package_id": payload.package_id,
        "amount": float(pkg["amount"]),
        "currency": pkg["currency"],
        "days": pkg["days"],
        "metadata": metadata,
        "status": "initiated",
        "payment_status": "pending",
        "premium_granted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


async def _grant_premium_if_paid(session_id: str, status_obj: CheckoutStatusResponse):
    """Idempotently grant premium days when payment is confirmed."""
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        logger.warning("Transaction not found for session_id=%s", session_id)
        return None

    update = {
        "status": status_obj.status,
        "payment_status": status_obj.payment_status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if status_obj.payment_status == "paid" and not tx.get("premium_granted"):
        days = int(tx.get("days", 30))
        user = await db.users.find_one({"user_id": tx["user_id"]}, {"_id": 0})
        now = datetime.now(timezone.utc)
        current = user.get("premium_until") if user else None
        if isinstance(current, str):
            try:
                current = datetime.fromisoformat(current)
            except Exception:
                current = None
        if current and current.tzinfo is None:
            current = current.replace(tzinfo=timezone.utc)
        base = current if (current and current > now) else now
        new_until = (base + timedelta(days=days)).isoformat()
        await db.users.update_one(
            {"user_id": tx["user_id"]},
            {"$set": {"premium_until": new_until}},
        )
        update["premium_granted"] = True
        update["premium_until"] = new_until
        logger.info("Premium granted: user=%s until=%s", tx["user_id"], new_until)

    await db.payment_transactions.update_one(
        {"session_id": session_id}, {"$set": update}
    )
    return update


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    user = await require_user(request)
    tx = await db.payment_transactions.find_one(
        {"session_id": session_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction introuvable")

    stripe_checkout = _make_stripe_checkout(request)

    status_obj: Optional[CheckoutStatusResponse] = None
    try:
        status_obj = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        logger.exception("Stripe status check failed")
        raise HTTPException(status_code=500, detail=f"Erreur Stripe: {str(e)}")
    if status_obj is None:
        raise HTTPException(status_code=500, detail="Erreur Stripe: statut vide")

    await _grant_premium_if_paid(session_id, status_obj)

    tx_after = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    return {
        "status": status_obj.status,
        "payment_status": status_obj.payment_status,
        "amount_total": status_obj.amount_total,
        "currency": status_obj.currency,
        "premium_granted": tx_after.get("premium_granted", False) if tx_after else False,
        "premium_until": tx_after.get("premium_until") if tx_after else None,
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    stripe_checkout = _make_stripe_checkout(request)
    try:
        evt = await stripe_checkout.handle_webhook(body, sig)
    except Exception as e:
        logger.exception("Webhook handling failed")
        raise HTTPException(status_code=400, detail=str(e))

    # If we have a session_id, sync status + grant premium
    sess_id = getattr(evt, "session_id", None)
    if sess_id:
        try:
            status_obj = await stripe_checkout.get_checkout_status(sess_id)
            await _grant_premium_if_paid(sess_id, status_obj)
        except Exception:
            logger.exception("Failed to reconcile webhook session %s", sess_id)
    return {"received": True}


@api_router.get("/")
async def root():
    return {"message": "Allô Québec API", "version": "1.0"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Auto-seed guides on first run
    for g in GUIDES_SEED:
        existing = await db.guides.find_one({"slug": g["slug"]})
        if not existing:
            await db.guides.insert_one({"id": str(uuid.uuid4()), **g})
    logger.info("Allô Québec API started. Guides seeded.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
