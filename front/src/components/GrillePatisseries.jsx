import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { urlImage } from "../utils/urlImage";
import ServiceIndisponible from "./ServiceIndisponible";

const API_URL = import.meta.env.VITE_API_URL;

function CartePatisserie({ id, nom, image, focusX, focusY }) {
  return (
    <Link to={`/patisseries/${id}`} className="block group">
      <article className="relative aspect-[3/4] rounded overflow-hidden shadow-soft bg-brand-surface transition-all duration-300 ease-out hover:shadow-medium hover:-translate-y-1">
        {image ? (
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
            src={urlImage(image)}
            alt={nom}
            loading="lazy"
            style={{ objectPosition: `${focusX ?? 50}% ${focusY ?? 50}%` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-border/20">
            <span className="text-xs uppercase tracking-widest opacity-40">
              Photo à venir
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <h2 className="absolute inset-x-0 bottom-0 p-4 font-display text-xl md:text-2xl text-white leading-tight line-clamp-2">
          {nom}
        </h2>
      </article>
    </Link>
  );
}

export default function GrillePatisseries() {
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Réponse API non ok");
        return res.json();
      })
      .then((data) => {
        setProduits(data);
        setErreur(false);
      })
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;
  if (produits.length === 0)
    return (
      <p className="text-center py-16 text-sm opacity-60">
        Nos pâtisseries arrivent bientôt.
      </p>
    );

  return (
    <section className="my-12 md:my-16 px-6 md:px-12 bg-brand-light">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {produits.map((produit) => (
            <CartePatisserie
              key={produit.id}
              id={produit.id}
              nom={produit.name}
              image={produit.photo_url}
              focusX={produit.focus_x}
              focusY={produit.focus_y}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
