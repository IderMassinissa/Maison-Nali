/**
 * Validation d'une valeur de réglage selon sa clé — extrait de
 * routes/settings.js (PUT /:key) pour être réutilisé tel quel par l'import
 * de contenu (db/content-import.js). Mêmes règles des deux côtés, jamais
 * une copie qui pourrait diverger. Clés sans règle dédiée (adresse...) :
 * acceptées telles quelles.
 */
const { validatePhone } = require("./phone");

const REGEX_URL = /^https?:\/\/.+/;

/** @returns {{valid: true} | {valid: false, error: string}} */
function validateSettingValue(key, value) {
  if (key.startsWith("social_") && value && !REGEX_URL.test(value)) {
    return { valid: false, error: "Lien invalide, une URL http(s) est attendue" };
  }

  if (key === "phone" && value && !validatePhone(value)) {
    return {
      valid: false,
      error:
        "Numéro invalide (chiffres, espaces, +, ., -, () uniquement, entre 6 et 20 caractères)",
    };
  }

  return { valid: true };
}

module.exports = { validateSettingValue };
