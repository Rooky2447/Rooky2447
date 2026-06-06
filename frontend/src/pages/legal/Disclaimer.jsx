import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertTriangle, ExternalLink } from "lucide-react";

const Disclaimer = () => (
    <div className="min-h-screen bg-qc-cream flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
            <div className="card-brutal p-6 sm:p-8 mb-6 bg-qc-yellow">
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-8 h-8 flex-shrink-0" strokeWidth={3} />
                    <h1 className="font-heading font-black text-3xl sm:text-4xl">Avis important</h1>
                </div>
                <p className="text-qc-ink leading-relaxed">
                    Allô Québec t&apos;aide à <b>comprendre</b> les démarches administratives, mais ce n&apos;est pas un substitut aux services officiels.
                </p>
            </div>

            <div className="card-brutal p-6 sm:p-8 mb-6 space-y-4 leading-relaxed text-qc-inkSoft">
                <div>
                    <h2 className="font-heading font-bold text-xl text-qc-ink mb-1">⚠️ Ce n&apos;est PAS un conseil juridique</h2>
                    <p>Pour les questions de droits du locataire, divorce, contrats, etc. consulte un avocat ou les ressources gratuites :</p>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                        <li><a href="https://www.educaloi.qc.ca" target="_blank" rel="noopener noreferrer" className="underline hover:text-qc-blue inline-flex items-center gap-1">Éducaloi <ExternalLink className="w-3 h-3" /></a></li>
                        <li><a href="https://www.justicepourtous.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-qc-blue inline-flex items-center gap-1">Justice pour tous <ExternalLink className="w-3 h-3" /></a></li>
                    </ul>
                </div>

                <div>
                    <h2 className="font-heading font-bold text-xl text-qc-ink mb-1">⚠️ Ce n&apos;est PAS un conseil médical</h2>
                    <p>Pour un avis médical urgent, appelle <b>811 (Info-Santé)</b> ou le <b>911</b> en urgence.</p>
                </div>

                <div>
                    <h2 className="font-heading font-bold text-xl text-qc-ink mb-1">⚠️ Ce n&apos;est PAS un conseil fiscal</h2>
                    <p>Pour ta déclaration d&apos;impôts, consulte un comptable ou directement <a href="https://www.revenuquebec.ca" target="_blank" rel="noopener noreferrer" className="underline hover:text-qc-blue">Revenu Québec</a>.</p>
                </div>

                <div>
                    <h2 className="font-heading font-bold text-xl text-qc-ink mb-1">⚠️ Vérifie toujours la source officielle</h2>
                    <p>Les règles gouvernementales changent souvent. Pour les décisions importantes, va sur :</p>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                        <li><a href="https://www.quebec.ca" target="_blank" rel="noopener noreferrer" className="underline hover:text-qc-blue">Québec.ca</a> — portail officiel</li>
                        <li><a href="https://www.ramq.gouv.qc.ca" target="_blank" rel="noopener noreferrer" className="underline hover:text-qc-blue">RAMQ</a> — assurance maladie</li>
                        <li><a href="https://saaq.gouv.qc.ca" target="_blank" rel="noopener noreferrer" className="underline hover:text-qc-blue">SAAQ</a> — permis et immatriculation</li>
                        <li><a href="https://www.revenuquebec.ca" target="_blank" rel="noopener noreferrer" className="underline hover:text-qc-blue">Revenu Québec</a> — impôts</li>
                    </ul>
                </div>

                <div>
                    <h2 className="font-heading font-bold text-xl text-qc-ink mb-1">L&apos;IA peut se tromper</h2>
                    <p>Notre IA est puissante, mais elle peut occasionnellement donner des informations imprécises ou périmées. <b>Toujours vérifier</b> avant d&apos;agir sur des questions importantes.</p>
                </div>
            </div>
        </main>
        <Footer />
    </div>
);

export default Disclaimer;
