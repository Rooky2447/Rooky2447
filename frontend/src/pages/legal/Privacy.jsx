import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Section = ({ children }) => (
    <section className="card-brutal p-6 sm:p-8 mb-6 space-y-3 text-qc-inkSoft leading-relaxed">{children}</section>
);

const Privacy = () => (
    <div className="min-h-screen bg-qc-cream flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
            <h1 className="font-heading font-black text-4xl sm:text-5xl mb-3">Politique de confidentialité</h1>
            <p className="text-qc-inkSoft mb-8">Dernière mise à jour : juin 2026 · Conforme à la Loi 25 (Québec)</p>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">Données qu&apos;on collecte</h2>
                <p>Quand tu te crées un compte avec Google :</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Ton adresse courriel</li>
                    <li>Ton nom et ta photo de profil Google</li>
                    <li>Un identifiant unique interne</li>
                </ul>
                <p>Quand tu utilises l&apos;app :</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Tes messages au chat IA (sauvegardés pour ton historique)</li>
                    <li>Tes rappels d&apos;échéances</li>
                    <li>Tes paiements (gérés par Stripe — on ne stocke JAMAIS ton numéro de carte)</li>
                </ul>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">Ce qu&apos;on NE FAIT PAS</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>On ne vend pas tes données. Jamais.</li>
                    <li>On ne fait pas de publicité ciblée.</li>
                    <li>On ne partage rien avec le gouvernement, RAMQ, SAAQ ou Revenu Québec.</li>
                </ul>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">Sous-traitants utilisés</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li><b>Anthropic (Claude IA)</b> — traite tes messages pour générer les réponses (États-Unis)</li>
                    <li><b>Google OAuth</b> — pour la connexion sécurisée</li>
                    <li><b>Stripe</b> — pour les paiements (PCI-DSS, Canada/US)</li>
                    <li><b>MongoDB Atlas</b> — stockage de tes données</li>
                </ul>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">Tes droits (Loi 25)</h2>
                <p>En tant que résident québécois, tu as le droit de :</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Accéder à tes données (on te les envoie sur demande)</li>
                    <li>Les corriger ou les supprimer</li>
                    <li>Retirer ton consentement (= supprimer ton compte)</li>
                    <li>Te plaindre à la Commission d&apos;accès à l&apos;information du Québec</li>
                </ul>
                <p>Pour exercer un droit : écris-nous à <b>privacy@alloquebec.app</b> (à configurer).</p>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">Sécurité</h2>
                <p>HTTPS partout, sessions chiffrées via cookies httpOnly, mots de passe jamais stockés (on utilise Google OAuth). Aucune donnée bancaire n&apos;est traitée par nos serveurs.</p>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">Conservation</h2>
                <p>Tes données sont gardées tant que ton compte est actif. Si tu supprimes ton compte, tout est effacé sous 30 jours (sauf obligations légales comme les factures Stripe — 7 ans).</p>
            </Section>
        </main>
        <Footer />
    </div>
);

export default Privacy;
