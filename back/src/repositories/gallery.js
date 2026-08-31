const db = require("../db/connection");

function getAllGalleryImages() {
  return db.prepare("SELECT * FROM gallery").all();
}

function addGalleryImage(url, caption) {
  return db
    .prepare("INSERT INTO gallery (url, caption) VALUES (?, ?)")
    .run(url, caption);
}

function deleteGalleryImage(id) {
  return db.prepare("DELETE FROM gallery WHERE id = ?").run(id);
}

module.exports = { getAllGalleryImages, addGalleryImage, deleteGalleryImage };
