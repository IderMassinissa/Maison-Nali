/**
 * Accès SQL à la table `opening_hours` (7 lignes fixes, une par jour,
 * créées une fois pour toutes par content:import — aucune route de
 * création/suppression). Affiché sur toutes les pages publiques via
 * HorairesTable.jsx, modifiable depuis /admin/coordonnees.
 */
const db = require("../db/connection");

/** @returns {object[]} les 7 lignes d'horaires (une par jour). */
function getAllOpeningHours() {
  return db.prepare("SELECT * FROM opening_hours").all();
}

/** Met à jour les horaires d'ouverture/fermeture d'un jour donné. */
function updateOpeningHour(id, openTime, closeTime) {
  return db
    .prepare(
      "UPDATE opening_hours SET open_time = ?, close_time = ? WHERE id = ?",
    )
    .run(openTime, closeTime, id);
}

module.exports = { getAllOpeningHours, updateOpeningHour };
