const REGEX_COULEUR_HEX = /^#[0-9A-Fa-f]{6}$/;
const GRADIENT_STYLES_AUTORISES = ["diagonal", "vertical", "horizontal", "radial"];

// Valide les 4 champs couleur d'un bloc de contenu (content JSON d'une section) :
// couleur, couleurGradientActif, couleurGradientFin, couleurGradientStyle.
// Chaque champ est optionnel (bloc jamais personnalisé) mais doit être valide s'il est présent.
// Retourne un message d'erreur (string) si invalide, sinon null.
function validerCouleursContenu(contenu) {
  if (!contenu || typeof contenu !== "object") return null;

  if (
    contenu.couleur !== undefined &&
    contenu.couleur !== "" &&
    !REGEX_COULEUR_HEX.test(contenu.couleur)
  ) {
    return "Couleur invalide, format hexadécimal attendu (#RRGGBB)";
  }

  if (
    contenu.couleurGradientFin !== undefined &&
    contenu.couleurGradientFin !== "" &&
    !REGEX_COULEUR_HEX.test(contenu.couleurGradientFin)
  ) {
    return "Couleur de fin de dégradé invalide, format hexadécimal attendu (#RRGGBB)";
  }

  if (
    contenu.couleurGradientActif !== undefined &&
    typeof contenu.couleurGradientActif !== "boolean"
  ) {
    return "Valeur booléenne attendue pour l'activation du dégradé";
  }

  if (
    contenu.couleurGradientStyle !== undefined &&
    contenu.couleurGradientStyle !== "" &&
    !GRADIENT_STYLES_AUTORISES.includes(contenu.couleurGradientStyle)
  ) {
    return "Style de dégradé non autorisé";
  }

  return null;
}

module.exports = {
  REGEX_COULEUR_HEX,
  GRADIENT_STYLES_AUTORISES,
  validerCouleursContenu,
};
