// Repository openingHours : lecture des 7 lignes fixes, mise à jour d'un jour.
const test = require("node:test");
const assert = require("node:assert");
const { getAllOpeningHours } = require("./openingHours");

test("getAllOpeningHours renvoie un tableau", () => {
  const horaires = getAllOpeningHours();
  assert.ok(Array.isArray(horaires));
});
