import { Link } from "react-router-dom";

const FeaturedGuides = ({ guides }) => (
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
);

export default FeaturedGuides;
