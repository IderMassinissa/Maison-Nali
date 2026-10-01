const db = require("./connection");

const colonnes = db.prepare("PRAGMA table_info(announcements)").all().map((c) => c.name);

if (!colonnes.includes("start_date")) {
  db.exec("ALTER TABLE announcements ADD COLUMN start_date TEXT");
  console.log("Colonne start_date ajoutée.");
} else {
  console.log("Colonne start_date déjà présente.");
}

if (!colonnes.includes("end_date")) {
  db.exec("ALTER TABLE announcements ADD COLUMN end_date TEXT");
  console.log("Colonne end_date ajoutée.");
} else {
  console.log("Colonne end_date déjà présente.");
}
