// Repository announcements : création vs mise à jour de l'unique ligne, conversion active en booléen.
const test = require("node:test");
const assert = require("node:assert");
const { getAnnouncement, setAnnouncement } = require("./announcements");

test("setAnnouncement puis getAnnouncement renvoie les bonnes valeurs", (t) => {
  const original = getAnnouncement();
  t.after(() => {
    if (original) {
      setAnnouncement(
        original.message,
        original.active,
        original.start_date,
        original.end_date,
      );
    }
  });

  setAnnouncement("Message de test", true, "2026-01-01", "2026-12-31");
  const annonce = getAnnouncement();

  assert.strictEqual(annonce.message, "Message de test");
  assert.strictEqual(annonce.active, 1);
  assert.strictEqual(annonce.start_date, "2026-01-01");
  assert.strictEqual(annonce.end_date, "2026-12-31");
});

test("setAnnouncement avec active=false stocke bien active à 0", (t) => {
  const original = getAnnouncement();
  t.after(() => {
    if (original) {
      setAnnouncement(
        original.message,
        original.active,
        original.start_date,
        original.end_date,
      );
    }
  });

  setAnnouncement("Message désactivé", false, null, null);
  const annonce = getAnnouncement();

  assert.strictEqual(annonce.active, 0);
});
