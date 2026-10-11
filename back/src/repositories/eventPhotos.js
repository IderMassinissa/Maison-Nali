/**
 * Accès SQL à la table `event_photos` (galerie "nos réalisations" affichée
 * sur /evenements, gérée depuis l'admin). Position = ordre d'affichage,
 * recalculée en ajoutant 1 au max existant à chaque création. Limite de 5
 * photos imposée ici (createEventPhotoAvecLimite), pas côté route.
 */
const db = require("../db/connection");

const LIMITE_PHOTOS = 5;

/** @returns {object[]} toutes les photos événement, triées par position. */
function getAllEventPhotos() {
  return db.prepare("SELECT * FROM event_photos ORDER BY position").all();
}

/** @returns {object|undefined} la photo événement d'id donné, ou undefined si elle n'existe pas. */
function getEventPhotoById(id) {
  return db.prepare("SELECT * FROM event_photos WHERE id = ?").get(id);
}

/** @returns {number} nombre total de photos événement en base. */
function countEventPhotos() {
  return db.prepare("SELECT COUNT(*) as count FROM event_photos").get().count;
}

/** Insère une photo événement en fin de liste (position = max + 1), sans vérifier la limite. */
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

/**
 * Transaction atomique : vérifie la limite de LIMITE_PHOTOS puis crée la
 * photo, pour éviter une course entre la vérification et l'insertion.
 * @throws {Error} code "LIMITE_ATTEINTE" si LIMITE_PHOTOS est déjà atteinte.
 */
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

/** Met à jour le texte alternatif d'une photo événement. */
function updateEventPhotoAlt(id, alt) {
  return db.prepare("UPDATE event_photos SET alt = ? WHERE id = ?").run(alt, id);
}

/** Met à jour la position d'affichage d'une photo événement. */
function updateEventPhotoPosition(id, position) {
  return db
    .prepare("UPDATE event_photos SET position = ? WHERE id = ?")
    .run(position, id);
}

/** Supprime une photo événement. */
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
