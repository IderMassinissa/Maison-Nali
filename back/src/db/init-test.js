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
