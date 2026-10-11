/**
 * Accès SQL à la table `sections` (les blocs de contenu de chaque page —
 * Hero, bloc-histoire, bloc-localisation...). `content` est une chaîne
 * JSON brute en base, parsée/validée côté appelant (routes/pages.js,
 * utils/validateSectionContent.js) ; ce repository ne touche jamais à son
 * contenu, seulement à la chaîne telle quelle.
 */
const db = require("../db/connection");

/** @returns {object[]} les sections d'une page, triées par position d'affichage. */
function getSectionsByPageId(pageId) {
  return db
    .prepare("SELECT * FROM sections WHERE page_id = ? ORDER BY position")
    .all(pageId);
}

/** Remplace le contenu JSON (déjà sérialisé en chaîne) d'une section. */
function updateSectionContent(id, content) {
  return db
    .prepare("UPDATE sections SET content = ? WHERE id = ?")
    .run(content, id);
}

/** @returns {object|undefined} la section de cet id, ou undefined si elle n'existe pas. */
function getSectionById(id) {
  return db.prepare("SELECT * FROM sections WHERE id = ?").get(id);
}

module.exports = {
  getSectionsByPageId,
  getSectionById,
  updateSectionContent,
};
