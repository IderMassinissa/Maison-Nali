/**
 * Validation du format d'un numéro de téléphone saisi dans l'admin
 * (réglage `phone`). Accepte chiffres, espaces, +, points, parenthèses et
 * tirets, 6 à 20 caractères — volontairement permissif (formats français
 * et internationaux), pas une validation de numéro réel.
 */
const REGEX_PHONE = /^[0-9 +.()-]{6,20}$/;

/** @returns {boolean} vrai si la valeur est une chaîne au format téléphone accepté. */
function validatePhone(value) {
  return typeof value === "string" && REGEX_PHONE.test(value);
}

module.exports = { validatePhone };
