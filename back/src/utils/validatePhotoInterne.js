/**
 * Valide un chemin de photo stockée via l'upload admin (products.photo_url,
 * sections.content.photo pour hero/bloc-histoire/bloc-localisation). Même
 * principe que validateEventPhoto.js : seuls les fichiers réellement
 * uploadés sont acceptés ("/uploads/<nom-sûr>.<extension-image>"), jamais
 * une URL externe ou un chemin arbitraire. Une valeur vide (pas de photo,
 * le placeholder s'affiche) reste acceptée.
 */
const REGEX_PHOTO = /^\/uploads\/[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i;

/** @returns {{valid: true, photo: string} | {valid: false, error: string}} */
function validatePhotoInterne(valeur, { max = 300 } = {}) {
  const photo = valeur && valeur.trim() ? valeur.trim() : "";

  if (!photo) {
    return { valid: true, photo: "" };
  }

  if (photo.length > max || photo.includes("..") || !REGEX_PHOTO.test(photo)) {
    return {
      valid: false,
      error:
        "Chemin de photo invalide (uniquement un fichier uploadé en jpg, png ou webp)",
    };
  }

  return { valid: true, photo };
}

module.exports = { validatePhotoInterne };
