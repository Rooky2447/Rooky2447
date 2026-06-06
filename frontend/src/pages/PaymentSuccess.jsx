import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CheckCircle2, XCircle, Sparkles, ArrowRight } from "lucide-react";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10;

const PaymentSuccess = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const [status, setStatus] = useState("polling"); // polling | success | failed | expired
    const [details, setDetails] = useState(null);
    const attemptsRef = useRef(0);

    useEffect(() => {
        const sessionId = params.get("session_id");
        if (!sessionId) {
            navigate("/pricing", { replace: true });
            return;
        }

        let timer = null;
        const poll = async () => {
            try {
                const r = await api.get(`/payments/status/${sessionId}`);
                setDetails(r.data);
                if (r.data.payment_status === "paid") {
                    setStatus("success");
                    await checkAuth();
                    return;
                }
                if (r.data.status === "expired") {
                    setStatus("expired");
                    return;
                }
                attemptsRef.current += 1;
                if (attemptsRef.current >= MAX_ATTEMPTS) {
                    setStatus("failed");
                    return;
                }
                timer = setTimeout(poll, POLL_INTERVAL_MS);
            } catch (e) {
                attemptsRef.current += 1;
                if (attemptsRef.current >= MAX_ATTEMPTS) {
                    setStatus("failed");
                    return;
                }
                timer = setTimeout(poll, POLL_INTERVAL_MS);
            }
        };
        poll();
        return () => timer && clearTimeout(timer);
    }, [params, navigate, checkAuth]);

    return (
        <div className="min-h-screen bg-qc-cream flex items-center justify-center p-4">
            <div className="card-brutal p-8 sm:p-10 max-w-md w-full" data-testid="payment-result-card">
                {status === "polling" && (
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto animate-spin mb-4" strokeWidth={2.5} />
                        <h1 className="font-heading font-black text-2xl mb-2">Vérification du paiement...</h1>
                        <p className="text-qc-inkSoft">Ça prend juste quelques secondes.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-qc-green border-2 border-qc-ink rounded-2xl shadow-brutal mx-auto mb-5 flex items-center justify-center">
                            <CheckCircle2 className="w-9 h-9 text-white" strokeWidth={3} />
                        </div>
                        <span className="badge-brutal mb-3" style={{ background: "#FFD500", color: "#111" }}>
                            <Sparkles className="w-3 h-3" strokeWidth={3} /> Tu es maintenant Pro
                        </span>
                        <h1 className="font-heading font-black text-3xl mb-2">Merci! 🎉</h1>
                        <p className="text-qc-inkSoft mb-6">
                            Ton accès Premium est actif pour 30 jours. Profite de l&apos;IA illimitée!
                        </p>
                        {details?.premium_until && (
                            <p className="text-sm text-qc-inkSoft mb-6">
                                Valide jusqu&apos;au {new Date(details.premium_until).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        )}
                        <Link to="/chat" className="btn-yellow w-full" data-testid="goto-chat-btn">
                            Aller au chat IA <ArrowRight className="w-5 h-5" strokeWidth={3} />
                        </Link>
                    </div>
                )}

                {(status === "failed" || status === "expired") && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-qc-red border-2 border-qc-ink rounded-2xl shadow-brutal mx-auto mb-5 flex items-center justify-center">
                            <XCircle className="w-9 h-9 text-white" strokeWidth={3} />
                        </div>
                        <h1 className="font-heading font-black text-2xl mb-2">
                            {status === "expired" ? "Session expirée" : "Paiement non confirmé"}
                        </h1>
                        <p className="text-qc-inkSoft mb-6">
                            On n&apos;a pas pu confirmer ton paiement. Si tu vois un débit sur ta carte, attends quelques minutes et rafraîchis. Sinon réessaie.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Link to="/pricing" className="btn-yellow" data-testid="retry-pricing-btn">Réessayer</Link>
                            <Link to="/dashboard" className="btn-white text-sm">Retour au tableau</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
