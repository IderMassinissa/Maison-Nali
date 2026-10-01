export default function BlocEntete({ libelle, titre, intro }) {
  return (
    <section className="py-section-y md:py-section-y-lg px-6 md:px-12 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl md:text-[3.5rem] leading-tight tracking-tight mb-6">
          {titre}
        </h1>
        {libelle && (
          <>
            <div className="w-10 h-px bg-brand-accent mx-auto mb-6" />
            <h2 className="text-lg md:text-xl font-sans font-normal mb-6">
              {libelle}
            </h2>
          </>
        )}
        {intro && (
          <p className="text-base md:text-[1.0625rem] leading-relaxed opacity-80 max-w-2xl mx-auto">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
