/**
 * Balaie toutes les tables/colonnes texte de la base pour trouver chaque nom
 * de fichier référencé via "/uploads/..." — plutôt qu'une liste figée de
 * colonnes (photo_url, content JSON, image_url...), ça couvre aussi bien
 * les colonnes dédiées que les blobs JSON des sections, sans risquer d'en
 * oublier une si le schéma évolue. Lit uniquement la base ; n'écrit rien.
 * Réutilisé par optimize-uploads.js (pour repérer les fichiers orphelins à
 * ne jamais toucher) et content-import.js (fichiers référencés mais
 * absents du disque après un import sans les photos elles-mêmes).
 */
const db = require("./connection");

/**
 * @returns {Set<string>} noms de fichiers (sans le préfixe /uploads/)
 * référencés par au moins une ligne de la base.
 */
function trouverFichiersReferences() {
  const references = new Set();
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((r) => r.name);

  for (const table of tables) {
    const colonnes = db.prepare(`PRAGMA table_info(${table})`).all();
    const lignes = db.prepare(`SELECT * FROM ${table}`).all();
    for (const ligne of lignes) {
      for (const colonne of colonnes) {
        const valeur = ligne[colonne.name];
        if (typeof valeur !== "string") continue;
        for (const m of valeur.matchAll(/\/uploads\/([^"'\s)]+)/g)) {
          references.add(m[1]);
        }
      }
    }
  }
  return references;
}

module.exports = { trouverFichiersReferences };
