/**
 * Construit un lien `tel:` cliquable depuis un numéro affiché en texte
 * libre (espaces, points...). Retire tout caractère non numérique sauf
 * les `+`, puis n'garde que celui en tête (un `+` ailleurs qu'au début
 * n'est pas un indicatif international valide).
 * @returns {string} le lien tel: prêt à l'emploi, ou chaîne vide si numéro absent.
 */
export function telHref(numero) {
  if (!numero) return "";
  const nettoye = numero.replace(/[^0-9+]/g, "");
  return `tel:${nettoye.replace(/(?!^)\+/g, "")}`;
}
