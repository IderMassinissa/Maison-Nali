// Repository eventPhotos : CRUD, limite de 5 photos, transaction atomique createEventPhotoAvecLimite.
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const {
  getAllEventPhotos,
  getEventPhotoById,
  countEventPhotos,
  createEventPhoto,
  createEventPhotoAvecLimite,
  updateEventPhotoAlt,
  deleteEventPhoto,
  LIMITE_PHOTOS,
} = require("./eventPhotos");

describe("eventPhotos repository", () => {
  let etatInitial;

  before(() => {
    etatInitial = getAllEventPhotos();
  });

  after(() => {
    const etatFinal = getAllEventPhotos();
    assert.deepStrictEqual(
      etatFinal,
      etatInitial,
      "La table event_photos doit être identique à l'état de départ après les tests (mêmes lignes, mêmes positions)",
    );
  });

  it("createEventPhoto place la nouvelle photo en position MAX+1", (t) => {
    const positionMax = etatInitial.reduce(
      (max, p) => Math.max(max, p.position),
      0,
    );
    const result = createEventPhoto("/uploads/test-creation.jpg", "Alt test");
    t.after(() => deleteEventPhoto(result.lastInsertRowid));

    const photo = getEventPhotoById(result.lastInsertRowid);
    assert.strictEqual(photo.image_url, "/uploads/test-creation.jpg");
    assert.strictEqual(photo.alt, "Alt test");
    assert.strictEqual(photo.position, positionMax + 1);
  });

  it("updateEventPhotoAlt modifie bien le texte alternatif", (t) => {
    const result = createEventPhoto("/uploads/test-maj.jpg", "Avant");
    t.after(() => deleteEventPhoto(result.lastInsertRowid));

    updateEventPhotoAlt(result.lastInsertRowid, "Après");
    const photo = getEventPhotoById(result.lastInsertRowid);

    assert.strictEqual(photo.alt, "Après");
  });

  it("deleteEventPhoto supprime bien la photo", () => {
    const result = createEventPhoto("/uploads/test-suppr.jpg", "");
    deleteEventPhoto(result.lastInsertRowid);
    const photo = getEventPhotoById(result.lastInsertRowid);
    assert.strictEqual(photo, undefined);
  });

  it("getAllEventPhotos trie par position sans toucher aux photos existantes", (t) => {
    const r1 = createEventPhoto("/uploads/test-tri-a.jpg", "");
    const r2 = createEventPhoto("/uploads/test-tri-b.jpg", "");
    t.after(() => {
      deleteEventPhoto(r1.lastInsertRowid);
      deleteEventPhoto(r2.lastInsertRowid);
    });

    const toutes = getAllEventPhotos();
    const positions = toutes.map((p) => p.position);
    const positionsTriees = [...positions].sort((a, b) => a - b);
    assert.deepStrictEqual(positions, positionsTriees);

    etatInitial.forEach((originale) => {
      const actuelle = toutes.find((p) => p.id === originale.id);
      assert.strictEqual(actuelle.position, originale.position);
    });
  });

  it("createEventPhotoAvecLimite refuse la création au-delà de 5 photos, atomiquement", (t) => {
    const dejaPresentes = countEventPhotos();
    const aCreerPourAtteindreLaLimite = LIMITE_PHOTOS - dejaPresentes;
    const idsCrees = [];
    t.after(() => idsCrees.forEach((id) => deleteEventPhoto(id)));

    for (let i = 0; i < aCreerPourAtteindreLaLimite; i++) {
      const r = createEventPhotoAvecLimite(`/uploads/test-limite-${i}.jpg`, "");
      idsCrees.push(r.lastInsertRowid);
    }
    assert.strictEqual(countEventPhotos(), LIMITE_PHOTOS);

    assert.throws(() => {
      createEventPhotoAvecLimite("/uploads/test-limite-refus.jpg", "");
    });
    assert.strictEqual(
      countEventPhotos(),
      LIMITE_PHOTOS,
      "la 6e insertion ne doit laisser aucune trace (transaction atomique)",
    );
  });
});
