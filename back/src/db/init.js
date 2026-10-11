/**
 * Script d'installation initiale (`npm run init-db`) : crée le fichier
 * SQLite applicatif et y applique le schéma lu depuis database.sql.
 * À lancer une seule fois sur une base neuve — `CREATE TABLE` échoue si
 * les tables existent déjà (pas de garde explicite, l'erreur SQLite suffit
 * à empêcher une double initialisation accidentelle).
 */
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../data/maison-nali.sqlite");
const schemaPath = path.join(__dirname, "database.sql");

const db = new Database(dbPath);

const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);

console.log("Base de données initialisée :", dbPath);

db.close();
