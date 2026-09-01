export default function Hero({ titre, sousTitre }) {
  return (
    <section className="relative h-[800px]">
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          src="/images/hero-baklawa.jpg"
          alt="Pâtisseries algériennes dorées, glacées au miel"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/35 to-brand-dark/55"></div>
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

        <a
          href="/patisseries"
          className="px-8 py-3 border border-brand-accent/60 rounded-full text-sm uppercase tracking-widest bg-brand-accent/10 hover:scale-105 transition-transform"
        >
          Découvrir nos pâtisseries
        </a>
      </div>
    </section>
  );
}
