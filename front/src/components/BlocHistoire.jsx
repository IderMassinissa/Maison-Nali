import { urlImage } from "../utils/urlImage";

export default function BlocHistoire({
  titre,
  sousTitre,
  texte,
  texteBouton,
  fondSombre = false,
  photo,
  photoAlt = "Maîtres pâtissiers façonnant la pâte dans un atelier algérois",
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
          <div className="rounded overflow-hidden shadow-medium">
            <img
              className="w-full h-auto object-cover"
              src={photo ? urlImage(photo) : "/images/atelier.jpg"}
              alt={photoAlt}
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
              fondSombre ? "text-text-on-dark/70" : "text-brand-dark/70"
            }`}
          >
            {sousTitre || "Héritage"}
          </h3>
          <p className="text-base leading-relaxed opacity-80 mb-8 max-w-md">
            {texte ||
              "Depuis trois générations, la famille Nali perpétue le savoir-faire des maîtres pâtissiers d'Alger. Aucune machine ne remplace la main : chaque pli, chaque dosage reste une affaire de mémoire et de patience."}
          </p>

          {fondSombre ? (
            <a
              href="/a-propos"
              className="inline-flex items-center gap-3 px-8 py-3 border border-brand-accent/60 rounded-full text-sm uppercase tracking-widest transition-all duration-500 hover:bg-brand-accent hover:text-brand-dark"
            >
              {texteBouton || "Découvrir notre histoire"}
            </a>
          ) : (
            <a
              href="/a-propos"
              className="inline-flex items-center gap-3 px-8 py-3 bg-brand-gradient text-text-on-dark rounded-full text-sm uppercase tracking-widest transition-all duration-200 ease-out hover:shadow-soft"
            >
              {texteBouton || "Découvrir notre histoire"}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
