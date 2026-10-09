const test = require("node:test");
const assert = require("node:assert");
const { detecterTypeImage } = require("./detecterTypeImage");

// Les buffers ci-dessous reprennent exactement les octets de signature
// qu'un vrai fichier de ce format commence toujours par (ce que le
// détecteur vérifie) -- complétés de zéros pour atteindre une taille
// réaliste. Pas des images décodables, mais la partie qui compte pour ce
// test est authentique : c'est précisément ce que detecterTypeImage lit.

function tamponJpegValide() {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
}

function tamponPngValide() {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
}

function tamponWebpValide() {
  const tampon = Buffer.alloc(16);
  tampon.write("RIFF", 0, "ascii");
  tampon.write("WEBP", 8, "ascii");
  return tampon;
}

test("un vrai JPEG est détecté", () => {
  assert.strictEqual(detecterTypeImage(tamponJpegValide()), "image/jpeg");
});

test("un vrai PNG est détecté", () => {
  assert.strictEqual(detecterTypeImage(tamponPngValide()), "image/png");
});

test("un vrai WebP est détecté", () => {
  assert.strictEqual(detecterTypeImage(tamponWebpValide()), "image/webp");
});

test("un fichier HTML renommé en .jpg n'est pas détecté comme une image", () => {
  const faux = Buffer.from(
    "<html><body><script>alert(1)</script></body></html>",
    "utf8",
  );
  assert.strictEqual(detecterTypeImage(faux), null);
});

test("un buffer vide n'est pas détecté", () => {
  assert.strictEqual(detecterTypeImage(Buffer.alloc(0)), null);
});

test("un buffer trop court n'est pas détecté (évite de lire hors limites)", () => {
  assert.strictEqual(detecterTypeImage(Buffer.from([0xff, 0xd8, 0xff])), null);
});

test("undefined ne fait pas planter la détection", () => {
  assert.strictEqual(detecterTypeImage(undefined), null);
});
