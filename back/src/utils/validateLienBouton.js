/**
 * Valide un lien de bouton partagé par plusieurs types de blocs (hero,
 * bloc-histoire...) et par products.video_url. N'autorise que :
 * - un chemin interne au site ("/patisseries", "/adresse"...) ;
 * - une URL externe en HTTPS explicite ("https://...").
 * Rejette tout le reste, en particulier les schémas comme "javascript:" ou
 * "data:" qui, rendus tels quels dans un attribut href, déclencheraient du
 * code arbitraire au clic (XSS stocké) — et "http://" non chiffré, par
 * prudence.
 */
/** @returns {{valid: true, lienBouton: string} | {valid: false, error: string}} */
function validateLienBouton(lienBouton, { max = 200 } = {}) {
  const lien = lienBouton && lienBouton.trim() ? lienBouton.trim() : "";

  if (!lien) {
    return { valid: true, lienBouton: "" };
  }

  const estInterne = lien.startsWith("/");
  const estHttps = lien.startsWith("https://");

  if (!estInterne && !estHttps) {
    return {
      valid: false,
      error:
        'Le lien du bouton doit être un chemin interne ("/...") ou une URL "https://"',
    };
  }

  if (lien.length > max) {
    return {
      valid: false,
      error: `Le lien du bouton ne doit pas dépasser ${max} caractères`,
    };
  }

  return { valid: true, lienBouton: lien };
}

module.exports = { validateLienBouton };
