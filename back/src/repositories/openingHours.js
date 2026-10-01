const db = require("../db/connection");

function getAllOpeningHours() {
  return db.prepare("SELECT * FROM opening_hours").all();
}

function updateOpeningHour(id, openTime, closeTime) {
  return db
    .prepare(
      "UPDATE opening_hours SET open_time = ?, close_time = ? WHERE id = ?",
    )
    .run(openTime, closeTime, id);
}

module.exports = { getAllOpeningHours, updateOpeningHour };
