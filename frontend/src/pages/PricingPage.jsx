import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Check, Sparkles, Crown, Loader2, MessageCircle, Mail, FolderLock, BadgeCheck } from "lucide-react";

const FREE_BENEFITS = [
    { icon: MessageCircle, label: "10 messages IA / mois" },
    { icon: Check, label: "Tous les guides pratiques" },
    { icon: Check, label: "Rappels d'échéances illimités" },
];

const PRO_BENEFITS = [
    { icon: Sparkles, label: "Messages IA illimités" },
    { icon: BadgeCheck, label: "Badge Pro sur ton profil" },
    { icon: Check, label: "Tous les guides + nouveautés en priorité" },
    { icon: Mail, label: "Rappels par courriel (à venir)" },
    { icon: FolderLock, label: "Dossier privé sécurisé (à venir)" },
    { icon: Check, label: "Support prioritaire" },
];

const PricingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState(null);

    useEffect(() => {
        api.get("/payments/packages").then((r) => setPkg(r.data.premium_monthly));
        if (user) {
            api.get("/me/usage").then((r) => setUsage(r.data)).catch(() => {});
        }
    }, [user]);

    const startCheckout = async () => {
        if (!user) {
            // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
            const redirectUrl = window.location.origin + "/pricing";
            window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
            return;
        }
        setLoading(true);
        try {
            const r = await api.post("/payments/checkout", {
                package_id: "premium_monthly",
                origin_url: window.location.origin,
            });
            if (r.data?.url) {
                window.location.href = r.data.url;
            }
        } catch (e) {
            alert(e?.response?.data?.detail || "Erreur lors de la création de la session de paiement.");
        } finally {
            setLoading(false);
        }
    };

    const isPro = usage?.premium === true;

    return (
        <div className="min-h-screen bg-qc-cream">
            <Header />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                <div className="text-center mb-12 animate-fade-up">
                    <span className="badge-brutal mb-4">
                        <Crown className="w-3 h-3" strokeWidth={3} /> Premium
                    </span>
                    <h1 className="font-heading font-black text-4xl sm:text-6xl tracking-tight">
                        Passe à <span className="bg-qc-yellow border-2 border-qc-ink rounded-xl px-3 inline-block -rotate-1 shadow-brutal">Allô Québec Pro</span>
                    </h1>
                    <p className="mt-5 text-lg text-qc-inkSoft max-w-2xl mx-auto">
                        Débloque l&apos;IA illimitée pour démêler toutes tes démarches sans limite. Annule en tout temps.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* FREE */}
                    <div className="card-brutal p-8" data-testid="plan-free">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-heading font-bold text-2xl">Gratuit</h2>
                            <span className="badge-brutal" style={{ background: "#4A4A4A" }}>Tu es ici</span>
                        </div>
                        <p className="font-black text-4xl mb-1">0$ <span className="text-lg font-normal text-qc-inkSoft">/ mois</span></p>
                        <p className="text-sm text-qc-inkSoft mb-6">Pour découvrir.</p>
                        <ul className="space-y-3 mb-6">
                            {FREE_BENEFITS.map((b) => {
                                const Icon = b.icon;
                                return (
                                    <li key={b.label} className="flex items-start gap-2">
                                        <span className="w-6 h-6 bg-qc-green border-2 border-qc-ink rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                        </span>
                                        <span className="font-medium">{b.label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                        {usage && !isPro && (
                            <div className="p-3 bg-qc-cream border-2 border-qc-ink rounded-xl text-sm">
                                <p className="font-bold">Ton utilisation ce mois</p>
                                <p className="text-qc-inkSoft">{usage.used} / {usage.limit} messages utilisés</p>
                            </div>
                        )}
                    </div>

                    {/* PRO */}
                    <div className="card-brutal p-8 bg-qc-yellow relative" data-testid="plan-pro">
                        <div className="absolute -top-4 right-6 badge-brutal" style={{ background: "#FF5757" }}>
                            <Sparkles className="w-3 h-3" strokeWidth={3} /> Populaire
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <Crown className="w-6 h-6" strokeWidth={3} />
                            <h2 className="font-heading font-bold text-2xl">Pro</h2>
                        </div>
                        <p className="font-black text-4xl mb-1">
                            {pkg ? `${pkg.amount.toFixed(2)}$ ` : "—"}
                            <span className="text-lg font-normal text-qc-ink/70">CAD / 30 jours</span>
                        </p>
                        <p className="text-sm text-qc-ink/70 mb-6">Tout pour démêler ta vie administrative.</p>
                        <ul className="space-y-3 mb-6">
                            {PRO_BENEFITS.map((b) => {
                                const Icon = b.icon;
                                return (
                                    <li key={b.label} className="flex items-start gap-2">
                                        <span className="w-6 h-6 bg-qc-ink border-2 border-qc-ink rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Icon className="w-3.5 h-3.5 text-qc-yellow" strokeWidth={3} />
                                        </span>
                                        <span className="font-medium">{b.label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                        {isPro ? (
                            <button
                                disabled
                                className="btn-ink w-full text-base opacity-90"
                                data-testid="already-pro-btn"
                            >
                                <BadgeCheck className="w-5 h-5" strokeWidth={3} /> Tu es déjà Pro
                            </button>
                        ) : (
                            <button
                                onClick={startCheckout}
                                disabled={loading || !pkg}
                                className="btn-ink w-full text-base"
                                data-testid="checkout-btn"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} /> Redirection...
                                    </>
                                ) : (
                                    <>
                                        <Crown className="w-5 h-5" strokeWidth={3} /> Devenir Pro maintenant
                                    </>
                                )}
                            </button>
                        )}
                        <p className="text-xs text-qc-ink/60 mt-3 text-center">
                            Paiement sécurisé via Stripe · Renouvellement manuel chaque 30 jours
                        </p>
                    </div>
                </div>

                <div className="mt-12 max-w-3xl mx-auto card-brutal p-6 sm:p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">Questions fréquentes</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="font-bold">C&apos;est un abonnement automatique?</p>
                            <p className="text-qc-inkSoft text-sm">Non. Chaque paiement débloque 30 jours. Tu renouvelles seulement si tu le veux.</p>
                        </div>
                        <div>
                            <p className="font-bold">Je peux annuler?</p>
                            <p className="text-qc-inkSoft text-sm">Comme c&apos;est pas un abonnement récurrent, t&apos;as rien à canceller. Juste arrête de renouveler.</p>
                        </div>
                        <div>
                            <p className="font-bold">Mes données sont en sécurité?</p>
                            <p className="text-qc-inkSoft text-sm">Oui. Aucun numéro de carte n&apos;est stocké chez nous. Stripe gère le paiement (PCI-DSS).</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PricingPage;
