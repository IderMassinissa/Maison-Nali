/**
 * Accès SQL à la table `announcements` (bannière d'annonce du site, une
 * seule ligne active à la fois). Appelé par routes/announcements.js après
 * validation (validateBannerDates.js) ; ne valide rien lui-même.
 */
const db = require("../db/connection");

/** @returns {object|undefined} l'unique annonce en base, ou undefined si aucune n'existe encore. */
function getAnnouncement() {
  return db.prepare("SELECT * FROM announcements LIMIT 1").get();
}

/** Crée l'annonce si aucune n'existe, sinon met à jour l'unique ligne existante. */
function setAnnouncement(message, active, startDate, endDate) {
  const existing = db.prepare("SELECT id FROM announcements LIMIT 1").get();
  if (existing) {
    return db
      .prepare(
        "UPDATE announcements SET message = ?, active = ?, start_date = ?, end_date = ? WHERE id = ?",
      )
      .run(message, active ? 1 : 0, startDate, endDate, existing.id);
  }
  return db
    .prepare(
      "INSERT INTO announcements (message, active, start_date, end_date) VALUES (?, ?, ?, ?)",
    )
    .run(message, active ? 1 : 0, startDate, endDate);
}

module.exports = { getAnnouncement, setAnnouncement };
