// Chemin image (interne vs externe), longueur alt, position.
const test = require("node:test");
const assert = require("node:assert");
const { validateEventPhoto } = require("./validateEventPhoto");

test("chemin externe (URL http) est rejeté", () => {
  const r = validateEventPhoto({
    imageUrl: "https://exemple.com/photo.jpg",
    alt: "",
  });
  assert.strictEqual(r.valid, false);
});

test("chemin contenant '..' est rejeté", () => {
  const r = validateEventPhoto({
    imageUrl: "/uploads/../etc/passwd.jpg",
    alt: "",
  });
  assert.strictEqual(r.valid, false);
});

test("extension interdite (.gif) est rejetée", () => {
  const r = validateEventPhoto({ imageUrl: "/uploads/photo.gif", alt: "" });
  assert.strictEqual(r.valid, false);
});

test("alt trop long (151 caractères) est rejeté", () => {
  const r = validateEventPhoto({
    imageUrl: "/uploads/photo.jpg",
    alt: "a".repeat(151),
  });
  assert.strictEqual(r.valid, false);
});

test("position non entière est rejetée", () => {
  const r = validateEventPhoto({
    imageUrl: "/uploads/photo.jpg",
    alt: "",
    position: 1.5,
  });
  assert.strictEqual(r.valid, false);
});

test("valeurs valides sont acceptées (jpg, png, webp)", () => {
  assert.strictEqual(
    validateEventPhoto({ imageUrl: "/uploads/1730-123.jpg", alt: "Gâteau" })
      .valid,
    true,
  );
  assert.strictEqual(
    validateEventPhoto({ imageUrl: "/uploads/1730-123.PNG", alt: "" }).valid,
    true,
  );
  assert.strictEqual(
    validateEventPhoto({ imageUrl: "/uploads/1730-123.webp" }).valid,
    true,
  );
});

test("position entière valide est acceptée", () => {
  const r = validateEventPhoto({
    imageUrl: "/uploads/photo.jpg",
    alt: "",
    position: 3,
  });
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.position, 3);
});

test("alt absent est accepté (stocké à null)", () => {
  const r = validateEventPhoto({ imageUrl: "/uploads/photo.jpg" });
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.alt, null);
});
