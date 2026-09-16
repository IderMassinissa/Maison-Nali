import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

function CartePatisserie({ nom, description, image, taille, focusX, focusY }) {
  const hauteurImage = taille === "large" ? "md:h-[450px]" : "md:h-auto";
  return (
    <article className="bg-brand-surface rounded-[40px] overflow-hidden shadow-sm border border-brand-border/30 flex flex-col h-full">
      <div
        className={`aspect-[16/9] md:aspect-auto ${hauteurImage} overflow-hidden`}
      >
        <img
          className="w-full h-full object-cover"
          src={image}
          alt={nom}
          style={{ objectPosition: `${focusX ?? 50}% ${focusY ?? 50}%` }}
        />
      </div>
      <div className={taille === "large" ? "p-6 md:p-8" : "p-5"}>
        <h3
          className={
            taille === "large"
              ? "font-display text-3xl md:text-4xl mb-2"
              : "font-display text-2xl mb-1.5"
          }
        >
          {nom}
        </h3>
        <p
          className={
            taille === "large"
              ? "text-sm md:text-base opacity-70 leading-relaxed max-w-lg"
              : "text-xs opacity-70 leading-relaxed"
          }
        >
          {description}
        </p>
      </div>
    </article>
  );
}

// Motif d'alternance grande/petite carte, répété tant qu'il y a des produits
const TAILLES = ["large", "small", "small", "large", "large", "small"];
const SPANS_DESKTOP = [
  "md:col-span-8",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-8",
  "md:col-span-7",
  "md:col-span-5",
];

// Chaque paire d'index consécutifs (0-1, 2-3, 4-5) totalise 12/12 : si le
// nombre de produits est impair, le dernier n'a pas de binôme pour compléter
// sa ligne. On lui donne alors toute la largeur pour éviter le vide.
function obtenirSpanDesktop(index, total) {
  const estOrphelin = index === total - 1 && total % 2 === 1;
  return estOrphelin ? "md:col-span-12" : SPANS_DESKTOP[index % SPANS_DESKTOP.length];
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {produits.map((produit, index) => (
            <div
              key={produit.id}
              className={obtenirSpanDesktop(index, produits.length)}
            >
              <CartePatisserie
                nom={produit.name}
                description={produit.description}
                image={produit.photo_url}
                taille={TAILLES[index % TAILLES.length]}
                focusX={produit.focus_x}
                focusY={produit.focus_y}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
