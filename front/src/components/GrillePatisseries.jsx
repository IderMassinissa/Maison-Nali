import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { urlImage } from "../utils/urlImage";

const API_URL = import.meta.env.VITE_API_URL;

// Motif fixe de tailles selon la position (index % 6), répété tous les 6 produits :
// index 0=grande(8), 1=petite(4), 2=petite(4), 3=grande(8), 4=moyenne(7), 5=moyenne(5).
const MOTIF = [8, 4, 4, 8, 7, 5];

const COL_SPAN_CLASSES = {
  4: "md:col-span-4",
  5: "md:col-span-5",
  7: "md:col-span-7",
  8: "md:col-span-8",
  12: "md:col-span-12",
};

const IMAGE_ASPECT = {
  8: "aspect-[4/3]",
  7: "aspect-[4/3]",
  5: "aspect-[3/4]",
  4: "aspect-[3/4]",
  12: "aspect-[4/3]",
};

// Chaque paire d'index consécutifs (0-1, 2-3, 4-5) totalise 12/12 : si le
// nombre de produits est impair, le dernier n'a pas de binôme pour compléter
// sa ligne. On lui donne alors toute la largeur pour éviter le vide.
function obtenirCols(index, total) {
  const estOrphelin = index === total - 1 && total % 2 === 1;
  return estOrphelin ? 12 : MOTIF[index % MOTIF.length];
}

function CartePatisserie({
  id,
  nom,
  description,
  image,
  grande,
  aspectImage,
  focusX,
  focusY,
}) {
  return (
    <Link to={`/patisseries/${id}`} className="block">
      <article className="rounded-[40px] overflow-hidden shadow-sm border border-brand-border/30 hover:shadow-md transition-shadow bg-brand-surface">
        <div
          className={`${aspectImage} overflow-hidden bg-brand-border/20 flex items-center justify-center`}
        >
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
        <div className={grande ? "p-4 md:p-5" : "p-4"}>
          <h3
            className={
              grande
                ? "font-display text-2xl md:text-3xl mb-2"
                : "font-display text-2xl mb-1.5"
            }
          >
            {nom}
          </h3>
          <p
            className={
              grande
                ? "text-sm md:text-base opacity-70 leading-relaxed max-w-lg"
                : "text-xs opacity-70 leading-relaxed"
            }
          >
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

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProduits(data))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return null;
  if (produits.length === 0) return null;

  return (
    <section className="my-24 md:my-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 md:items-start">
          {produits.map((produit, index) => {
            const cols = obtenirCols(index, produits.length);
            return (
              <div key={produit.id} className={COL_SPAN_CLASSES[cols]}>
                <CartePatisserie
                  id={produit.id}
                  nom={produit.name}
                  description={produit.description}
                  image={produit.photo_url}
                  grande={cols >= 7}
                  aspectImage={IMAGE_ASPECT[cols]}
                  focusX={produit.focus_x}
                  focusY={produit.focus_y}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
