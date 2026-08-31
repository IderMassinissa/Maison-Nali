const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getAllPages, getPageBySlug } = require("../repositories/pages");
const {
  getSectionsByPageId,
  updateSectionContent,
  updateSectionPosition,
} = require("../repositories/sections");

router.get("/", (req, res) => {
  try {
    res.json(getAllPages());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des pages" });
  }
});

router.get("/:slug", (req, res) => {
  try {
    const page = getPageBySlug(req.params.slug);
    if (!page) return res.status(404).json({ error: "Page introuvable" });

    const sections = getSectionsByPageId(page.id);
    res.json({ ...page, sections });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la page" });
  }
});

router.put("/sections/:id/content", requireAuth, (req, res) => {
  try {
    const { content } = req.body;
    updateSectionContent(req.params.id, content);
    res.json({ message: "Contenu du bloc mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du contenu" });
  }
});

router.put("/sections/:id/position", requireAuth, (req, res) => {
  try {
    const { position } = req.body;
    updateSectionPosition(req.params.id, position);
    res.json({ message: "Position du bloc mise à jour" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la position" });
  }
});

module.exports = router;
