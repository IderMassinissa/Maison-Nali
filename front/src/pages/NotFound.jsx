import { Link } from "react-router-dom";
import usePageSeo from "../hooks/usePageSeo";

export default function NotFound() {
  usePageSeo(
    "Page introuvable — Maison Nali",
    "Cette page n'existe pas ou n'est plus disponible sur le site de Maison Nali.",
  );

  return (
    <div className="px-6 md:px-12 py-24 md:py-32 max-w-2xl mx-auto text-center">
      <span className="text-brand-accent text-xs uppercase tracking-[0.3em] mb-6 block">
        Erreur 404
      </span>
      <h1 className="font-display text-4xl md:text-6xl tracking-tight mb-6">
        Page introuvable
      </h1>
      <p className="text-sm md:text-base leading-relaxed opacity-80 mb-10">
        La page que vous cherchez n'existe pas ou n'est plus disponible.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-3 px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest transition-all duration-500 hover:bg-brand-accent hover:text-brand-dark"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
