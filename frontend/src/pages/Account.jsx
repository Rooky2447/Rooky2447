import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Crown, Calendar, MessageCircle, Mail, LogOut, ArrowRight } from "lucide-react";

const Account = () => {
    const { user, logout } = useAuth();
    const [usage, setUsage] = useState(null);

    useEffect(() => {
        api.get("/me/usage").then((r) => setUsage(r.data)).catch(() => {});
    }, []);

    if (!user) return null;

    const premiumUntilStr = usage?.premium_until
        ? new Date(usage.premium_until).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })
        : null;

    return (
        <div className="min-h-screen bg-qc-cream flex flex-col">
            <Header />
            <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
                <h1 className="font-heading font-black text-4xl sm:text-5xl mb-8">Mon compte</h1>

                <div className="card-brutal p-6 sm:p-8 mb-6" data-testid="account-profile">
                    <div className="flex items-center gap-4 mb-4">
                        {user.picture && (
                            <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full border-2 border-qc-ink" />
                        )}
                        <div>
                            <p className="font-heading font-bold text-2xl">{user.name}</p>
                            <p className="text-qc-inkSoft text-sm">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="card-brutal p-6 sm:p-8 mb-6" style={{ background: usage?.premium ? "#FFD500" : "#FFFDF9" }} data-testid="account-plan">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                            <Crown className="w-6 h-6" strokeWidth={3} />
                            <h2 className="font-heading font-bold text-2xl">
                                {usage?.premium ? "Plan Pro" : "Plan Gratuit"}
                            </h2>
                        </div>
                        {!usage?.premium && (
                            <Link to="/pricing" className="btn-ink text-sm" data-testid="account-upgrade-btn">
                                Passer Pro <ArrowRight className="w-4 h-4" strokeWidth={3} />
                            </Link>
                        )}
                    </div>

                    {usage?.premium ? (
                        <div className="space-y-2">
                            <p className="flex items-center gap-2 font-bold">
                                <Calendar className="w-4 h-4" strokeWidth={3} />
                                Valide jusqu&apos;au {premiumUntilStr}
                            </p>
                            <p className="text-sm">Messages IA illimités cette période.</p>
                            <Link to="/pricing" className="btn-ink text-sm inline-flex mt-3" data-testid="account-renew-btn">
                                Renouveler (30 jours +)
                            </Link>
                        </div>
                    ) : (
                        usage && (
                            <div className="space-y-2 text-qc-inkSoft">
                                <p className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" strokeWidth={3} />
                                    {usage.used} / {usage.limit} messages IA utilisés ce mois
                                </p>
                                <div className="w-full bg-qc-cream border-2 border-qc-ink rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full bg-qc-yellow transition-all"
                                        style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>

                <div className="card-brutal p-6 sm:p-8 mb-6 bg-white">
                    <h2 className="font-heading font-bold text-xl mb-3 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-qc-blue" strokeWidth={3} /> Préférences
                    </h2>
                    <p className="text-sm text-qc-inkSoft mb-2">Les rappels par courriel et le dossier privé arrivent bientôt pour les utilisateurs Pro.</p>
                </div>

                <div className="card-brutal p-6 sm:p-8 bg-qc-red/10">
                    <h2 className="font-heading font-bold text-xl mb-2">Zone dangereuse</h2>
                    <p className="text-sm text-qc-inkSoft mb-4">Te déconnecter de ton compte sur cet appareil.</p>
                    <button onClick={logout} className="btn-ink text-sm" data-testid="account-logout-btn">
                        <LogOut className="w-4 h-4" strokeWidth={3} /> Me déconnecter
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Account;
