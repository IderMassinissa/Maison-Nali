/**
 * Connexion SQLite unique, partagée par tous les repositories et scripts
 * (`require("./connection")` renvoie toujours la même instance ouverte).
 * Choisit le fichier selon NODE_ENV : base applicative normale, ou
 * data/test.sqlite en mode test (régénérée à chaque run par init-test.js).
 * Aucune donnée ne transite ici : ce module expose seulement la connexion,
 * les lectures/écritures réelles vivent dans back/src/repositories/.
 */
const Database = require("better-sqlite3");
const path = require("path");

const isTest = process.env.NODE_ENV === "test";
const dbPath = isTest
  ? path.join(__dirname, "../../data/test.sqlite")
  : path.join(__dirname, "../../data/maison-nali.sqlite");

const db = new Database(dbPath);

if (isTest) {
  // node --test lance les fichiers de test en parallèle : plusieurs process
  // ouvrent back/data/test.sqlite en même temps. Le mode journal par défaut
  // (rollback journal) provoque alors des SQLITE_BUSY intermittents.
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
}

module.exports = db;
