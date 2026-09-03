import { Link } from "react-router-dom";
import { construireDegradeCss } from "../utils/degrade";

const COULEUR_OVERLAY_DEFAUT = "#0d231a";

export default function Hero({
  titre,
  sousTitre,
  photo,
  focusX,
  focusY,
  couleur,
  couleurGradientActif,
  couleurGradientFin,
  couleurGradientStyle,
}) {
  const couleurBase = couleur || COULEUR_OVERLAY_DEFAUT;
  const overlayStyle =
    couleurGradientActif && couleurGradientFin
      ? {
          backgroundImage: construireDegradeCss(
            couleurGradientStyle,
            couleurBase,
            couleurGradientFin,
          ),
        }
      : { backgroundColor: couleurBase };

  return (
    <section className="relative h-[800px]">
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          src={photo || "/images/hero-baklawa.jpg"}
          alt="Pâtisseries algériennes dorées, glacées au miel"
          style={{ objectPosition: `${focusX ?? 50}% ${focusY ?? 50}%` }}
        />
        <div className="absolute inset-0 opacity-45" style={overlayStyle}></div>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
        <p className="text-xs uppercase tracking-[0.3em] mb-8 opacity-80">
          Haut artisanat algérien
        </p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none mb-12">
          {titre || "L'ART DU MIEL ET DE LA FLEUR D'ORANGER"}
        </h1>
        {sousTitre && (
          <p className="text-sm opacity-80 mb-8 max-w-xl">{sousTitre}</p>
        )}
        <Link
          to="/patisseries"
          className="px-8 py-3 border border-brand-accent/60 rounded-full text-sm uppercase tracking-widest bg-brand-accent/10 hover:scale-105 transition-transform"
        >
          Découvrir nos pâtisseries
        </Link>
      </div>
    </section>
  );
}
