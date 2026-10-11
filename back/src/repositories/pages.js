/**
 * Accès SQL à la table `pages` (les 6 pages du site, fixes — pas de
 * création/suppression dynamique, seulement le contenu de leurs sections
 * est modifiable depuis l'admin). Lu par routes/pages.js pour composer
 * chaque page publique avec ses sections (voir repositories/sections.js).
 */
const db = require("../db/connection");

/** @returns {object[]} toutes les pages, triées par position (ordre de nav admin). */
function getAllPages() {
  return db.prepare("SELECT * FROM pages ORDER BY position").all();
}

/** @returns {object|undefined} la page de ce slug, ou undefined si elle n'existe pas. */
function getPageBySlug(slug) {
  return db.prepare("SELECT * FROM pages WHERE slug = ?").get(slug);
}

module.exports = { getAllPages, getPageBySlug };
