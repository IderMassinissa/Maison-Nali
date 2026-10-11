/**
 * Validation d'une paire d'horaires d'ouverture (routes/openingHours.js).
 * Les deux heures doivent être renseignées ensemble ou vides ensemble (jour
 * fermé) — jamais une seule des deux.
 */
const REGEX_HEURE = /^\d{2}:\d{2}$/;

/** @returns {{valid: true, openTime: string|null, closeTime: string|null} | {valid: false, error: string}} */
function validateOpeningHours(openTime, closeTime) {
  const ouverture = openTime && openTime.trim() ? openTime.trim() : null;
  const fermeture = closeTime && closeTime.trim() ? closeTime.trim() : null;

  if (!ouverture && !fermeture) {
    return { valid: true, openTime: null, closeTime: null };
  }

  if (!ouverture || !fermeture) {
    return {
      valid: false,
      error:
        "L'heure d'ouverture et l'heure de fermeture doivent être renseignées ensemble",
    };
  }

  if (!REGEX_HEURE.test(ouverture) || !REGEX_HEURE.test(fermeture)) {
    return { valid: false, error: "Format d'heure invalide (attendu : HH:MM)" };
  }

  if (fermeture <= ouverture) {
    return {
      valid: false,
      error: "L'heure de fermeture doit être après l'heure d'ouverture",
    };
  }

  return { valid: true, openTime: ouverture, closeTime: fermeture };
}

module.exports = { validateOpeningHours };
