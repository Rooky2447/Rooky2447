import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, BookOpen, LayoutDashboard, LogOut, Menu, X, Crown, Sparkles } from "lucide-react";
import { useState } from "react";
import MobileMenu from "@/components/MobileMenu";

const Header = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const links = user
        ? [
              { to: "/dashboard", label: "Tableau", icon: LayoutDashboard, testid: "nav-dashboard" },
              { to: "/chat", label: "Chat IA", icon: MessageCircle, testid: "nav-chat" },
              { to: "/guides", label: "Guides", icon: BookOpen, testid: "nav-guides" },
          ]
        : [{ to: "/guides", label: "Guides", icon: BookOpen, testid: "nav-guides" }];

    const handleLogin = () => {
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const redirectUrl = window.location.origin + "/dashboard";
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

    return (
        <header className="sticky top-0 z-40 bg-qc-cream border-b-2 border-qc-ink">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                <Link
                    to={user ? "/dashboard" : "/"}
                    className="flex items-center gap-2 group"
                    data-testid="logo-link"
                >
                    <div className="w-10 h-10 bg-qc-yellow border-2 border-qc-ink rounded-xl shadow-brutalSm flex items-center justify-center font-black text-xl group-hover:rotate-3 transition-transform">
                        Q
                    </div>
                    <span className="font-heading font-black text-xl tracking-tight">Allô Québec</span>
                </Link>

                <nav className="hidden md:flex items-center gap-2">
                    {links.map((l) => {
                        const Icon = l.icon;
                        return (
                            <Link
                                key={l.to}
                                to={l.to}
                                data-testid={l.testid}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                                    isActive(l.to)
                                        ? "bg-qc-yellow border-qc-ink shadow-brutalSm"
                                        : "border-transparent hover:border-qc-ink hover:bg-white"
                                }`}
                            >
                                <Icon className="w-4 h-4" strokeWidth={2.5} />
                                {l.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {user.premium ? (
                                <Link
                                    to="/pricing"
                                    className="inline-flex items-center gap-1 bg-qc-yellow border-2 border-qc-ink rounded-full px-3 py-1.5 text-xs font-black uppercase shadow-brutalSm hover:-translate-y-0.5 transition-transform"
                                    data-testid="pro-badge"
                                >
                                    <Crown className="w-3.5 h-3.5" strokeWidth={3} /> Pro
                                </Link>
                            ) : (
                                <Link to="/pricing" className="btn-yellow text-sm py-2 px-3" data-testid="upgrade-btn">
                                    <Sparkles className="w-4 h-4" strokeWidth={3} /> Passe Pro
                                </Link>
                            )}
                            {user.picture && (
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-9 h-9 rounded-full border-2 border-qc-ink"
                                    data-testid="user-avatar"
                                />
                            )}
                            <button
                                onClick={logout}
                                data-testid="logout-btn"
                                className="btn-white text-sm"
                                title="Se déconnecter"
                            >
                                <LogOut className="w-4 h-4" strokeWidth={2.5} />
                                Quitter
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/pricing" className="btn-white text-sm" data-testid="header-pricing-btn">
                                Tarifs
                            </Link>
                            <button onClick={handleLogin} className="btn-yellow text-sm" data-testid="header-login-btn">
                                Se connecter
                            </button>
                        </div>
                    )}
                </div>

                <button
                    className="md:hidden p-2 border-2 border-qc-ink rounded-xl bg-white shadow-brutalSm"
                    onClick={() => setOpen(!open)}
                    data-testid="mobile-menu-toggle"
                >
                    {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {open && (
                <MobileMenu
                    user={user}
                    links={links}
                    onClose={() => setOpen(false)}
                    onLogin={handleLogin}
                    onLogout={logout}
                />
            )}
        </header>
    );
};

export default Header;
