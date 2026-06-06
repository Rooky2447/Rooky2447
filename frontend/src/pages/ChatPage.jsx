import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import { Loader2 } from "lucide-react";

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

    const refreshUsage = useCallback(async () => {
        try {
            const r = await api.get("/me/usage");
            setUsage(r.data);
        } catch (err) {
            console.error("Failed to load usage", err);
        }
    }, []);

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
    }, [location.search, refreshUsage]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, sending]);

    const send = useCallback(async (text) => {
        const content = (text ?? input).trim();
        if (!content || sending) return;
        setInput("");
        setSending(true);
        const optimisticId = "tmp-" + Date.now();
        const optimistic = {
            id: optimisticId,
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
                ...m.filter((x) => x.id !== optimisticId),
                { id: r.data.user_message_id, role: "user", content, created_at: new Date().toISOString() },
                { id: r.data.assistant_message_id, role: "assistant", content: r.data.reply, created_at: new Date().toISOString() },
            ]);
            refreshUsage();
        } catch (e) {
            if (e?.response?.status === 402) {
                setLimitHit(true);
                setMessages((m) => m.filter((x) => x.id !== optimisticId));
                setInput(content);
            } else {
                console.error("Chat send failed", e);
                setMessages((m) => [
                    ...m,
                    {
                        id: "err-" + Date.now(),
                        role: "assistant",
                        content: "Désolé, ya eu un pépin technique. Réessaie dans quelques secondes svp.",
                        created_at: new Date().toISOString(),
                    },
                ]);
            }
        } finally {
            setSending(false);
        }
    }, [input, sending, sessionId, navigate, refreshUsage]);

    return (
        <div className="min-h-screen flex flex-col bg-qc-cream">
            <Header />
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
                <div className="card-brutal flex-1 flex flex-col overflow-hidden">
                    <ChatHeader usage={usage} />

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
                        data-testid="chat-messages-container"
                    >
                        {messages.length === 0 && (
                            <ChatEmptyState suggestions={SUGGESTIONS} onSelect={send} />
                        )}
                        {messages.map((m) => (
                            <MessageBubble key={m.id} message={m} />
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="bg-white border-2 border-qc-ink rounded-2xl rounded-tl-sm p-4 shadow-brutalSm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                                    <span className="text-sm">L&apos;IA réfléchit...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <ChatInput
                        input={input}
                        setInput={setInput}
                        onSubmit={() => send()}
                        sending={sending}
                        limitHit={limitHit}
                    />
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
