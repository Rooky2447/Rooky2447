import { Link } from "react-router-dom";
import { MessageCircle, BookOpen, Plus, ArrowRight } from "lucide-react";

const QuickActions = ({ guidesCount, onAddReminder }) => (
    <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Link to="/chat" className="card-brutal card-brutal-hover p-5 flex items-center gap-3" data-testid="quick-chat">
            <div className="w-12 h-12 bg-qc-yellow border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm">
                <MessageCircle className="w-6 h-6" strokeWidth={3} />
            </div>
            <div className="flex-1">
                <p className="font-bold">Demande à l&apos;IA</p>
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
                <p className="text-sm text-qc-inkSoft">{guidesCount} démarches</p>
            </div>
            <ArrowRight className="w-5 h-5" strokeWidth={3} />
        </Link>
        <button
            onClick={onAddReminder}
            className="card-brutal card-brutal-hover p-5 flex items-center gap-3 text-left"
            data-testid="quick-add-reminder"
        >
            <div className="w-12 h-12 bg-qc-red border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm">
                <Plus className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div className="flex-1">
                <p className="font-bold">Nouveau rappel</p>
                <p className="text-sm text-qc-inkSoft">Ne rate plus rien</p>
            </div>
        </button>
    </div>
);

export default QuickActions;
