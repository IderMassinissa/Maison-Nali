/**
 * Routes des pages publiques et de leurs sections (les blocs de contenu
 * édités depuis l'admin). GET /:slug compose la page avec ses sections
 * dans une seule réponse. PUT sur une section attend `content` déjà
 * sérialisé en chaîne JSON (cohérent avec son stockage en base), reparsé
 * ici juste pour validation avant d'être réécrit tel quel.
 */
const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getAllPages, getPageBySlug } = require("../repositories/pages");
const {
  getSectionsByPageId,
  getSectionById,
  updateSectionContent,
} = require("../repositories/sections");
const { validateSectionContent } = require("../utils/validateSectionContent");

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

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(400).json({ error: "Contenu JSON invalide" });
    }

    const section = getSectionById(req.params.id);
    if (section) {
      const validation = validateSectionContent(section.type, parsed);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    updateSectionContent(req.params.id, content);
    res.json({ message: "Contenu du bloc mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du contenu" });
  }
});

router.get("/sections/:id", requireAuth, (req, res) => {
  try {
    const section = getSectionById(req.params.id);
    if (!section) return res.status(404).json({ error: "Bloc introuvable" });
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération du bloc" });
  }
});

module.exports = router;
