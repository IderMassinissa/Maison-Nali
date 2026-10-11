// Repository settings : création vs mise à jour par clé, lecture d'une clé absente.
const test = require("node:test");
const assert = require("node:assert");
const db = require("../db/connection");
const { setSetting, getSetting } = require("./settings");

function supprimerTestKey() {
  db.prepare("DELETE FROM settings WHERE key = 'test_key'").run();
}

test("setSetting puis getSetting renvoie la bonne valeur", (t) => {
  t.after(supprimerTestKey);

  setSetting("test_key", "test_value");
  const valeur = getSetting("test_key");

  assert.strictEqual(valeur, "test_value");
});

test("setSetting sur une clé existante la met à jour plutôt que d'en créer une deuxième", (t) => {
  t.after(supprimerTestKey);

  setSetting("test_key", "valeur_1");
  setSetting("test_key", "valeur_2");
  const valeur = getSetting("test_key");

  assert.strictEqual(valeur, "valeur_2");
});

test("getSetting sur une clé inexistante renvoie null", () => {
  const valeur = getSetting("cle_qui_nexiste_pas");
  assert.strictEqual(valeur, null);
});
