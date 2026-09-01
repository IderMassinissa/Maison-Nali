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
const insert = db.prepare(
  "INSERT INTO opening_hours (day, open_time, close_time) VALUES (?, ?, ?)",
);

jours.forEach((jour) => {
  if (jour === "Lundi") {
    insert.run(jour, null, null); // fermé
  } else {
    insert.run(jour, "11:00", "19:00");
  }
});

console.log("Horaires initiaux créés.");
