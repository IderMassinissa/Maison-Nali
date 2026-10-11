// Chemin interne vs URL externe, schémas rejetés (javascript:, data:, http:), longueur.
const test = require("node:test");
const assert = require("node:assert");
const { validateLienBouton } = require("./validateLienBouton");

test("valeur vide est acceptée (pas de bouton)", () => {
  const r = validateLienBouton("");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.lienBouton, "");
});

test("valeur absente (undefined) est acceptée", () => {
  const r = validateLienBouton(undefined);
  assert.strictEqual(r.valid, true);
});

test("chemin interne est accepté", () => {
  const r = validateLienBouton("/patisseries");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.lienBouton, "/patisseries");
});

test("URL https est acceptée", () => {
  const r = validateLienBouton("https://example.com/promo");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.lienBouton, "https://example.com/promo");
});

test("URL http (non chiffrée) est rejetée", () => {
  const r = validateLienBouton("http://example.com");
  assert.strictEqual(r.valid, false);
});

test("javascript: est rejeté", () => {
  const r = validateLienBouton("javascript:alert(1)");
  assert.strictEqual(r.valid, false);
});

test("data: est rejeté", () => {
  const r = validateLienBouton("data:text/html,<script>alert(1)</script>");
  assert.strictEqual(r.valid, false);
});

test("chemin sans slash initial est rejeté", () => {
  const r = validateLienBouton("patisseries");
  assert.strictEqual(r.valid, false);
});

test("lien trop long (201 caractères) est rejeté", () => {
  const r = validateLienBouton("/" + "x".repeat(200));
  assert.strictEqual(r.valid, false);
});

test("limite de longueur personnalisée est respectée", () => {
  const r = validateLienBouton("/" + "x".repeat(10), { max: 5 });
  assert.strictEqual(r.valid, false);
});

test("espaces autour de la valeur sont retirés", () => {
  const r = validateLienBouton("  /adresse  ");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.lienBouton, "/adresse");
});
