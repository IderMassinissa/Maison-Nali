function validateBlocHistoire(texteBouton, lienBouton) {
  const texte = texteBouton && texteBouton.trim() ? texteBouton.trim() : "";
  const lien = lienBouton && lienBouton.trim() ? lienBouton.trim() : "";

  if (texte.length > 50) {
    return {
      valid: false,
      error: "Le texte du bouton ne doit pas dépasser 50 caractères",
    };
  }

  if (lien && !lien.startsWith("/")) {
    return {
      valid: false,
      error: 'Le lien du bouton doit être un chemin interne commençant par "/"',
    };
  }

  if (lien.length > 200) {
    return {
      valid: false,
      error: "Le lien du bouton ne doit pas dépasser 200 caractères",
    };
  }

  return { valid: true, texteBouton: texte, lienBouton: lien };
}

module.exports = { validateBlocHistoire };
