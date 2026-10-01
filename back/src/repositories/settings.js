const db = require("../db/connection");

function getSetting(key) {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row ? row.value : null;
}

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
