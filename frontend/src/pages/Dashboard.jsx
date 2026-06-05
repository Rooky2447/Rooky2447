import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import { MessageCircle, BellRing, BookOpen, Plus, Trash2, Calendar, ArrowRight, Sparkles } from "lucide-react";

const Dashboard = () => {
    const { user } = useAuth();
    const [reminders, setReminders] = useState([]);
    const [guides, setGuides] = useState([]);
    const [chats, setChats] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", category: "ramq", due_date: "", notes: "" });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const [r1, r2, r3] = await Promise.all([
                api.get("/reminders"),
                api.get("/guides"),
                api.get("/chat/sessions"),
            ]);
            setReminders(r1.data);
            setGuides(r2.data);
            setChats(r3.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const createReminder = async (e) => {
        e.preventDefault();
        if (!form.title || !form.due_date) return;
        const r = await api.post("/reminders", form);
        setReminders([...reminders, r.data].sort((a, b) => a.due_date.localeCompare(b.due_date)));
        setForm({ title: "", category: "ramq", due_date: "", notes: "" });
        setShowForm(false);
    };

    const deleteReminder = async (id) => {
        await api.delete(`/reminders/${id}`);
        setReminders(reminders.filter((r) => r.id !== id));
    };

    const daysUntil = (date) => {
        const d = new Date(date);
        const now = new Date();
        return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    };

    const categoryColors = {
        ramq: "bg-qc-red text-white",
        saaq: "bg-qc-blue text-qc-ink",
        impots: "bg-qc-yellow text-qc-ink",
        logement: "bg-qc-green text-white",
        autre: "bg-qc-ink text-white",
    };
    const categoryLabels = {
        ramq: "RAMQ",
        saaq: "SAAQ",
        impots: "Impôts",
        logement: "Logement",
        autre: "Autre",
    };

    return (
        <div className="min-h-screen bg-qc-cream">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-10 animate-fade-up">
                    <h1 className="font-heading font-black text-4xl sm:text-5xl">
                        Salut, <span className="text-qc-red">{user?.name?.split(" ")[0] || "toé"}</span>! <span className="inline-block animate-bounce-soft">👋</span>
                    </h1>
                    <p className="mt-2 text-lg text-qc-inkSoft">Voici ce qui t'attend aujourd'hui.</p>
                </div>

                {/* Quick actions */}
                <div className="grid sm:grid-cols-3 gap-4 mb-10">
                    <Link to="/chat" className="card-brutal card-brutal-hover p-5 flex items-center gap-3" data-testid="quick-chat">
                        <div className="w-12 h-12 bg-qc-yellow border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm">
                            <MessageCircle className="w-6 h-6" strokeWidth={3} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold">Demande à l'IA</p>
                            <p className="text-sm text-qc-inkSoft">Pose ta question</p>
                        </div>
                        <ArrowRight className="w-5 h-5" strokeWidth={3} />
                    </Link>
                    <Link to="/guides" className="card-brutal card-brutal-hover p-5 flex items-center gap-3" data-testid="quick-guides">
                        <div className="w-12 h-12 bg-qc-blue border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm">
                            <BookOpen className="w-6 h-6" strokeWidth={3} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold">Guides pratiques</p>
                            <p className="text-sm text-qc-inkSoft">{guides.length} démarches</p>
                        </div>
                        <ArrowRight className="w-5 h-5" strokeWidth={3} />
                    </Link>
                    <button onClick={() => setShowForm(true)} className="card-brutal card-brutal-hover p-5 flex items-center gap-3 text-left" data-testid="quick-add-reminder">
                        <div className="w-12 h-12 bg-qc-red border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm">
                            <Plus className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold">Nouveau rappel</p>
                            <p className="text-sm text-qc-inkSoft">Ne rate plus rien</p>
                        </div>
                    </button>
                </div>

                {/* Reminders + Recent Chats Bento */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 card-brutal p-6" data-testid="reminders-section">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-heading font-bold text-2xl flex items-center gap-2">
                                <BellRing className="w-6 h-6 text-qc-red" strokeWidth={3} /> Tes rappels
                            </h2>
                            <button onClick={() => setShowForm(!showForm)} className="btn-yellow text-sm py-2 px-3" data-testid="add-reminder-btn">
                                <Plus className="w-4 h-4" strokeWidth={3} /> Ajouter
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={createReminder} className="mb-4 p-4 bg-qc-cream border-2 border-qc-ink rounded-xl space-y-3" data-testid="reminder-form">
                                <input
                                    type="text"
                                    placeholder="Ex: Renouveler ma carte soleil"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="input-brutal"
                                    required
                                    data-testid="reminder-title-input"
                                />
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="input-brutal"
                                        data-testid="reminder-category-select"
                                    >
                                        <option value="ramq">RAMQ</option>
                                        <option value="saaq">SAAQ</option>
                                        <option value="impots">Impôts</option>
                                        <option value="logement">Logement</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                    <input
                                        type="date"
                                        value={form.due_date}
                                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                        className="input-brutal"
                                        required
                                        data-testid="reminder-date-input"
                                    />
                                </div>
                                <textarea
                                    placeholder="Notes (optionnel)"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="input-brutal min-h-[60px]"
                                    data-testid="reminder-notes-input"
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="btn-ink text-sm" data-testid="reminder-submit-btn">Enregistrer</button>
                                    <button type="button" onClick={() => setShowForm(false)} className="btn-white text-sm">Annuler</button>
                                </div>
                            </form>
                        )}

                        {loading ? (
                            <p className="text-qc-inkSoft">Chargement...</p>
                        ) : reminders.length === 0 ? (
                            <div className="text-center py-10 text-qc-inkSoft">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" strokeWidth={2} />
                                <p className="font-bold">Aucun rappel pour l'instant</p>
                                <p className="text-sm">Ajoute ta première échéance!</p>
                            </div>
                        ) : (
                            <ul className="space-y-3" data-testid="reminders-list">
                                {reminders.map((r) => {
                                    const days = daysUntil(r.due_date);
                                    const urgent = days <= 7;
                                    return (
                                        <li
                                            key={r.id}
                                            className="flex items-center gap-3 p-4 bg-white border-2 border-qc-ink rounded-xl shadow-brutalSm hover:-translate-y-0.5 hover:shadow-brutal transition-all"
                                            data-testid={`reminder-item-${r.id}`}
                                        >
                                            <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-qc-ink rounded-lg ${categoryColors[r.category] || categoryColors.autre}`}>
                                                {categoryLabels[r.category] || r.category}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate">{r.title}</p>
                                                {r.notes && <p className="text-xs text-qc-inkSoft truncate">{r.notes}</p>}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-qc-inkSoft">{new Date(r.due_date).toLocaleDateString("fr-CA")}</p>
                                                <p className={`text-sm font-black ${urgent ? "text-qc-red" : "text-qc-ink"}`}>
                                                    {days < 0 ? "En retard" : days === 0 ? "Aujourd'hui" : `Dans ${days} j`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteReminder(r.id)}
                                                className="p-2 hover:bg-qc-red/10 rounded-lg transition-colors"
                                                title="Supprimer"
                                                data-testid={`delete-reminder-${r.id}`}
                                            >
                                                <Trash2 className="w-4 h-4 text-qc-red" strokeWidth={2.5} />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

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
                </div>

                {/* Featured guides */}
                <section className="mt-10" data-testid="featured-guides">
                    <h2 className="font-heading font-bold text-2xl mb-4">Guides populaires</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {guides.slice(0, 4).map((g) => (
                            <Link
                                key={g.slug}
                                to={`/guides/${g.slug}`}
                                className="card-brutal card-brutal-hover p-5"
                                data-testid={`guide-card-${g.slug}`}
                                style={{ background: g.color + "22" }}
                            >
                                <span className="badge-brutal" style={{ background: g.color }}>
                                    {g.category}
                                </span>
                                <h3 className="font-heading font-bold text-lg mt-3 leading-tight">{g.title}</h3>
                                <p className="text-sm text-qc-inkSoft mt-2 line-clamp-2">{g.short_description}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
