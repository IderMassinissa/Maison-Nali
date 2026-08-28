export default function BlocReseauxSociaux() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-brand-dark text-brand-light">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-brand-accent text-xs uppercase tracking-[0.2em] mb-6 block">
          Restons en contact
        </span>
        <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-8">
          Suivez nos pas
        </h2>
        <p className="text-sm leading-relaxed opacity-70 max-w-lg mx-auto mb-12">
          Retrouvez nos créations du moment, les coulisses de l'atelier et nos
          temps forts saisonniers sur les réseaux.
        </p>
        <div className="flex items-center justify-center gap-6">
          <a
            href="#"
            className="w-14 h-14 rounded-full border border-brand-accent/40 flex items-center justify-center text-lg transition-all duration-500 hover:bg-brand-accent hover:text-brand-dark"
          >
            IG
          </a>

          <a
            href="#"
            className="w-14 h-14 rounded-full border border-brand-accent/40 flex items-center justify-center text-lg transition-all duration-500 hover:bg-brand-accent hover:text-brand-dark"
          >
            FB
          </a>
        </div>
      </div>
    </section>
  );
}
