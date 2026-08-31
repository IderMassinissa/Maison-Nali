const db = require("../db/connection");

function getActiveAnnouncement() {
  return db
    .prepare("SELECT * FROM announcements WHERE active = 1 LIMIT 1")
    .get();
}

function setAnnouncement(message, active) {
  const existing = db.prepare("SELECT id FROM announcements LIMIT 1").get();
  if (existing) {
    return db
      .prepare("UPDATE announcements SET message = ?, active = ? WHERE id = ?")
      .run(message, active ? 1 : 0, existing.id);
  }
  return db
    .prepare("INSERT INTO announcements (message, active) VALUES (?, ?)")
    .run(message, active ? 1 : 0);
}

module.exports = { getActiveAnnouncement, setAnnouncement };
