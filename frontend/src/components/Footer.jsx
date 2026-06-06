import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => (
    <footer className="border-t-2 border-qc-ink py-8 px-4 sm:px-6 bg-qc-cream mt-auto">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-6 items-start">
            <div>
                <Link to="/" className="flex items-center gap-2 mb-2" data-testid="footer-logo">
                    <div className="w-8 h-8 bg-qc-yellow border-2 border-qc-ink rounded-lg shadow-brutalSm flex items-center justify-center font-black">
                        Q
                    </div>
                    <span className="font-heading font-black">Allô Québec</span>
                </Link>
                <p className="text-sm text-qc-inkSoft flex items-center gap-1">
                    Fait <Heart className="w-3 h-3 fill-qc-red text-qc-red" /> au Québec
                </p>
            </div>
            <div>
                <p className="font-bold text-sm mb-2">Légal</p>
                <ul className="space-y-1 text-sm text-qc-inkSoft">
                    <li><Link to="/legal/privacy" className="hover:underline" data-testid="footer-privacy">Politique de confidentialité</Link></li>
                    <li><Link to="/legal/terms" className="hover:underline" data-testid="footer-terms">Conditions d&apos;utilisation</Link></li>
                    <li><Link to="/legal/disclaimer" className="hover:underline" data-testid="footer-disclaimer">Avis important</Link></li>
                </ul>
            </div>
            <div>
                <p className="font-bold text-sm mb-2">Produit</p>
                <ul className="space-y-1 text-sm text-qc-inkSoft">
                    <li><Link to="/guides" className="hover:underline">Guides</Link></li>
                    <li><Link to="/pricing" className="hover:underline">Tarifs</Link></li>
                    <li><Link to="/account" className="hover:underline">Mon compte</Link></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-qc-ink/10 text-xs text-qc-inkSoft text-center sm:text-left">
            Allô Québec n&apos;est PAS affilié au gouvernement du Québec ni à Revenu Québec, RAMQ, SAAQ, etc. C&apos;est un outil d&apos;information seulement — pas un conseil juridique, médical ou fiscal.
        </div>
    </footer>
);

export default Footer;
