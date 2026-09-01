const test = require("node:test");
const assert = require("node:assert");
const { setSetting, getSetting } = require("./settings");

test("setSetting puis getSetting renvoie la bonne valeur", () => {
  setSetting("test_key", "test_value");
  const valeur = getSetting("test_key");

  assert.strictEqual(valeur, "test_value");
});

test("setSetting sur une clé existante la met à jour plutôt que d'en créer une deuxième", () => {
  setSetting("test_key", "valeur_1");
  setSetting("test_key", "valeur_2");
  const valeur = getSetting("test_key");

  assert.strictEqual(valeur, "valeur_2");
});

test("getSetting sur une clé inexistante renvoie null", () => {
  const valeur = getSetting("cle_qui_nexiste_pas");
  assert.strictEqual(valeur, null);
});
