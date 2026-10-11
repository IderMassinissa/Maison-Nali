// Jour fermé, heure manquante d'un seul côté, format invalide, fermeture avant ouverture.
const test = require("node:test");
const assert = require("node:assert");
const { validateOpeningHours } = require("./validateOpeningHours");

test("valeurs vides sont acceptées (jour fermé)", () => {
  const r = validateOpeningHours("", "");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.openTime, null);
  assert.strictEqual(r.closeTime, null);
});

test("valeurs absentes (undefined) sont acceptées (jour fermé)", () => {
  const r = validateOpeningHours(undefined, undefined);
  assert.strictEqual(r.valid, true);
});

test("ouverture seule sans fermeture est rejetée", () => {
  const r = validateOpeningHours("11:00", "");
  assert.strictEqual(r.valid, false);
});

test("fermeture seule sans ouverture est rejetée", () => {
  const r = validateOpeningHours("", "19:00");
  assert.strictEqual(r.valid, false);
});

test("format d'heure invalide est rejeté", () => {
  const r = validateOpeningHours("11h00", "19:00");
  assert.strictEqual(r.valid, false);
});

test("fermeture avant ouverture est rejetée", () => {
  const r = validateOpeningHours("19:00", "11:00");
  assert.strictEqual(r.valid, false);
});

test("fermeture égale à l'ouverture est rejetée", () => {
  const r = validateOpeningHours("11:00", "11:00");
  assert.strictEqual(r.valid, false);
});

test("horaires valides et cohérents sont acceptés", () => {
  const r = validateOpeningHours("11:00", "19:00");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.openTime, "11:00");
  assert.strictEqual(r.closeTime, "19:00");
});
