import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const boutonOuvrirRef = useRef(null);
  const menuRef = useRef(null);

  const liens = [
    { href: "/patisseries", label: "Pâtisseries" },
    { href: "/evenements", label: "Événements" },
    { href: "/a-propos", label: "À propos" },
    { href: "/adresse", label: "Adresse" },
  ];

  // Ferme le menu et rend le focus au bouton qui l'a ouvert -- utilisé pour
  // une fermeture "annulée" (croix, Échap), pas pour un clic sur un lien
  // (qui navigue déjà ailleurs, le focus suit naturellement).
  function fermerEtRendreLeFocus() {
    setMenuOuvert(false);
    boutonOuvrirRef.current?.focus();
  }

  // Piège de focus + fermeture au clavier pendant que le menu plein écran
  // est ouvert : sans ça, Tab fait sortir le focus vers le contenu de la
  // page masqué derrière l'overlay (mesuré en pratique, cf.
  // Documentation/A11y_Perf_Passe1_2026-10-09.md, C1), et Échap ne
  // fermait rien.
  useEffect(() => {
    if (!menuOuvert) return;

    const noeudsFocusables = menuRef.current?.querySelectorAll("a[href], button");
    noeudsFocusables?.[0]?.focus();

    function gererClavier(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        fermerEtRendreLeFocus();
        return;
      }

      if (e.key !== "Tab" || !noeudsFocusables?.length) return;

      const premier = noeudsFocusables[0];
      const dernier = noeudsFocusables[noeudsFocusables.length - 1];

      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    }

    document.addEventListener("keydown", gererClavier);
    return () => document.removeEventListener("keydown", gererClavier);
  }, [menuOuvert]);

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
            ref={boutonOuvrirRef}
            className="md:hidden w-10 h-10 flex items-center justify-center text-brand-dark flex-shrink-0"
            onClick={() => setMenuOuvert(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOuvert}
            aria-controls="menu-mobile"
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
              className="text-sm uppercase tracking-widest font-semibold text-brand-dark opacity-80 hover:opacity-100 transition-opacity"
            >
              {lien.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Menu plein écran mobile */}
      {menuOuvert && (
        <div
          ref={menuRef}
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          className="fixed inset-0 z-[60] bg-brand-dark text-brand-light flex flex-col items-center justify-center gap-10 overflow-y-auto md:hidden"
        >
          <button
            className="absolute top-6 right-6 text-2xl"
            onClick={fermerEtRendreLeFocus}
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
