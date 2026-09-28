const db = require("../db/connection");

function getAllProducts() {
  return db.prepare("SELECT * FROM products ORDER BY position").all();
}

function getProductById(id) {
  return db.prepare("SELECT * FROM products WHERE id = ?").get(id);
}

function createProduct(
  name,
  description,
  photoUrl,
  videoUrl,
  categoryId,
  focusX,
  focusY,
) {
  const maxPosition = db
    .prepare("SELECT MAX(position) as max FROM products")
    .get();
  const nouvellePosition = (maxPosition.max || 0) + 1;

  const stmt = db.prepare(
    "INSERT INTO products (name, description, photo_url, video_url, category_id, focus_x, focus_y, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  return stmt.run(
    name,
    description,
    photoUrl,
    videoUrl,
    categoryId,
    focusX ?? 50,
    focusY ?? 50,
    nouvellePosition,
  );
}

function updateProduct(
  id,
  name,
  description,
  photoUrl,
  videoUrl,
  categoryId,
  focusX,
  focusY,
) {
  const stmt = db.prepare(
    "UPDATE products SET name = ?, description = ?, photo_url = ?, video_url = ?, category_id = ?, focus_x = ?, focus_y = ? WHERE id = ?",
  );
  return stmt.run(
    name,
    description,
    photoUrl,
    videoUrl,
    categoryId,
    focusX ?? 50,
    focusY ?? 50,
    id,
  );
}

function updateProductPosition(id, position) {
  return db
    .prepare("UPDATE products SET position = ? WHERE id = ?")
    .run(position, id);
}

function deleteProduct(id) {
  return db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductPosition,
  deleteProduct,
};
