export default function ServiceIndisponible() {
  return (
    <div className="px-6 md:px-12 py-24 md:py-32 max-w-xl mx-auto text-center">
      <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-6">
        Site momentanément indisponible
      </h1>
      <p className="text-sm md:text-base leading-relaxed opacity-80">
        Merci de réessayer dans quelques instants.
      </p>
    </div>
  );
}
