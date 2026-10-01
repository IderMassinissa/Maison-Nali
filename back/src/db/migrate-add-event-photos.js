const db = require("./connection");

db.exec(`
  CREATE TABLE IF NOT EXISTS event_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    alt TEXT,
    position INTEGER NOT NULL DEFAULT 0
  )
`);

console.log("Table event_photos vérifiée/créée.");
