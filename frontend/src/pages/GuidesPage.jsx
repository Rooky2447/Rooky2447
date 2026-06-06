import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";

const GuidesPage = () => {
    const [guides, setGuides] = useState([]);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/guides").then((r) => setGuides(r.data));
    }, []);

    const categories = ["all", ...new Set(guides.map((g) => g.category))];

    const filtered = guides.filter((g) => {
        const matchCat = filter === "all" || g.category === filter;
        const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.short_description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="min-h-screen bg-qc-cream">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-8 animate-fade-up">
                    <h1 className="font-heading font-black text-4xl sm:text-5xl">Guides pratiques</h1>
                    <p className="mt-3 text-lg text-qc-inkSoft">Tout ce qu&apos;il te faut, expliqué simplement.</p>
                </div>

                <div className="card-brutal p-4 mb-8 flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cherche un guide..."
                        className="input-brutal flex-1"
                        data-testid="guides-search"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setFilter(c)}
                                className={`px-3 py-2 border-2 border-qc-ink rounded-xl text-sm font-bold transition-all ${
                                    filter === c ? "bg-qc-yellow shadow-brutalSm" : "bg-white hover:bg-qc-yellow/30"
                                }`}
                                data-testid={`filter-${c}`}
                            >
                                {c === "all" ? "Tout" : c}
                            </button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="card-brutal p-10 text-center text-qc-inkSoft">Aucun guide trouvé.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((g) => {
                            const Icon = Icons[g.icon] || Icons.BookOpen;
                            return (
                                <Link
                                    key={g.slug}
                                    to={`/guides/${g.slug}`}
                                    className="card-brutal card-brutal-hover p-6 flex flex-col"
                                    data-testid={`guide-${g.slug}`}
                                >
                                    <div
                                        className="w-14 h-14 border-2 border-qc-ink rounded-xl flex items-center justify-center shadow-brutalSm mb-4"
                                        style={{ background: g.color }}
                                    >
                                        <Icon className="w-7 h-7 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="badge-brutal mb-3" style={{ background: g.color }}>
                                        {g.category}
                                    </span>
                                    <h3 className="font-heading font-bold text-xl leading-tight mb-2">{g.title}</h3>
                                    <p className="text-sm text-qc-inkSoft flex-1">{g.short_description}</p>
                                    <div className="mt-4 flex items-center gap-1 text-sm font-bold">
                                        Lire le guide <ArrowRight className="w-4 h-4" strokeWidth={3} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GuidesPage;
