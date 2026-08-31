const db = require("../db/connection");

function getAllCategories() {
  return db.prepare("SELECT * FROM categories").all();
}

function createCategory(name) {
  return db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
}

module.exports = { getAllCategories, createCategory };
