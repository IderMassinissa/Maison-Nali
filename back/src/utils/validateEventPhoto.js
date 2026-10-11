/**
 * Validation d'une entrée de la galerie événements (routes/eventPhotos.js).
 * imageUrl doit être un chemin /uploads/... réel (même règle que
 * validatePhotoInterne.js) — jamais une URL externe ni un chemin arbitraire.
 */
const REGEX_IMAGE_URL = /^\/uploads\/[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i;
const ALT_MAX = 150;

/** @returns {{valid: true, imageUrl: string, alt: string|null, position: number|undefined} | {valid: false, error: string}} */
function validateEventPhoto({ imageUrl, alt, position } = {}) {
  if (
    typeof imageUrl !== "string" ||
    imageUrl.includes("..") ||
    !REGEX_IMAGE_URL.test(imageUrl)
  ) {
    return {
      valid: false,
      error:
        "Chemin d'image invalide (uniquement des fichiers uploadés en jpg, png ou webp)",
    };
  }

  const texteAlt = typeof alt === "string" ? alt.trim() : "";
  if (texteAlt.length > ALT_MAX) {
    return {
      valid: false,
      error: `Le texte alternatif ne doit pas dépasser ${ALT_MAX} caractères`,
    };
  }

  if (position !== undefined && !Number.isInteger(position)) {
    return { valid: false, error: "Position invalide" };
  }

  return { valid: true, imageUrl, alt: texteAlt || null, position };
}

module.exports = { validateEventPhoto };
