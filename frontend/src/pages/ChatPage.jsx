import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import { Send, Sparkles, Loader2, MessageCircle, Crown, AlertTriangle } from "lucide-react";

const SUGGESTIONS = [
    "Comment renouveler ma carte d'assurance maladie?",
    "Combien ça coûte un permis de conduire au Québec?",
    "Mon proprio veut augmenter mon loyer de 8%, j'ai le droit de refuser?",
    "Comment trouver un médecin de famille rapidement?",
];

const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [usage, setUsage] = useState(null);
    const [limitHit, setLimitHit] = useState(false);
    const scrollRef = useRef(null);

    const refreshUsage = async () => {
        try {
            const r = await api.get("/me/usage");
            setUsage(r.data);
        } catch (err) {
            console.error("Failed to load usage", err);
        }
    };

    useEffect(() => {
        refreshUsage();
        const params = new URLSearchParams(location.search);
        const s = params.get("s");
        if (s) {
            setSessionId(s);
            (async () => {
                try {
                    const r = await api.get(`/chat/sessions/${s}/messages`);
                    setMessages(r.data);
                } catch (err) {
                    console.error("Failed to load chat messages", err);
                }
            })();
        } else {
            setSessionId(null);
            setMessages([]);
        }
    }, [location.search]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, sending]);

    const send = async (text) => {
        const content = (text ?? input).trim();
        if (!content || sending) return;
        setInput("");
        setSending(true);
        const optimistic = {
            id: "tmp-" + Date.now(),
            role: "user",
            content,
            created_at: new Date().toISOString(),
        };
        setMessages((m) => [...m, optimistic]);
        try {
            const r = await api.post("/chat", { message: content, session_id: sessionId });
            const newSession = r.data.session_id;
            if (!sessionId) {
                setSessionId(newSession);
                navigate(`/chat?s=${newSession}`, { replace: true });
            }
            setMessages((m) => [
                ...m.filter((x) => x.id !== optimistic.id),
                { id: r.data.user_message_id, role: "user", content, created_at: new Date().toISOString() },
                { id: r.data.assistant_message_id, role: "assistant", content: r.data.reply, created_at: new Date().toISOString() },
            ]);
        } catch (e) {
            setMessages((m) => [
                ...m,
                {
                    id: "err-" + Date.now(),
                    role: "assistant",
                    content: "Désolé, ya eu un pépin technique. Réessaie dans quelques secondes svp.",
                    created_at: new Date().toISOString(),
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-qc-cream">
            <Header />
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
                <div className="card-brutal flex-1 flex flex-col overflow-hidden">
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
                                <span className="badge-brutal hidden sm:inline-flex" style={{ background: "#FFD500", color: "#111" }} data-testid="chat-pro-badge">
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

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" data-testid="chat-messages-container">
                        {messages.length === 0 && (
                            <div className="text-center py-10 animate-fade-up">
                                <div className="w-16 h-16 bg-qc-blue border-2 border-qc-ink rounded-2xl shadow-brutal mx-auto mb-4 flex items-center justify-center">
                                    <MessageCircle className="w-8 h-8" strokeWidth={3} />
                                </div>
                                <h2 className="font-heading font-bold text-2xl mb-2">Salut! Qu'est-ce que je peux t'aider à démêler?</h2>
                                <p className="text-qc-inkSoft mb-6">Pose-moi n'importe quoi sur les démarches au Québec.</p>
                                <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                                    {SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={s}
                                            onClick={() => send(s)}
                                            className="text-left p-3 bg-white border-2 border-qc-ink rounded-xl shadow-brutalSm hover:-translate-y-0.5 hover:shadow-brutal transition-all text-sm font-medium"
                                            data-testid={`suggestion-${i}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
                                data-testid={`chat-message-${m.role}`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[75%] border-2 border-qc-ink rounded-2xl p-4 shadow-brutalSm whitespace-pre-wrap leading-relaxed ${
                                        m.role === "user"
                                            ? "bg-qc-blue text-qc-ink rounded-tr-sm"
                                            : "bg-white text-qc-ink rounded-tl-sm"
                                    }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {sending && (
                            <div className="flex justify-start">
                                <div className="bg-white border-2 border-qc-ink rounded-2xl rounded-tl-sm p-4 shadow-brutalSm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                                    <span className="text-sm">L'IA réfléchit...</span>
                                </div>
                            </div>
                        )}
                    </div>

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
                                send();
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
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
