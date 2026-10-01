import { Link } from "react-router-dom";
import { urlImage } from "../utils/urlImage";

export default function Hero({
  titre,
  sousTitre,
  photo,
  focusX,
  focusY,
  entetePresent,
}) {
  const TitreTag = entetePresent ? "h2" : "h1";
  const SousTitreTag = entetePresent ? "h3" : "h2";

  return (
    <section className="relative min-h-hero">
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          src={photo ? urlImage(photo) : "/images/hero-baklawa.jpg"}
          alt="Pâtisseries algériennes dorées, glacées au miel"
          style={{ objectPosition: `${focusX ?? 50}% ${focusY ?? 50}%` }}
        />
        <div className="absolute inset-0 opacity-45 bg-brand-dark"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
        <TitreTag className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none mb-6">
          {titre || "L'ART DU MIEL ET DE LA FLEUR D'ORANGER"}
        </TitreTag>
        <div className="w-10 h-px bg-brand-accent mb-6" />
        <SousTitreTag className="text-lg md:text-xl font-sans font-normal mb-8 opacity-90">
          Haut artisanat algérien
        </SousTitreTag>
        {sousTitre && (
          <p className="text-base md:text-[1.0625rem] opacity-80 mb-8 max-w-xl">{sousTitre}</p>
        )}
        <Link
          to="/patisseries"
          className="px-8 py-3 border border-brand-accent/60 rounded-full text-sm uppercase tracking-widest bg-brand-accent/10 transition-colors duration-200 ease-out hover:bg-brand-accent/20"
        >
          Découvrir nos pâtisseries
        </Link>
      </div>
    </section>
  );
}
