const db = require("../db/connection");

function getAllPages() {
  return db.prepare("SELECT * FROM pages ORDER BY position").all();
}

function getPageBySlug(slug) {
  return db.prepare("SELECT * FROM pages WHERE slug = ?").get(slug);
}

module.exports = { getAllPages, getPageBySlug };
