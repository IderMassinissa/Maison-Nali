import { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  const liens = [
    { href: "/patisseries", label: "Pâtisseries" },
    { href: "/evenements", label: "Événements" },
    { href: "/a-propos", label: "À propos" },
    { href: "/adresse", label: "Adresse" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 border-b border-brand-border/30 shadow-soft bg-brand-light">
        <div className="h-24 px-6 md:px-12 flex items-center justify-between md:justify-center">
          <div className="w-10 flex-shrink-0 md:hidden"></div>

          <Link
            to="/"
            className="font-display text-2xl md:text-4xl tracking-tight leading-none text-brand-dark uppercase"
          >
            Maison Nali
          </Link>

          {/* Bouton hamburger mobile */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-brand-dark flex-shrink-0"
            onClick={() => setMenuOuvert(true)}
            aria-label="Ouvrir le menu"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>

        {/* Nav desktop, sous le logo */}
        <nav className="hidden md:flex justify-center items-center gap-10 h-14 border-t border-brand-border/20">
          {liens.map((lien) => (
            <Link
              key={lien.href}
              to={lien.href}
              className="text-xs uppercase tracking-widest font-semibold text-brand-dark opacity-70 hover:opacity-100 transition-opacity"
            >
              {lien.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Menu plein écran mobile */}
      {menuOuvert && (
        <div className="fixed inset-0 z-[60] bg-brand-dark text-brand-light flex flex-col items-center justify-center gap-10 overflow-y-auto md:hidden">
          <button
            className="absolute top-6 right-6 text-2xl"
            onClick={() => setMenuOuvert(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
          {liens.map((lien) => (
            <Link
              key={lien.href}
              to={lien.href}
              onClick={() => setMenuOuvert(false)}
              className="font-display text-4xl tracking-tight"
            >
              {lien.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
