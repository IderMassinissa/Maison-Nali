/**
 * Bloc "notre histoire" (page À propos, jusqu'à 2 instances) : photo +
 * texte + bouton optionnel. `fondSombre` bascule entre les deux variantes
 * visuelles utilisées sur cette page (claire/sombre en alternance).
 */
import { Link } from "react-router-dom";
import { urlImage } from "../utils/urlImage";
import ImageAvecRepli from "./ImageAvecRepli";

export default function BlocHistoire({
  titre,
  sousTitre,
  texte,
  texteBouton,
  lienBouton = "/a-propos",
  fondSombre = false,
  photo,
  photoAlt = "Photo illustrant l'histoire de Maison Nali",
  focusX,
  focusY,
}) {
  return (
    <section
      className={`py-section-y md:py-section-y-lg px-6 md:px-12 ${
        fondSombre ? "bg-brand-gradient text-text-on-dark" : "bg-brand-light"
      }`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
        <div className="order-2 lg:order-1 lg:col-span-2">
          <div className="aspect-[4/3] rounded overflow-hidden shadow-medium">
            <ImageAvecRepli
              className="w-full h-full object-cover"
              src={photo ? urlImage(photo) : null}
              alt={photoAlt}
              loading="lazy"
              style={{ objectPosition: `${focusX ?? 50}% ${focusY ?? 50}%` }}
            />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="font-display text-[1.75rem] md:text-[2.5rem] tracking-tight mb-6 leading-tight">
            {titre || "Des gestes transmis de génération en génération"}
          </h2>
          <div className="w-10 h-px bg-brand-accent mb-6" />
          <h3
            className={`text-lg md:text-xl font-sans font-normal mb-8 ${
              fondSombre ? "text-text-on-dark/70" : "text-brand-dark/80"
            }`}
          >
            {sousTitre || "Héritage"}
          </h3>
          <p className="text-base leading-relaxed opacity-80 mb-8 max-w-md">
            {texte ||
              "De Nassima à Sidali, la famille Nali perpétue un savoir-faire fait de patience et de gestes précis. Aucune machine ne remplace la main : chaque pli, chaque dosage reste une affaire de mémoire et de cœur."}
          </p>

          {lienBouton &&
            (() => {
              const classeBouton = fondSombre
                ? "inline-flex items-center gap-3 px-8 py-3 border border-brand-accent/60 rounded-full text-sm uppercase tracking-widest transition-all duration-500 hover:bg-brand-accent hover:text-brand-dark"
                : "inline-flex items-center gap-3 px-8 py-3 bg-brand-gradient text-text-on-dark rounded-full text-sm uppercase tracking-widest transition-all duration-200 ease-out hover:shadow-soft";

              // lienBouton est soit un chemin interne ("/..."), soit une URL
              // "https://" externe (valide cote back par validateLienBouton) :
              // seul le premier cas correspond a une route de l'appli que
              // react-router sait gerer.
              return lienBouton.startsWith("/") ? (
                <Link to={lienBouton} className={classeBouton}>
                  {texteBouton || "Découvrir notre histoire"}
                </Link>
              ) : (
                <a
                  href={lienBouton}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classeBouton}
                >
                  {texteBouton || "Découvrir notre histoire"}
                </a>
              );
            })()}
        </div>
      </div>
    </section>
  );
}
