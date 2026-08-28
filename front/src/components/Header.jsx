export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-12 h-24 flex items-center justify-between bg-brand-light/90 backdrop-blur-md border-b border-brand-border/50">
      <div className="flex-1"></div>

      <div className="flex-shrink-0">
        <a
          href="/"
          className="font-display text-3xl md:text-4xl tracking-tight leading-none text-brand-dark uppercase"
        >
          Maison Nali
        </a>
      </div>

      <div className="flex-1 flex justify-end items-center gap-10">
        <a
          href="/patisseries"
          className="text-xs uppercase tracking-widest font-semibold text-brand-dark opacity-70 hover:opacity-100 transition-opacity"
        >
          Pâtisseries
        </a>
        <a
          href="/a-propos"
          className="text-xs uppercase tracking-widest font-semibold text-brand-dark opacity-70 hover:opacity-100 transition-opacity"
        >
          À propos
        </a>
        <a
          href="/adresse"
          className="text-xs uppercase tracking-widest font-semibold text-brand-dark opacity-70 hover:opacity-100 transition-opacity"
        >
          Adresse
        </a>
      </div>
    </header>
  );
}
