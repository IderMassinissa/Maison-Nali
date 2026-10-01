const db = require("../db/connection");

const LIMITE_PHOTOS = 5;

function getAllEventPhotos() {
  return db.prepare("SELECT * FROM event_photos ORDER BY position").all();
}

function getEventPhotoById(id) {
  return db.prepare("SELECT * FROM event_photos WHERE id = ?").get(id);
}

function countEventPhotos() {
  return db.prepare("SELECT COUNT(*) as count FROM event_photos").get().count;
}

function createEventPhoto(imageUrl, alt) {
  const maxPosition = db
    .prepare("SELECT MAX(position) as max FROM event_photos")
    .get();
  const nouvellePosition = (maxPosition.max || 0) + 1;

  return db
    .prepare(
      "INSERT INTO event_photos (image_url, alt, position) VALUES (?, ?, ?)",
    )
    .run(imageUrl, alt, nouvellePosition);
}

const createEventPhotoAvecLimite = db.transaction((imageUrl, alt) => {
  if (countEventPhotos() >= LIMITE_PHOTOS) {
    const erreur = new Error(
      `La limite de ${LIMITE_PHOTOS} photos est déjà atteinte`,
    );
    erreur.code = "LIMITE_ATTEINTE";
    throw erreur;
  }
  return createEventPhoto(imageUrl, alt);
});

function updateEventPhotoAlt(id, alt) {
  return db.prepare("UPDATE event_photos SET alt = ? WHERE id = ?").run(alt, id);
}

function updateEventPhotoPosition(id, position) {
  return db
    .prepare("UPDATE event_photos SET position = ? WHERE id = ?")
    .run(position, id);
}

function deleteEventPhoto(id) {
  return db.prepare("DELETE FROM event_photos WHERE id = ?").run(id);
}

module.exports = {
  LIMITE_PHOTOS,
  getAllEventPhotos,
  getEventPhotoById,
  countEventPhotos,
  createEventPhoto,
  createEventPhotoAvecLimite,
  updateEventPhotoAlt,
  updateEventPhotoPosition,
  deleteEventPhoto,
};
