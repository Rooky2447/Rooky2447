import { MessageCircle } from "lucide-react";

const ChatEmptyState = ({ suggestions, onSelect }) => (
    <div className="text-center py-10 animate-fade-up">
        <div className="w-16 h-16 bg-qc-blue border-2 border-qc-ink rounded-2xl shadow-brutal mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="w-8 h-8" strokeWidth={3} />
        </div>
        <h2 className="font-heading font-bold text-2xl mb-2">Salut! Qu&apos;est-ce que je peux t&apos;aider à démêler?</h2>
        <p className="text-qc-inkSoft mb-6">Pose-moi n&apos;importe quoi sur les démarches au Québec.</p>
        <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
            {suggestions.map((s, i) => (
                <button
                    key={s}
                    onClick={() => onSelect(s)}
                    className="text-left p-3 bg-white border-2 border-qc-ink rounded-xl shadow-brutalSm hover:-translate-y-0.5 hover:shadow-brutal transition-all text-sm font-medium"
                    data-testid={`suggestion-${i}`}
                >
                    {s}
                </button>
            ))}
        </div>
    </div>
);

export default ChatEmptyState;
