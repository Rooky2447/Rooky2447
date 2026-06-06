import { useState } from "react";

const CATEGORY_OPTIONS = [
    { value: "ramq", label: "RAMQ" },
    { value: "saaq", label: "SAAQ" },
    { value: "impots", label: "Impôts" },
    { value: "logement", label: "Logement" },
    { value: "autre", label: "Autre" },
];

const initialForm = { title: "", category: "ramq", due_date: "", notes: "" };

const ReminderForm = ({ onSubmit, onCancel }) => {
    const [form, setForm] = useState(initialForm);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.due_date) return;
        onSubmit(form);
        setForm(initialForm);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-qc-cream border-2 border-qc-ink rounded-xl space-y-3" data-testid="reminder-form">
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
                    {CATEGORY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
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
                <button type="button" onClick={onCancel} className="btn-white text-sm">Annuler</button>
            </div>
        </form>
    );
};

export default ReminderForm;
