import { Link } from "react-router-dom";
import { Sparkles, MessageCircle } from "lucide-react";

const RecentChats = ({ chats }) => (
    <section className="card-brutal p-6" data-testid="recent-chats-section">
        <h2 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-qc-yellow" strokeWidth={3} /> Récents
        </h2>
        {chats.length === 0 ? (
            <div className="text-center py-8 text-qc-inkSoft">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" strokeWidth={2} />
                <p className="text-sm">Aucune conversation</p>
                <Link to="/chat" className="btn-yellow text-sm mt-4 inline-flex">Commencer</Link>
            </div>
        ) : (
            <ul className="space-y-2">
                {chats.slice(0, 6).map((c) => (
                    <li key={c.session_id}>
                        <Link
                            to={`/chat?s=${c.session_id}`}
                            className="block p-3 bg-white border-2 border-qc-ink rounded-xl shadow-brutalSm hover:-translate-y-0.5 hover:shadow-brutal transition-all"
                            data-testid={`chat-history-${c.session_id}`}
                        >
                            <p className="font-bold text-sm truncate">{c.title}</p>
                            <p className="text-xs text-qc-inkSoft">{new Date(c.updated_at).toLocaleDateString("fr-CA")}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        )}
    </section>
);

export default RecentChats;
