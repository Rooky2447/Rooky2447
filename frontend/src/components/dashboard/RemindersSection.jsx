import { BellRing, Calendar, Trash2, Plus } from "lucide-react";
import ReminderForm from "./ReminderForm";

const CATEGORY_COLORS = {
    ramq: "bg-qc-red text-white",
    saaq: "bg-qc-blue text-qc-ink",
    impots: "bg-qc-yellow text-qc-ink",
    logement: "bg-qc-green text-white",
    autre: "bg-qc-ink text-white",
};
const CATEGORY_LABELS = {
    ramq: "RAMQ",
    saaq: "SAAQ",
    impots: "Impôts",
    logement: "Logement",
    autre: "Autre",
};

const daysUntil = (date) => {
    const d = new Date(date);
    const now = new Date();
    return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

const ReminderItem = ({ reminder, onDelete }) => {
    const days = daysUntil(reminder.due_date);
    const urgent = days <= 7;
    return (
        <li
            className="flex items-center gap-3 p-4 bg-white border-2 border-qc-ink rounded-xl shadow-brutalSm hover:-translate-y-0.5 hover:shadow-brutal transition-all"
            data-testid={`reminder-item-${reminder.id}`}
        >
            <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-qc-ink rounded-lg ${CATEGORY_COLORS[reminder.category] || CATEGORY_COLORS.autre}`}>
                {CATEGORY_LABELS[reminder.category] || reminder.category}
            </span>
            <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{reminder.title}</p>
                {reminder.notes && <p className="text-xs text-qc-inkSoft truncate">{reminder.notes}</p>}
            </div>
            <div className="text-right">
                <p className="text-xs text-qc-inkSoft">{new Date(reminder.due_date).toLocaleDateString("fr-CA")}</p>
                <p className={`text-sm font-black ${urgent ? "text-qc-red" : "text-qc-ink"}`}>
                    {days < 0 ? "En retard" : days === 0 ? "Aujourd'hui" : `Dans ${days} j`}
                </p>
            </div>
            <button
                onClick={() => onDelete(reminder.id)}
                className="p-2 hover:bg-qc-red/10 rounded-lg transition-colors"
                title="Supprimer"
                data-testid={`delete-reminder-${reminder.id}`}
            >
                <Trash2 className="w-4 h-4 text-qc-red" strokeWidth={2.5} />
            </button>
        </li>
    );
};

const RemindersSection = ({ reminders, loading, showForm, onToggleForm, onCreate, onDelete }) => (
    <section className="card-brutal p-6" data-testid="reminders-section">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-2xl flex items-center gap-2">
                <BellRing className="w-6 h-6 text-qc-red" strokeWidth={3} /> Tes rappels
            </h2>
            <button onClick={onToggleForm} className="btn-yellow text-sm py-2 px-3" data-testid="add-reminder-btn">
                <Plus className="w-4 h-4" strokeWidth={3} /> Ajouter
            </button>
        </div>

        {showForm && <ReminderForm onSubmit={onCreate} onCancel={onToggleForm} />}

        {loading ? (
            <p className="text-qc-inkSoft">Chargement...</p>
        ) : reminders.length === 0 ? (
            <div className="text-center py-10 text-qc-inkSoft">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" strokeWidth={2} />
                <p className="font-bold">Aucun rappel pour l&apos;instant</p>
                <p className="text-sm">Ajoute ta première échéance!</p>
            </div>
        ) : (
            <ul className="space-y-3" data-testid="reminders-list">
                {reminders.map((r) => (
                    <ReminderItem key={r.id} reminder={r} onDelete={onDelete} />
                ))}
            </ul>
        )}
    </section>
);

export default RemindersSection;
