export default function BlocEntete({ libelle, titre, intro, estPremier = true }) {
  const TitreTag = estPremier ? "h1" : "h2";
  const LibelleTag = estPremier ? "h2" : "h3";

  return (
    <section
      className={`px-6 md:px-12 text-center bg-brand-light ${
        intro
          ? "pt-section-y md:pt-section-y-lg pb-section-y md:pb-section-y-lg"
          : "pt-12 md:pt-16 pb-6 md:pb-8"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <TitreTag className="font-display text-4xl md:text-[3.5rem] leading-tight tracking-tight mb-6">
          {titre}
        </TitreTag>
        {libelle && (
          <>
            <div className="w-10 h-px bg-brand-accent mx-auto mb-6" />
            <LibelleTag className="text-lg md:text-xl font-sans font-normal text-brand-dark/70 mb-6">
              {libelle}
            </LibelleTag>
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
