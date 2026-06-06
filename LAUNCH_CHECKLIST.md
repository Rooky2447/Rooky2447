# 🚀 Allô Québec — Checklist de lancement

## ✅ Déjà fait
- [x] App fonctionnelle (Landing, Dashboard, Chat IA, Guides, Pricing, Premium, Account)
- [x] Authentification Google sécurisée via Emergent Auth
- [x] IA Claude Sonnet 4.5 connectée
- [x] Paiements Stripe (mode test) — 4.99$ CAD / 30 jours
- [x] 8 guides seedés (RAMQ, SAAQ, GAMF, impôts, logement, AFE, Hydro, CNESST)
- [x] Limite 10 msg/mois gratuit, illimité Pro
- [x] Pages légales (Politique confidentialité, Conditions, Avis important) — conformes Loi 25
- [x] Page 404
- [x] Footer avec liens légaux
- [x] SEO meta tags (title, description, OG)
- [x] Tests backend 26/26 ✓

## 🔴 À faire AVANT le lancement (5 étapes)

### 1. Acheter ton domaine (15 min)
- alloquebec.com / alloquebec.app / .ca = idéal
- Recommandé : **Namecheap** ou **Cloudflare** (~12-15$/an)
- Configure-le après le déploiement

### 2. Switcher Stripe en MODE LIVE (10 min)
- Crée un compte Stripe sur https://stripe.com (gratuit, environ 24h pour validation Canada)
- Récupère ta **clé secrète LIVE** (commence par `sk_live_`)
- Dans `/app/backend/.env`, remplace :
  ```
  STRIPE_API_KEY=sk_test_emergent
  ```
  par
  ```
  STRIPE_API_KEY=sk_live_TON_VRAIE_CLE_ICI
  ```
- ⚠️ **JAMAIS commit ta clé live dans Git**

### 3. Configurer l'adresse courriel de contact (10 min)
- Crée `privacy@alloquebec.com` (via Google Workspace ~7$/mois ou Zoho Mail gratuit)
- Ou pour MVP : redirige vers ton email perso depuis le DNS

### 4. Déployer en production (30 min)
- Dans Emergent, clique sur **"Deploy"** dans le menu en haut à droite
- Suis les instructions (le platform gère le HTTPS, scaling, etc.)
- Vérifie que `REACT_APP_BACKEND_URL` dans frontend/.env pointe vers ton URL de prod
- Test le checkout Stripe une fois live avec une vraie carte (5$ que tu pourras te rembourser)

### 5. Brancher l'analytics (15 min) — PostHog est déjà installé!
- PostHog est déjà branché (regarde `frontend/public/index.html` ligne 148)
- Connecte-toi sur https://us.posthog.com pour voir les events live
- Tu vas voir : pages vues, sessions, drop-off, conversion checkout

## 🎯 Plan de distribution (la partie qui rapporte vraiment)

### Semaine 1-2 : Setup contenu
- Compte **TikTok** : @alloquebec → "3 affaires que ton proprio peut PAS faire", "Comment renouveler ton permis en 4 min", "Le truc que personne sait sur la RAMQ"
- Compte **Instagram** Reels : repost des TikTok
- Reddit : crée un compte (vieux compte > 6 mois si tu en as, sinon montrer de la valeur d'abord)

### Semaine 3-4 : Bootstrap utilisateurs
- Publie 3-5x/sem sur TikTok (1-2 min, hook = "Si t'es Québécois t'as JAMAIS su que...")
- Réponds sur r/Quebec et r/montreal aux questions admin avec ton expertise + 1 phrase de fin "j'ai mis ça dans mon outil aussi : alloquebec.com"
- Approche 5 CEGEPs : email à la VP étudiante "outil gratuit pour vos étudiants"

### Mois 2-3 : Premiers payants
- Quand tu hits ~500 utilisateurs gratuits, attends-toi à 5-15 conversions Pro
- Ajoute une vraie promo : "PREMIERMOIS50" pour 50% off
- Demande des témoignages, mets-les sur le landing

### Mois 4-6 : Pivot B2B (où l'argent est vraiment)
- Approche **Carrefours Jeunesse-Emploi** (CJE) : 100+ au QC, 5-15$ par siège/mois
- Approche **CLSCs** : tablette en salle d'attente avec ton outil
- Approche **Universités** (UQAM, U de M, etc.) : intégration dans les services aux étudiants

## 💰 Réaliste sur tes revenus

| Phase | Utilisateurs | Conversion Pro | MRR estimé |
|---|---|---|---|
| Mois 1-3 | 100-500 | 2-5% | 10-125$ |
| Mois 4-6 | 500-2k | 3-5% | 75-500$ |
| Mois 7-12 | 2k-10k | 3-5% + 1-3 B2B | 300-2 500$ |
| Année 2 | 10k+ + 5-15 B2B | — | 2-10k$/mois |

**Objectif Année 1 :** valider la traction et atteindre 1-2k$/mois MRR. Si t'es rendu là à 12 mois, t'as un vrai business et tu peux quitter ton job.

## 📞 Quand tu auras besoin d'aide
- Pas de réponse de l'IA → vérifier `EMERGENT_LLM_KEY` dans backend/.env (ou recharger ton solde sur Profile → Universal Key)
- Stripe ne marche pas en live → vérifier que la clé est bien `sk_live_`, pas `sk_test_`
- Les courriels de rappels (Pro feature à venir) → on bossera dessus la prochaine session

## 🎓 Mantras à garder en tête
1. **Le produit est juste 10%.** Le reste, c'est distribution + contenu + persévérance.
2. **Ship plutôt que peaufiner.** Tu pourrais ajouter 50 features. Lance avec ce que t'as, écoute les vrais users.
3. **Donne 10x plus de valeur que ce que tu prends.** 4.99$/mois pour économiser 10h de stress admin = no-brainer.
4. **Le QC c'est un petit marché mais loyal.** Si tu deviens "celui qui aide les Québécois", tu vas avoir tes 1 000 vrais fans.

Bonne chance! 🍀🇶🇨
