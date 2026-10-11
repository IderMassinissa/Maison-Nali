/**
 * Accès SQL à la table `products` (catalogue de pâtisseries public).
 * focus_x/focus_y = point focal de recadrage de la photo (défaut 50/50,
 * centre de l'image) ; position = ordre d'affichage dans GrillePatisseries,
 * réordonnée par glisser-déposer depuis l'admin.
 */
const db = require("../db/connection");

/** @returns {object[]} tous les produits, triés par position. */
function getAllProducts() {
  return db.prepare("SELECT * FROM products ORDER BY position").all();
}

/** @returns {object|undefined} le produit de cet id, ou undefined s'il n'existe pas. */
function getProductById(id) {
  return db.prepare("SELECT * FROM products WHERE id = ?").get(id);
}

/** Crée un produit en fin de liste (position = max + 1). */
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

/** Met à jour un produit (ne touche pas la position, voir updateProductPosition). */
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

/** Met à jour la position d'affichage d'un produit (réorganisation par glisser-déposer). */
function updateProductPosition(id, position) {
  return db
    .prepare("UPDATE products SET position = ? WHERE id = ?")
    .run(position, id);
}

/** Supprime un produit. */
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
