// Prévu pour une V2 (catégorisation des pâtisseries) — non branché au front
// à ce jour : `category_id` sur `products` est toujours envoyé à null par
// l'admin. Repository et routes fonctionnels, gardés en l'état pour cette V2.
const db = require("../db/connection");

function getAllCategories() {
  return db.prepare("SELECT * FROM categories").all();
}

function createCategory(name) {
  return db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
}

module.exports = { getAllCategories, createCategory };
