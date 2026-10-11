// Repository categories : création et lecture de la liste complète.
const test = require("node:test");
const assert = require("node:assert");
const db = require("../db/connection");
const { createCategory, getAllCategories } = require("./categories");

test("createCategory ajoute bien une catégorie", (t) => {
  const avant = getAllCategories().length;
  const result = createCategory("Catégorie test");
  t.after(() =>
    db.prepare("DELETE FROM categories WHERE id = ?").run(result.lastInsertRowid),
  );

  const apres = getAllCategories();

  assert.strictEqual(apres.length, avant + 1);
  assert.ok(apres.some((c) => c.name === "Catégorie test"));
});
