import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const hasProcessed = useRef(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const hash = window.location.hash || "";
        const match = hash.match(/session_id=([^&]+)/);
        if (!match) {
            navigate("/", { replace: true });
            return;
        }
        const sessionId = decodeURIComponent(match[1]);

        (async () => {
            try {
                const r = await api.post("/auth/session", { session_id: sessionId });
                setUser(r.data.user);
                window.history.replaceState(null, "", window.location.pathname);
                navigate("/dashboard", { replace: true, state: { user: r.data.user } });
            } catch (e) {
                console.error("Auth failed", e?.response?.status, e?.response?.data);
                const detail = e?.response?.data?.detail || e?.message || "Erreur inconnue";
                setError(detail);
                // Clear the hash so refreshes don't re-trigger
                window.history.replaceState(null, "", window.location.pathname);
            }
        })();
    }, [navigate, setUser]);

    const retry = () => {
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const redirectUrl = window.location.origin + "/dashboard";
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-qc-cream p-4">
                <div className="card-brutal p-6 sm:p-8 max-w-md w-full" data-testid="auth-error-card">
                    <div className="w-14 h-14 bg-qc-red border-2 border-qc-ink rounded-2xl shadow-brutalSm flex items-center justify-center mb-4">
                        <AlertTriangle className="w-7 h-7 text-white" strokeWidth={3} />
                    </div>
                    <h2 className="font-heading font-black text-2xl mb-2">Connexion échouée</h2>
                    <p className="text-qc-inkSoft mb-2 text-sm">
                        {error}
                    </p>
                    <p className="text-qc-inkSoft mb-6 text-sm">
                        Ça arrive parfois si le lien a été ouvert deux fois ou si la session a expiré. Réessaie&nbsp;:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={retry} className="btn-yellow text-sm flex-1" data-testid="auth-retry-btn">
                            Réessayer avec Google
                            <ArrowRight className="w-4 h-4" strokeWidth={3} />
                        </button>
                        <button onClick={() => navigate("/")} className="btn-white text-sm" data-testid="auth-home-btn">
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-qc-cream">
            <div className="card-brutal p-8 flex flex-col items-center gap-3" data-testid="auth-callback-loader">
                <Loader2 className="w-8 h-8 animate-spin" strokeWidth={2.5} />
                <p className="font-bold">On te connecte...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
