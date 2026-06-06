import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { MessageCircle, BellRing, BookOpen, Sparkles, Zap, ShieldCheck, ArrowRight, MapPin, HeartHandshake } from "lucide-react";

const Landing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleStart = () => {
        if (user) {
            navigate("/dashboard");
            return;
        }
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const redirectUrl = window.location.origin + "/dashboard";
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    return (
        <div className="min-h-screen bg-qc-cream">
            <Header />
            {/* HERO */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-20">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 animate-fade-up">
                        <span className="badge-brutal mb-6" data-testid="hero-badge">
                            <Sparkles className="w-3 h-3" strokeWidth={3} /> Nouveau · Propulsé par IA
                        </span>
                        <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95]">
                            Allô Québec.<br />
                            <span className="inline-block bg-qc-yellow border-2 border-qc-ink rounded-2xl px-4 py-1 mt-3 shadow-brutal -rotate-1">
                                Tes démarches,
                            </span>
                            <br />
                            <span className="text-qc-red">démêlées.</span>
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-qc-inkSoft max-w-xl leading-relaxed">
                            RAMQ, SAAQ, impôts, GAMF, logement... Notre assistant IA en français québécois t&apos;explique
                            tout, étape par étape. Pis y&apos;a même tes rappels d&apos;échéances qui suivent.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <button onClick={handleStart} className="btn-yellow text-base" data-testid="hero-cta-start">
                                Commencer gratuit
                                <ArrowRight className="w-5 h-5" strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                                className="btn-white text-base"
                                data-testid="hero-cta-learn"
                            >
                                Voir comment ça marche
                            </button>
                        </div>
                        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-qc-inkSoft">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-qc-green" strokeWidth={3} /> Données privées</div>
                            <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-qc-blue" strokeWidth={3} /> Réponses en 5 sec</div>
                            <div className="flex items-center gap-1.5"><HeartHandshake className="w-4 h-4 text-qc-red" strokeWidth={3} /> Fait par et pour des Québécois</div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="relative">
                            <div className="card-brutal p-6 rotate-2 relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1543269865-cbf427effbad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHx5b3VuZyUyMGFkdWx0cyUyMGZyaWVuZHMlMjBsYXVnaGluZyUyMGNhZmV8ZW58MHx8fHwxNzgwNjQxODc3fDA&ixlib=rb-4.1.0&q=85"
                                    alt="Jeunes Québécois"
                                    className="w-full h-72 object-cover rounded-xl border-2 border-qc-ink"
                                />
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-qc-blue border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm">
                                        <MessageCircle className="w-6 h-6" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">&quot;Comment renouveler ma carte soleil?&quot;</p>
                                        <p className="text-xs text-qc-inkSoft">Réponse en 4 étapes claires →</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-qc-red border-2 border-qc-ink rounded-2xl shadow-brutal -rotate-6 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <p className="font-black text-3xl">100%</p>
                                    <p className="text-xs font-bold uppercase">Québécois</p>
                                </div>
                            </div>
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-qc-green border-2 border-qc-ink rounded-full shadow-brutal flex items-center justify-center animate-bounce-soft">
                                <MapPin className="w-8 h-8 text-white" strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES BENTO */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="font-heading font-black text-4xl sm:text-5xl">Ce qu&apos;Allô Québec fait pour toi</h2>
                    <p className="mt-3 text-lg text-qc-inkSoft max-w-2xl mx-auto">Trois super-pouvoirs pour traverser l&apos;administration sans perdre la tête.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="card-brutal card-brutal-hover p-6" data-testid="feature-chat">
                        <div className="w-14 h-14 bg-qc-yellow border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm mb-4">
                            <MessageCircle className="w-7 h-7" strokeWidth={3} />
                        </div>
                        <h3 className="font-heading font-bold text-2xl mb-2">Chat IA en français QC</h3>
                        <p className="text-qc-inkSoft leading-relaxed">
                            Pose tes questions normalement. L&apos;IA connaît RAMQ, SAAQ, impôts, logement et te répond avec des étapes claires et des liens officiels.
                        </p>
                    </div>

                    <div className="card-brutal card-brutal-hover p-6 md:translate-y-6" data-testid="feature-reminders">
                        <div className="w-14 h-14 bg-qc-blue border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm mb-4">
                            <BellRing className="w-7 h-7" strokeWidth={3} />
                        </div>
                        <h3 className="font-heading font-bold text-2xl mb-2">Rappels d&apos;échéances</h3>
                        <p className="text-qc-inkSoft leading-relaxed">
                            Carte soleil qui expire? Impôts à faire? Tu reçois un rappel avant la date. Plus jamais en retard.
                        </p>
                    </div>

                    <div className="card-brutal card-brutal-hover p-6" data-testid="feature-guides">
                        <div className="w-14 h-14 bg-qc-red border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm mb-4">
                            <BookOpen className="w-7 h-7 text-white" strokeWidth={3} />
                        </div>
                        <h3 className="font-heading font-bold text-2xl mb-2">Guides étape par étape</h3>
                        <p className="text-qc-inkSoft leading-relaxed">
                            Bibliothèque de guides pratiques sur les démarches les plus communes. Avec FAQ et liens officiels gouv.qc.ca.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
                <div className="card-brutal p-10 sm:p-14 text-center bg-qc-yellow">
                    <h2 className="font-heading font-black text-4xl sm:text-5xl mb-4">Prêt à arrêter de capoter?</h2>
                    <p className="text-lg sm:text-xl text-qc-ink mb-8 max-w-2xl mx-auto">
                        Plus de 8 démarches déjà documentées. L&apos;IA répond 24/7. C&apos;est gratuit pour commencer.
                    </p>
                    <button onClick={handleStart} className="btn-ink text-base" data-testid="bottom-cta-start">
                        Connecte-toi avec Google
                        <ArrowRight className="w-5 h-5" strokeWidth={3} />
                    </button>
                </div>
            </section>

            <footer className="border-t-2 border-qc-ink py-8 px-4 sm:px-6 bg-qc-cream">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="font-bold">Allô Québec · Fait avec ❤ au QC</p>
                    <p className="text-sm text-qc-inkSoft">Info uniquement · Pas un conseil juridique formel</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
