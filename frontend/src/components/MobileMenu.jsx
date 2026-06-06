import { Link } from "react-router-dom";
import { Crown, LogOut, Sparkles } from "lucide-react";

const MobileMenu = ({ user, links, onClose, onLogin, onLogout }) => (
    <div className="md:hidden border-t-2 border-qc-ink bg-qc-cream px-4 py-3 space-y-2">
        {links.map((l) => {
            const Icon = l.icon;
            return (
                <Link
                    key={l.to}
                    to={l.to}
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-qc-ink rounded-xl font-bold"
                    data-testid={`mobile-${l.testid}`}
                >
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                    {l.label}
                </Link>
            );
        })}
        {user ? (
            <>
                {user.premium ? (
                    <Link to="/pricing" onClick={onClose} className="flex items-center gap-2 px-4 py-3 bg-qc-yellow border-2 border-qc-ink rounded-xl font-bold" data-testid="mobile-pro-badge">
                        <Crown className="w-4 h-4" strokeWidth={3} /> Pro Actif
                    </Link>
                ) : (
                    <Link to="/pricing" onClick={onClose} className="w-full btn-yellow text-sm" data-testid="mobile-upgrade-btn">
                        <Sparkles className="w-4 h-4" strokeWidth={3} /> Passe Pro
                    </Link>
                )}
                <button onClick={onLogout} className="w-full btn-white text-sm" data-testid="mobile-logout-btn">
                    <LogOut className="w-4 h-4" strokeWidth={2.5} /> Quitter
                </button>
            </>
        ) : (
            <>
                <Link to="/pricing" onClick={onClose} className="w-full btn-white text-sm" data-testid="mobile-pricing-btn">
                    Tarifs
                </Link>
                <button onClick={onLogin} className="w-full btn-yellow text-sm" data-testid="mobile-login-btn">
                    Se connecter
                </button>
            </>
        )}
    </div>
);

export default MobileMenu;
