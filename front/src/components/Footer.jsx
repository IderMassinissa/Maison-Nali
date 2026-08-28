export default function Footer() {
  return (
    <footer className="bg-[#0b1a14] text-brand-light py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
        <div>
          <a
            href="/"
            className="font-display text-2xl tracking-tight block mb-4 text-brand-accent uppercase"
          >
            Maison Nali
          </a>
          <p className="text-xs uppercase tracking-widest opacity-60">
            Gardiens de la douceur algérienne
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <a
            href="/patisseries"
            className="text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
          >
            Pâtisseries
          </a>
          <a
            href="/a-propos"
            className="text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
          >
            À propos
          </a>
          <a
            href="/adresse"
            className="text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
          >
            Adresse
          </a>
        </div>

        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-4">
            <a
              href="#"
              className="text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
            >
              Facebook
            </a>
          </div>
          <p className="text-[10px] opacity-40">
            © 2026 Maison Nali. Tous droits réservés.
          </p>
          <a
            href="/mentions-legales"
            className="text-[10px] opacity-40 hover:opacity-100 transition-opacity"
          >
            Mentions légales
          </a>
        </div>
      </div>
    </footer>
  );
}
