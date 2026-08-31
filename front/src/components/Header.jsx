import { useState } from "react";

export default function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  const liens = [
    { href: "/patisseries", label: "Pâtisseries" },
    { href: "/a-propos", label: "À propos" },
    { href: "/adresse", label: "Adresse" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 h-24 flex items-center justify-between bg-brand-light/90 backdrop-blur-md border-b border-brand-border/50">
        <div className="flex-1 hidden md:block"></div>

        <div className="flex-shrink-0">
          <a
            href="/"
            className="font-display text-2xl md:text-4xl tracking-tight leading-none text-brand-dark uppercase"
          >
            Maison Nali
          </a>
        </div>

        {/* Nav desktop */}
        <div className="flex-1 hidden md:flex justify-end items-center gap-10">
          {liens.map((lien) => (
            <a
              key={lien.href}
              href={lien.href}
              className="text-xs uppercase tracking-widest font-semibold text-brand-dark opacity-70 hover:opacity-100 transition-opacity"
            >
              {lien.label}
            </a>
          ))}
        </div>

        {/* Bouton hamburger mobile */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-brand-dark flex-1 justify-self-end ml-auto"
          onClick={() => setMenuOuvert(true)}
          aria-label="Ouvrir le menu"
        >
          <span className="text-2xl">☰</span>
        </button>
      </header>

      {/* Menu plein écran mobile */}
      {menuOuvert && (
        <div className="fixed inset-0 z-[60] bg-brand-dark text-brand-light flex flex-col items-center justify-center gap-10 md:hidden">
          <button
            className="absolute top-6 right-6 text-2xl"
            onClick={() => setMenuOuvert(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
          {liens.map((lien) => (
            <a
              key={lien.href}
              href={lien.href}
              onClick={() => setMenuOuvert(false)}
              className="font-display text-4xl tracking-tight"
            >
              {lien.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
