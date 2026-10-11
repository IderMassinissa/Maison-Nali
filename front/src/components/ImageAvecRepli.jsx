import { useState } from "react";
import PlaceholderPhoto from "./PlaceholderPhoto";

// Repli commun a tous les <img> dynamiques publics (photo absente en base
// OU fichier manquant sur le disque -> 404 au chargement) : un seul
// basculement vers PlaceholderPhoto, jamais vers une icone d'image cassee.
// L'alt d'origine reste accessible (texte sr-only dans le placeholder),
// sans faire annoncer une fausse image par un lecteur d'ecran (le SVG du
// placeholder reste aria-hidden). className est applique aux deux branches
// pour garder exactement les memes dimensions/ratio (pas de CLS).
export default function ImageAvecRepli({
  src,
  alt,
  className = "",
  loading,
  style,
}) {
  const [enErreur, setEnErreur] = useState(false);
  const [srcPrecedent, setSrcPrecedent] = useState(src);

  // Ajuste l'etat pendant le rendu plutot que dans un effet (pattern React
  // recommande) : une nouvelle src (nouvelle photo) merite une nouvelle
  // chance avant de retomber sur le placeholder.
  if (src !== srcPrecedent) {
    setSrcPrecedent(src);
    setEnErreur(false);
  }

  if (!src || enErreur) {
    return (
      <PlaceholderPhoto className={className}>
        {alt && <span className="sr-only">{alt}</span>}
      </PlaceholderPhoto>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      style={style}
      onError={() => setEnErreur(true)}
    />
  );
}
