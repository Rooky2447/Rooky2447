import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home } from "lucide-react";

const NotFound = () => (
    <div className="min-h-screen bg-qc-cream flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="card-brutal p-8 sm:p-12 max-w-md w-full text-center">
                <p className="font-heading font-black text-8xl mb-2">404</p>
                <h1 className="font-heading font-bold text-2xl mb-3">Page introuvable</h1>
                <p className="text-qc-inkSoft mb-6">
                    On dirait que cette page a pris l&apos;bord. Pas de stress, retourne à l&apos;accueil.
                </p>
                <Link to="/" className="btn-yellow inline-flex" data-testid="notfound-home-btn">
                    <Home className="w-5 h-5" strokeWidth={3} /> Retour à l&apos;accueil
                </Link>
            </div>
        </main>
        <Footer />
    </div>
);

export default NotFound;
