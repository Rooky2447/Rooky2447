import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import QuickActions from "@/components/dashboard/QuickActions";
import RemindersSection from "@/components/dashboard/RemindersSection";
import RecentChats from "@/components/dashboard/RecentChats";
import FeaturedGuides from "@/components/dashboard/FeaturedGuides";

const Dashboard = () => {
    const { user } = useAuth();
    const [reminders, setReminders] = useState([]);
    const [guides, setGuides] = useState([]);
    const [chats, setChats] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const createReminder = useCallback(async (form) => {
        try {
            const r = await api.post("/reminders", form);
            setReminders((prev) => [...prev, r.data].sort((a, b) => a.due_date.localeCompare(b.due_date)));
            setShowForm(false);
        } catch (err) {
            console.error("Create reminder failed", err);
        }
    }, []);

    const deleteReminder = useCallback(async (id) => {
        try {
            await api.delete(`/reminders/${id}`);
            setReminders((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Delete reminder failed", err);
        }
    }, []);

    const toggleForm = useCallback(() => setShowForm((s) => !s), []);
    const firstName = user?.name?.split(" ")[0] || "toé";

    return (
        <div className="min-h-screen bg-qc-cream">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-10 animate-fade-up">
                    <h1 className="font-heading font-black text-4xl sm:text-5xl">
                        Salut, <span className="text-qc-red">{firstName}</span>!{" "}
                        <span className="inline-block animate-bounce-soft">👋</span>
                    </h1>
                    <p className="mt-2 text-lg text-qc-inkSoft">Voici ce qui t&apos;attend aujourd&apos;hui.</p>
                </div>

                <QuickActions guidesCount={guides.length} onAddReminder={() => setShowForm(true)} />

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RemindersSection
                            reminders={reminders}
                            loading={loading}
                            showForm={showForm}
                            onToggleForm={toggleForm}
                            onCreate={createReminder}
                            onDelete={deleteReminder}
                        />
                    </div>
                    <RecentChats chats={chats} />
                </div>

                <FeaturedGuides guides={guides} />
            </main>
        </div>
    );
};

export default Dashboard;
