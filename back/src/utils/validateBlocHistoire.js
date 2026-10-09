const { validateLienBouton } = require("./validateLienBouton");

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
