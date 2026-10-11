/**
 * Visuel de repli affiché à la place d'une photo absente ou en échec de
 * chargement (voir ImageAvecRepli, qui est le seul composant à en décider
 * l'affichage). Le SVG est décoratif et marqué aria-hidden ; `children`
 * permet d'y glisser un texte sr-only portant l'alt d'origine.
 */
export default function PlaceholderPhoto({ className = "", children }) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-brand-gradient ${className}`}
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
        className="text-brand-accent/70"
      >
        <rect
          x="8"
          y="8"
          width="22"
          height="22"
          stroke="currentColor"
          strokeWidth="1"
          transform="rotate(45 22 22)"
        />
        <circle cx="22" cy="22" r="2" fill="currentColor" />
      </svg>
      {children}
    </div>
  );
}
