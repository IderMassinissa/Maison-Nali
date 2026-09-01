const test = require("node:test");
const assert = require("node:assert");
const db = require("../db/connection");
const {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("./products");

test("createProduct puis getProductById renvoie le bon produit", () => {
  const result = createProduct(
    "Test Baklawa",
    "Description test",
    null,
    null,
    null,
  );
  const produit = getProductById(result.lastInsertRowid);

  assert.strictEqual(produit.name, "Test Baklawa");
  assert.strictEqual(produit.description, "Description test");

  // Nettoyage
  deleteProduct(result.lastInsertRowid);
});

test("updateProduct modifie bien le nom", () => {
  const result = createProduct("Nom initial", "", null, null, null);
  updateProduct(result.lastInsertRowid, "Nom modifié", "", null, null, null);
  const produit = getProductById(result.lastInsertRowid);

  assert.strictEqual(produit.name, "Nom modifié");

  deleteProduct(result.lastInsertRowid);
});

test("deleteProduct supprime bien le produit", () => {
  const result = createProduct("À supprimer", "", null, null, null);
  deleteProduct(result.lastInsertRowid);
  const produit = getProductById(result.lastInsertRowid);

  assert.strictEqual(produit, undefined);
});
