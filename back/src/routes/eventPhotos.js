/**
 * Routes de la galerie "nos réalisations" (événements, max 5 photos — la
 * limite est imposée côté repository, createEventPhotoAvecLimite). Chaque
 * écriture revalide intégralement la ligne (alt, position) via
 * validateEventPhoto, même sur les champs non modifiés par la requête.
 */
const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getAllEventPhotos,
  getEventPhotoById,
  createEventPhotoAvecLimite,
  updateEventPhotoAlt,
  updateEventPhotoPosition,
  deleteEventPhoto,
} = require("../repositories/eventPhotos");
const { validateEventPhoto } = require("../utils/validateEventPhoto");

router.get("/", (req, res) => {
  try {
    res.json(getAllEventPhotos());
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des photos" });
  }
});

router.post("/", requireAuth, (req, res) => {
  try {
    const validation = validateEventPhoto(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const result = createEventPhotoAvecLimite(
        validation.imageUrl,
        validation.alt,
      );
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (err) {
      if (err.code === "LIMITE_ATTEINTE") {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création de la photo" });
  }
});

router.put("/:id", requireAuth, (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const existante = getEventPhotoById(id);
    if (!existante) {
      return res.status(404).json({ error: "Photo introuvable" });
    }

    const validation = validateEventPhoto({
      imageUrl: existante.image_url,
      alt: req.body.alt,
    });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    updateEventPhotoAlt(id, validation.alt);
    res.json({ message: "Photo mise à jour" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la photo" });
  }
});

router.put("/:id/position", requireAuth, (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const existante = getEventPhotoById(id);
    if (!existante) {
      return res.status(404).json({ error: "Photo introuvable" });
    }

    const validation = validateEventPhoto({
      imageUrl: existante.image_url,
      alt: existante.alt,
      position: req.body.position,
    });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    updateEventPhotoPosition(id, validation.position);
    res.json({ message: "Position mise à jour" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la position" });
  }
});

router.delete("/:id", requireAuth, (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    if (!getEventPhotoById(id)) {
      return res.status(404).json({ error: "Photo introuvable" });
    }

    deleteEventPhoto(id);
    res.json({ message: "Photo supprimée" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la photo" });
  }
});

module.exports = router;
