// Chemin /uploads/... valide, extensions, chemin hors uploads, parcours ("..").
const test = require("node:test");
const assert = require("node:assert");
const { validatePhotoInterne } = require("./validatePhotoInterne");

test("valeur vide est acceptée (pas de photo, placeholder affiché)", () => {
  const r = validatePhotoInterne("");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.photo, "");
});

test("valeur absente (undefined) est acceptée", () => {
  const r = validatePhotoInterne(undefined);
  assert.strictEqual(r.valid, true);
});

test("chemin /uploads/... valide (jpg) est accepté", () => {
  const r = validatePhotoInterne("/uploads/1788261047077-447926434.jpg");
  assert.strictEqual(r.valid, true);
});

test("chemin /uploads/... valide (webp) est accepté", () => {
  const r = validatePhotoInterne("/uploads/photo.webp");
  assert.strictEqual(r.valid, true);
});

test("extension en majuscules (.JPG) est acceptée", () => {
  const r = validatePhotoInterne("/uploads/1791533523068-473419595.JPG");
  assert.strictEqual(r.valid, true);
});

test("URL externe est rejetée", () => {
  const r = validatePhotoInterne("https://evil.com/tracker.png");
  assert.strictEqual(r.valid, false);
});

test("chemin contenant '..' est rejeté", () => {
  const r = validatePhotoInterne("/uploads/../../etc/passwd.jpg");
  assert.strictEqual(r.valid, false);
});

test("extension interdite est rejetée", () => {
  const r = validatePhotoInterne("/uploads/script.svg");
  assert.strictEqual(r.valid, false);
});

test("chemin hors /uploads est rejeté", () => {
  const r = validatePhotoInterne("/images/atelier.jpg");
  assert.strictEqual(r.valid, false);
});
