const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getAllPages, getPageBySlug } = require("../repositories/pages");
const {
  getSectionsByPageId,
  updateSectionContent,
  updateSectionPosition,
} = require("../repositories/sections");

// Lecture publique — le front public en a besoin pour afficher les pages
router.get("/", (req, res) => {
  res.json(getAllPages());
});

router.get("/:slug", (req, res) => {
  const page = getPageBySlug(req.params.slug);
  if (!page) return res.status(404).json({ error: "Page introuvable" });

  const sections = getSectionsByPageId(page.id);
  res.json({ ...page, sections });
});

// Écriture réservée à l'admin
router.put("/sections/:id/content", requireAuth, (req, res) => {
  const { content } = req.body;
  updateSectionContent(req.params.id, content);
  res.json({ message: "Contenu du bloc mis à jour" });
});

router.put("/sections/:id/position", requireAuth, (req, res) => {
  const { position } = req.body;
  updateSectionPosition(req.params.id, position);
  res.json({ message: "Position du bloc mise à jour" });
});

module.exports = router;
