const db = require("../db/connection");

function getAllProducts() {
  return db.prepare("SELECT * FROM products").all();
}

function getProductById(id) {
  return db.prepare("SELECT * FROM products WHERE id = ?").get(id);
}

function createProduct(name, description, photoUrl, videoUrl, categoryId) {
  const stmt = db.prepare(
    "INSERT INTO products (name, description, photo_url, video_url, category_id) VALUES (?, ?, ?, ?, ?)",
  );
  return stmt.run(name, description, photoUrl, videoUrl, categoryId);
}

function updateProduct(id, name, description, photoUrl, videoUrl, categoryId) {
  const stmt = db.prepare(
    "UPDATE products SET name = ?, description = ?, photo_url = ?, video_url = ?, category_id = ? WHERE id = ?",
  );
  return stmt.run(name, description, photoUrl, videoUrl, categoryId, id);
}

function deleteProduct(id) {
  return db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
