export default function BlocEntete({ libelle, titre, intro }) {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 text-center">
      <div className="max-w-3xl mx-auto">
        {libelle && (
          <span className="text-brand-accent text-sm md:text-base uppercase tracking-[0.2em] mb-6 block">
            {libelle}
          </span>
        )}
        <h1 className="font-display text-4xl md:text-6xl tracking-tight mb-6">
          {titre}
        </h1>
        {intro && (
          <p className="text-sm md:text-base leading-relaxed opacity-80 max-w-2xl mx-auto">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
