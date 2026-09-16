const db = require("./connection");

const result = db
  .prepare("UPDATE sections SET type = 'bloc-patisseries' WHERE type = 'grille-patisseries'")
  .run();

console.log(`Migration terminée : ${result.changes} bloc(s) mis à jour.`);
