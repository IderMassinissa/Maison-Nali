const test = require("node:test");
const assert = require("node:assert");
const db = require("../db/connection");
const { createCategory, getAllCategories } = require("./categories");

test("createCategory ajoute bien une catégorie", () => {
  const avant = getAllCategories().length;
  createCategory("Catégorie test");
  const apres = getAllCategories();

  assert.strictEqual(apres.length, avant + 1);
  assert.ok(apres.some((c) => c.name === "Catégorie test"));

  // Nettoyage
  db.prepare("DELETE FROM categories WHERE name = 'Catégorie test'").run();
});
