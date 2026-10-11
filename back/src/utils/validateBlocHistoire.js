/**
 * Validation du bouton optionnel d'un bloc-histoire (texte + lien),
 * utilisée par validateSectionContent.js. Délègue la validation du lien à
 * validateLienBouton.js — ne duplique pas ses règles.
 */
const { validateLienBouton } = require("./validateLienBouton");

/** @returns {{valid: true, texteBouton: string, lienBouton: string} | {valid: false, error: string}} */
function validateBlocHistoire(texteBouton, lienBouton) {
  const texte = texteBouton && texteBouton.trim() ? texteBouton.trim() : "";

  if (texte.length > 50) {
    return {
      valid: false,
      error: "Le texte du bouton ne doit pas dépasser 50 caractères",
    };
  }

  const validationLien = validateLienBouton(lienBouton);
  if (!validationLien.valid) {
    return validationLien;
  }

  return { valid: true, texteBouton: texte, lienBouton: validationLien.lienBouton };
}

module.exports = { validateBlocHistoire };
