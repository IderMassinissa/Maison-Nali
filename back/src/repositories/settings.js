/**
 * Accès SQL à la table `settings` (paires clé/valeur génériques — adresse,
 * téléphone, réseaux sociaux...). Valeur toujours stockée en texte brut,
 * validée côté appelant (utils/validateSettingValue.js) selon la clé.
 */
const db = require("../db/connection");

/** @returns {string|null} la valeur de ce réglage, ou null s'il n'existe pas. */
function getSetting(key) {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row ? row.value : null;
}

/** Crée le réglage s'il n'existe pas encore, sinon met à jour sa valeur. */
function setSetting(key, value) {
  const existing = db.prepare("SELECT id FROM settings WHERE key = ?").get(key);
  if (existing) {
    return db
      .prepare("UPDATE settings SET value = ? WHERE key = ?")
      .run(value, key);
  }
  return db
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
    .run(key, value);
}

module.exports = { getSetting, setSetting };
