import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProduitDetail() {
  const { id } = useParams();
  const [produit, setProduit] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduit(data))
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return null;
  if (!produit)
    return <p className="text-center py-24">Pâtisserie introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24">
      <Link
        to="/patisseries"
        className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100 mb-8 inline-block"
      >
        ← Retour aux pâtisseries
      </Link>

      <div className="rounded-[40px] overflow-hidden mb-10 aspect-[4/3]">
        <img
          src={produit.photo_url}
          alt={produit.name}
          className="w-full h-full object-cover"
          style={{
            objectPosition: `${produit.focus_x ?? 50}% ${produit.focus_y ?? 50}%`,
          }}
        />
      </div>

      <h1 className="font-display text-4xl md:text-6xl tracking-tight mb-6 text-center">
        {produit.name}
      </h1>
      <p className="text-base md:text-lg leading-relaxed opacity-80 text-center max-w-2xl mx-auto">
        {produit.description}
      </p>

      {produit.video_url && (
        <div className="text-center mt-10">
          <a
            href={produit.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3 border border-brand-accent/60 rounded-full text-sm uppercase tracking-widest hover:bg-brand-accent hover:text-brand-dark transition-colors"
          >
            Voir en vidéo
          </a>
        </div>
      )}
    </div>
  );
}
