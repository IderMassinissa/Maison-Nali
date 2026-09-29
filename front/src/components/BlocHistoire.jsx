export default function BlocHistoire({ titre, texte, fondSombre = false }) {
  return (
    <section
      className={`py-24 md:py-32 px-6 md:px-12 ${
        fondSombre ? "bg-brand-dark text-brand-light" : "bg-brand-light"
      }`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5">
            <img
              className="w-full h-auto object-cover"
              src="/images/atelier.jpg"
              alt="Maîtres pâtissiers façonnant la pâte dans un atelier algérois"
            />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="text-brand-accent text-sm md:text-base uppercase tracking-[0.2em] mb-6 block">
            Héritage
          </span>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-8 leading-tight">
            {titre || "Des gestes transmis de génération en génération"}
          </h2>
          <p className="text-sm leading-relaxed opacity-80 mb-8 max-w-md">
            {texte ||
              "Depuis trois générations, la famille Nali perpétue le savoir-faire des maîtres pâtissiers d'Alger. Aucune machine ne remplace la main : chaque pli, chaque dosage reste une affaire de mémoire et de patience."}
          </p>

          {fondSombre ? (
            <a
              href="/a-propos"
              className="inline-flex items-center gap-3 px-8 py-3 border border-brand-accent/60 rounded-full text-sm uppercase tracking-widest transition-all duration-500 hover:bg-brand-accent hover:text-brand-dark"
            >
              Découvrir notre histoire
            </a>
          ) : (
            <a
              href="/a-propos"
              className="inline-flex items-center gap-3 px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest transition-all duration-500 hover:bg-brand-accent hover:text-brand-dark"
            >
              Découvrir notre histoire
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
