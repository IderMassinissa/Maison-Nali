import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function GestionPage() {
  const { slug } = useParams();
  return <ContenuPage key={slug} slug={slug} />;
}

function ContenuPage({ slug }) {
  const [page, setPage] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/pages/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Page introuvable");
        return res.json();
      })
      .then((data) => setPage(data))
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, [slug]);

  if (chargement) return <p>Chargement...</p>;
  if (erreur) return <p className="text-red-600">{erreur}</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Page : {page.title}</h1>

      {page.sections.length === 0 ? (
        <p className="opacity-70 text-sm">
          Aucun bloc sur cette page pour l'instant.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {page.sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center gap-4 p-4 bg-white border border-brand-border rounded-xl"
            >
              <span className="text-xs uppercase tracking-widest opacity-50">
                {section.type}
              </span>
              <span className="flex-1 min-w-0 text-sm">Position {section.position}</span>
              <Link
                to={`/admin/pages/${slug}/blocs/${section.id}`}
                className="text-xs uppercase tracking-widest text-brand-accent hover:underline"
              >
                Éditer
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
