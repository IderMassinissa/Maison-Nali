const test = require("node:test");
const assert = require("node:assert");
const { validateBlocHistoire } = require("./validateBlocHistoire");

test("valeurs vides sont acceptées (pas de bouton)", () => {
  const r = validateBlocHistoire("", "");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.texteBouton, "");
  assert.strictEqual(r.lienBouton, "");
});

test("valeurs absentes (undefined) sont acceptées", () => {
  const r = validateBlocHistoire(undefined, undefined);
  assert.strictEqual(r.valid, true);
});

test("chemin interne valide est accepté", () => {
  const r = validateBlocHistoire("Découvrir nos pâtisseries", "/patisseries");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.lienBouton, "/patisseries");
});

test("chemin externe (URL http) est rejeté", () => {
  const r = validateBlocHistoire("Voir", "http://example.com");
  assert.strictEqual(r.valid, false);
});

test("chemin externe (URL https) est rejeté", () => {
  const r = validateBlocHistoire("Voir", "https://example.com/patisseries");
  assert.strictEqual(r.valid, false);
});

test("chemin sans slash initial est rejeté", () => {
  const r = validateBlocHistoire("Voir", "patisseries");
  assert.strictEqual(r.valid, false);
});

test("texte du bouton trop long (51 caractères) est rejeté", () => {
  const r = validateBlocHistoire("x".repeat(51), "/adresse");
  assert.strictEqual(r.valid, false);
});

test("lien du bouton trop long (201 caractères) est rejeté", () => {
  const r = validateBlocHistoire("Voir", "/" + "x".repeat(200));
  assert.strictEqual(r.valid, false);
});

test("espaces autour des valeurs sont retirés", () => {
  const r = validateBlocHistoire("  Voir  ", "  /adresse  ");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.texteBouton, "Voir");
  assert.strictEqual(r.lienBouton, "/adresse");
});
