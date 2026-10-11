/**
 * Reparse le `content` JSON d'une section (stocké en base comme une
 * chaîne brute). Ne lève jamais : un contenu absent ou invalide retombe
 * sur un objet vide plutôt que de faire planter le composant appelant.
 * @returns {object} le contenu parsé, ou {} si absent/invalide.
 */
export function parseContenuSection(content) {
  try {
    return JSON.parse(content || "{}");
  } catch {
    return {};
  }
}
