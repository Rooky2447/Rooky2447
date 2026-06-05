import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import * as Icons from "lucide-react";
import { ArrowLeft, ExternalLink, CheckCircle2, HelpCircle, MessageCircle } from "lucide-react";

const GuideDetail = () => {
    const { slug } = useParams();
    const [guide, setGuide] = useState(null);
    const [checked, setChecked] = useState({});

    useEffect(() => {
        api.get(`/guides/${slug}`).then((r) => setGuide(r.data)).catch(() => setGuide(null));
    }, [slug]);

    if (!guide) {
        return (
            <div className="min-h-screen bg-qc-cream">
                <Header />
                <main className="max-w-3xl mx-auto px-4 py-12">
                    <div className="card-brutal p-8 text-center">
                        <p className="font-bold">Chargement...</p>
                    </div>
                </main>
            </div>
        );
    }

    const Icon = Icons[guide.icon] || Icons.BookOpen;

    return (
        <div className="min-h-screen bg-qc-cream">
            <Header />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <Link to="/guides" className="inline-flex items-center gap-2 font-bold mb-6 hover:underline" data-testid="back-to-guides">
                    <ArrowLeft className="w-4 h-4" strokeWidth={3} /> Tous les guides
                </Link>

                <div className="card-brutal p-6 sm:p-8 mb-6" style={{ background: guide.color + "15" }}>
                    <div className="flex items-start gap-4 mb-4">
                        <div
                            className="w-16 h-16 border-2 border-qc-ink rounded-2xl flex items-center justify-center shadow-brutal flex-shrink-0"
                            style={{ background: guide.color }}
                        >
                            <Icon className="w-8 h-8 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <span className="badge-brutal" style={{ background: guide.color }}>
                                {guide.category}
                            </span>
                            <h1 className="font-heading font-black text-3xl sm:text-4xl mt-2 leading-tight">{guide.title}</h1>
                        </div>
                    </div>
                    <p className="text-lg text-qc-inkSoft">{guide.short_description}</p>
                </div>

                <section className="card-brutal p-6 sm:p-8 mb-6" data-testid="guide-steps">
                    <h2 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-qc-green" strokeWidth={3} /> Étapes à suivre
                    </h2>
                    <ol className="space-y-3">
                        {guide.steps.map((s, i) => {
                            const isChecked = checked[i];
                            return (
                                <li key={i}>
                                    <button
                                        onClick={() => setChecked({ ...checked, [i]: !isChecked })}
                                        className={`w-full text-left p-4 border-2 border-qc-ink rounded-xl flex gap-3 items-start transition-all ${
                                            isChecked ? "bg-qc-green/20 shadow-brutalSm" : "bg-white shadow-brutalSm hover:-translate-y-0.5 hover:shadow-brutal"
                                        }`}
                                        data-testid={`step-${i}`}
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-lg border-2 border-qc-ink flex-shrink-0 flex items-center justify-center font-black ${
                                                isChecked ? "bg-qc-green text-white" : "bg-qc-yellow"
                                            }`}
                                        >
                                            {isChecked ? <CheckCircle2 className="w-4 h-4" strokeWidth={3} /> : i + 1}
                                        </div>
                                        <div className={isChecked ? "opacity-60 line-through" : ""}>
                                            <p className="font-bold">{s.title}</p>
                                            <p className="text-sm text-qc-inkSoft mt-1">{s.detail}</p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <section className="card-brutal p-6 sm:p-8 mb-6" data-testid="guide-resources">
                    <h2 className="font-heading font-bold text-2xl mb-4">Liens utiles</h2>
                    <ul className="space-y-2">
                        {guide.resources.map((r, i) => (
                            <li key={i}>
                                <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-white border-2 border-qc-ink rounded-xl shadow-brutalSm hover:-translate-y-0.5 hover:shadow-brutal transition-all"
                                    data-testid={`resource-${i}`}
                                >
                                    <span className="font-bold">{r.label}</span>
                                    <ExternalLink className="w-4 h-4" strokeWidth={3} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>

                {guide.faq?.length > 0 && (
                    <section className="card-brutal p-6 sm:p-8 mb-6" data-testid="guide-faq">
                        <h2 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-qc-blue" strokeWidth={3} /> Questions fréquentes
                        </h2>
                        <ul className="space-y-3">
                            {guide.faq.map((f, i) => (
                                <li key={i} className="p-4 bg-qc-cream border-2 border-qc-ink rounded-xl">
                                    <p className="font-bold mb-1">{f.q}</p>
                                    <p className="text-sm text-qc-inkSoft">{f.a}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <div className="card-brutal p-6 bg-qc-yellow flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-heading font-bold text-xl">Une question spécifique?</h3>
                        <p className="text-sm">Demande à l'IA, elle connaît les détails.</p>
                    </div>
                    <Link to="/chat" className="btn-ink text-sm" data-testid="ask-ai-cta">
                        <MessageCircle className="w-4 h-4" strokeWidth={3} /> Demander à l'IA
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default GuideDetail;
