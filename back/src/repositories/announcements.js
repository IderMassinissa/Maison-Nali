const db = require("../db/connection");

function getAnnouncement() {
  return db.prepare("SELECT * FROM announcements LIMIT 1").get();
}

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
