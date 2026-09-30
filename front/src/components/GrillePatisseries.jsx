import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { urlImage } from "../utils/urlImage";
import ServiceIndisponible from "./ServiceIndisponible";

const API_URL = import.meta.env.VITE_API_URL;

function CartePatisserie({ id, nom, description, image, focusX, focusY }) {
  return (
    <Link to={`/patisseries/${id}`} className="block">
      <article className="rounded-lg overflow-hidden shadow-sm border border-brand-border/30 hover:shadow-md transition-shadow bg-brand-surface">
        <div className="aspect-[4/3] overflow-hidden bg-brand-border/20 flex items-center justify-center">
          {image ? (
            <img
              className="w-full h-full object-cover"
              src={urlImage(image)}
              alt={nom}
              style={{ objectPosition: `${focusX ?? 50}% ${focusY ?? 50}%` }}
            />
          ) : (
            <span className="text-xs uppercase tracking-widest opacity-40">
              Photo à venir
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display text-2xl md:text-3xl mb-2">{nom}</h3>
          <p className="text-sm md:text-base opacity-70 leading-relaxed">
            {description}
          </p>
        </div>
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
    <section className="my-24 md:my-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {produits.map((produit) => (
            <CartePatisserie
              key={produit.id}
              id={produit.id}
              nom={produit.name}
              description={produit.description}
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
