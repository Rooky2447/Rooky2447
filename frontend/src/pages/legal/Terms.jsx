import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Section = ({ children }) => (
    <section className="card-brutal p-6 sm:p-8 mb-6 space-y-3 text-qc-inkSoft leading-relaxed">{children}</section>
);

const Terms = () => (
    <div className="min-h-screen bg-qc-cream flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
            <h1 className="font-heading font-black text-4xl sm:text-5xl mb-3">Conditions d&apos;utilisation</h1>
            <p className="text-qc-inkSoft mb-8">Dernière mise à jour : juin 2026</p>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">1. Ce qu&apos;est Allô Québec</h2>
                <p>Allô Québec est un outil <b>d&apos;information</b> qui aide à comprendre les démarches administratives au Québec. Ce n&apos;est PAS un service du gouvernement et ce n&apos;est PAS un conseil juridique, médical, fiscal ou financier.</p>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">2. Tes responsabilités</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Fournir des infos exactes lors de l&apos;inscription</li>
                    <li>Ne pas partager ton accès</li>
                    <li>Ne pas utiliser l&apos;IA pour des fins malveillantes ou illégales</li>
                    <li>Vérifier les infos importantes auprès des sources officielles (RAMQ, SAAQ, etc.)</li>
                </ul>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">3. Plan Pro et paiements</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Le plan Pro est <b>4,99 $ CAD par 30 jours</b>, paiement unique (pas d&apos;abonnement auto)</li>
                    <li>L&apos;accès Pro débute au moment du paiement confirmé</li>
                    <li>Pas de remboursement après activation (sauf cas exceptionnels — écris-nous)</li>
                    <li>Tu peux arrêter de renouveler en tout temps, sans cancellation</li>
                </ul>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">4. Limitations de responsabilité</h2>
                <p>Les réponses de l&apos;IA peuvent contenir des <b>inexactitudes</b>. Les règles gouvernementales changent. Avant toute démarche importante (déclaration d&apos;impôts, signature de bail, etc.), <b>vérifie auprès de la source officielle</b>.</p>
                <p>Allô Québec ne peut être tenu responsable des décisions prises sur la base de ses réponses.</p>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">5. Suspension de compte</h2>
                <p>On peut suspendre un compte qui abuse du service (spam, contenu illégal, tentatives de hacking). Le solde Pro restant n&apos;est pas remboursé en cas d&apos;abus.</p>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">6. Modifications</h2>
                <p>Ces conditions peuvent évoluer. On t&apos;avertira par courriel pour tout changement majeur.</p>
            </Section>

            <Section>
                <h2 className="font-heading font-bold text-2xl text-qc-ink">7. Juridiction</h2>
                <p>Ces conditions sont régies par les lois du Québec. Tout litige sera tranché par les tribunaux du district judiciaire de Montréal.</p>
            </Section>
        </main>
        <Footer />
    </div>
);

export default Terms;
