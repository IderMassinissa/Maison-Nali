const Database = require("better-sqlite3");
const path = require("path");

const isTest = process.env.NODE_ENV === "test";
const dbPath = isTest
  ? path.join(__dirname, "../../data/test.sqlite")
  : path.join(__dirname, "../../data/maison-nali.sqlite");

const db = new Database(dbPath);

module.exports = db;
