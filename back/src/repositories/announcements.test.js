const test = require("node:test");
const assert = require("node:assert");
const { setAnnouncement, getActiveAnnouncement } = require("./announcements");

test("setAnnouncement puis getActiveAnnouncement renvoie la bonne annonce si active", () => {
  setAnnouncement("Message de test", true);
  const annonce = getActiveAnnouncement();

  assert.strictEqual(annonce.message, "Message de test");
  assert.strictEqual(annonce.active, 1);
});

test("setAnnouncement avec active=false : getActiveAnnouncement ne la renvoie pas", () => {
  setAnnouncement("Message désactivé", false);
  const annonce = getActiveAnnouncement();

  assert.strictEqual(annonce, undefined);
});
