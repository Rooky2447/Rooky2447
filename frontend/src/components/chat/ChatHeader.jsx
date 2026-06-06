import { Link } from "react-router-dom";
import { Sparkles, Crown } from "lucide-react";

const ChatHeader = ({ usage }) => (
    <div className="border-b-2 border-qc-ink px-5 py-4 flex items-center gap-3 bg-qc-yellow/30">
        <div className="w-10 h-10 bg-qc-yellow border-2 border-qc-ink rounded-xl shadow-brutalSm flex items-center justify-center">
            <Sparkles className="w-5 h-5" strokeWidth={3} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-heading font-bold">Allô Québec · Chat IA</p>
            <p className="text-xs text-qc-inkSoft">Powered by Claude · Réponses informatives seulement</p>
        </div>
        {usage && (
            usage.premium ? (
                <span
                    className="badge-brutal hidden sm:inline-flex"
                    style={{ background: "#FFD500", color: "#111" }}
                    data-testid="chat-pro-badge"
                >
                    <Crown className="w-3 h-3" strokeWidth={3} /> Pro · Illimité
                </span>
            ) : (
                <Link
                    to="/pricing"
                    className="text-xs font-bold border-2 border-qc-ink rounded-lg px-2 py-1 bg-white shadow-brutalSm hover:bg-qc-yellow whitespace-nowrap"
                    data-testid="chat-usage-counter"
                    title="Passe Pro pour illimité"
                >
                    {usage.remaining}/{usage.limit} restants
                </Link>
            )
        )}
    </div>
);

export default ChatHeader;
