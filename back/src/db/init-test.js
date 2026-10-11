/**
 * Régénère data/test.sqlite avec un schéma neuf avant chaque run de tests
 * (lancé automatiquement par le hook `pretest` de package.json). Supprime
 * l'ancien fichier de test s'il existe, puis réapplique database.sql — les
 * tests démarrent donc toujours sur une base vide et à jour.
 */
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../data/test.sqlite");
const schemaPath = path.join(__dirname, "database.sql");

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);
db.exec(fs.readFileSync(schemaPath, "utf8"));
db.close();
