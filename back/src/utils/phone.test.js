// Formats de téléphone acceptés/rejetés (longueur, caractères autorisés).
const test = require("node:test");
const assert = require("node:assert");
const { validatePhone } = require("./phone");

test("numéro valide (chiffres et espaces) est accepté", () => {
  assert.strictEqual(validatePhone("01 86 04 43 34"), true);
});

test("numéro valide avec + . ( ) - est accepté", () => {
  assert.strictEqual(validatePhone("+33 (0)1 86-04.43.34"), true);
});

test("numéro contenant des caractères interdits est rejeté", () => {
  assert.strictEqual(validatePhone("0186044334<script>"), false);
});

test("numéro trop court est rejeté", () => {
  assert.strictEqual(validatePhone("123"), false);
});

test("numéro trop long est rejeté", () => {
  assert.strictEqual(validatePhone("0".repeat(21)), false);
});

test("valeur non-string est rejetée", () => {
  assert.strictEqual(validatePhone(123456), false);
});
