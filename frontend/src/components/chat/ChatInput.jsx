import { Link } from "react-router-dom";
import { Send, AlertTriangle, Crown } from "lucide-react";

const ChatInput = ({ input, setInput, onSubmit, sending, limitHit }) => (
    <div className="border-t-2 border-qc-ink p-3 sm:p-4 bg-qc-cream">
        {limitHit && (
            <div className="mb-3 p-3 bg-qc-red/10 border-2 border-qc-red rounded-xl flex items-center gap-3" data-testid="limit-banner">
                <AlertTriangle className="w-5 h-5 text-qc-red flex-shrink-0" strokeWidth={3} />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">Limite mensuelle atteinte</p>
                    <p className="text-xs text-qc-inkSoft">Passe Pro pour des messages IA illimités.</p>
                </div>
                <Link to="/pricing" className="btn-yellow text-xs py-2 px-3" data-testid="limit-upgrade-btn">
                    <Crown className="w-3.5 h-3.5" strokeWidth={3} /> Pro
                </Link>
            </div>
        )}
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="flex gap-2"
            data-testid="chat-form"
        >
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écris ta question ici..."
                className="input-brutal flex-1"
                disabled={sending}
                data-testid="chat-input"
            />
            <button
                type="submit"
                disabled={sending || !input.trim()}
                className="btn-yellow px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="chat-send-btn"
            >
                <Send className="w-5 h-5" strokeWidth={3} />
            </button>
        </form>
    </div>
);

export default ChatInput;
