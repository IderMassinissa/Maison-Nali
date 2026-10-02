const db = require("./connection");

const jours = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
const existeDeja = db.prepare(
  "SELECT 1 FROM opening_hours WHERE day = ?",
);
const insert = db.prepare(
  "INSERT INTO opening_hours (day, open_time, close_time) VALUES (?, ?, ?)",
);

let crees = 0;
jours.forEach((jour) => {
  if (existeDeja.get(jour)) return;
  if (jour === "Lundi") {
    insert.run(jour, null, null); // fermé
  } else {
    insert.run(jour, "11:00", "19:00");
  }
  crees += 1;
});

if (crees === 0) {
  console.log("Horaires déjà présents, rien à faire.");
} else {
  console.log(`Horaires initiaux créés (${crees} jour(s)).`);
}
