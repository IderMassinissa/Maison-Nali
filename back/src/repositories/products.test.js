// Repository products : CRUD, calcul de position, valeurs par défaut focus_x/focus_y.
const test = require("node:test");
const assert = require("node:assert");
const {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("./products");

test("createProduct puis getProductById renvoie le bon produit", (t) => {
  const result = createProduct(
    "Test Baklawa",
    "Description test",
    null,
    null,
    null,
  );
  t.after(() => deleteProduct(result.lastInsertRowid));

  const produit = getProductById(result.lastInsertRowid);

  assert.strictEqual(produit.name, "Test Baklawa");
  assert.strictEqual(produit.description, "Description test");
});

test("updateProduct modifie bien le nom", (t) => {
  const result = createProduct("Nom initial", "", null, null, null);
  t.after(() => deleteProduct(result.lastInsertRowid));

  updateProduct(result.lastInsertRowid, "Nom modifié", "", null, null, null);
  const produit = getProductById(result.lastInsertRowid);

  assert.strictEqual(produit.name, "Nom modifié");
});

test("deleteProduct supprime bien le produit", () => {
  const result = createProduct("À supprimer", "", null, null, null);
  deleteProduct(result.lastInsertRowid);
  const produit = getProductById(result.lastInsertRowid);

  assert.strictEqual(produit, undefined);
});
