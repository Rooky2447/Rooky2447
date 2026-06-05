import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const hasProcessed = useRef(false);

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
                // Clear hash and navigate to dashboard
                window.history.replaceState(null, "", window.location.pathname);
                navigate("/dashboard", { replace: true, state: { user: r.data.user } });
            } catch (e) {
                console.error("Auth failed", e);
                navigate("/", { replace: true });
            }
        })();
    }, [navigate, setUser]);

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
