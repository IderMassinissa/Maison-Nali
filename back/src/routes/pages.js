const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getAllPages, getPageBySlug } = require("../repositories/pages");
const {
  getSectionsByPageId,
  getSectionById,
  updateSectionContent,
  updateSectionPosition,
  createSection,
  deleteSection,
} = require("../repositories/sections");

const TYPES_BLOC_AUTORISES = [
  "hero",
  "bloc-patisseries",
  "bloc-histoire",
  "bloc-localisation",
  "bloc-evenements",
  "bloc-entete",
];

const TYPES_INSTANCE_UNIQUE = [
  "hero",
  "bloc-patisseries",
  "bloc-localisation",
  "bloc-evenements",
  "bloc-entete",
];

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
    if (section && section.type === "bloc-evenements") {
      const { titre = "", intro = "", formats = "" } = parsed || {};
      if (titre.length > 100) {
        return res
          .status(400)
          .json({ error: "Le titre ne doit pas dépasser 100 caractères" });
      }
      if (intro.length > 1000) {
        return res
          .status(400)
          .json({ error: "L'introduction ne doit pas dépasser 1000 caractères" });
      }
      if (formats.length > 1000) {
        return res.status(400).json({
          error: "La liste des formats ne doit pas dépasser 1000 caractères",
        });
      }
    }

    if (section && section.type === "bloc-entete") {
      const { libelle = "", titre = "", intro = "" } = parsed || {};
      if (!titre.trim()) {
        return res.status(400).json({ error: "Le titre est obligatoire" });
      }
      if (libelle.length > 60) {
        return res
          .status(400)
          .json({ error: "Le libellé ne doit pas dépasser 60 caractères" });
      }
      if (titre.length > 100) {
        return res
          .status(400)
          .json({ error: "Le titre ne doit pas dépasser 100 caractères" });
      }
      if (intro.length > 300) {
        return res
          .status(400)
          .json({ error: "L'introduction ne doit pas dépasser 300 caractères" });
      }
    }

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

router.get("/sections/:id", (req, res) => {
  try {
    const section = getSectionById(req.params.id);
    if (!section) return res.status(404).json({ error: "Bloc introuvable" });
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération du bloc" });
  }
});

router.post("/:slug/sections", requireAuth, (req, res) => {
  try {
    const { type } = req.body;
    if (!TYPES_BLOC_AUTORISES.includes(type)) {
      return res.status(400).json({ error: "Type de bloc invalide" });
    }

    const page = getPageBySlug(req.params.slug);
    if (!page) return res.status(404).json({ error: "Page introuvable" });

    if (TYPES_INSTANCE_UNIQUE.includes(type)) {
      const sectionsExistantes = getSectionsByPageId(page.id);
      if (sectionsExistantes.some((s) => s.type === type)) {
        return res
          .status(400)
          .json({ error: "Ce type de bloc existe déjà sur cette page" });
      }
    }

    const result = createSection(page.id, type);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création du bloc" });
  }
});

router.delete("/sections/:id", requireAuth, (req, res) => {
  try {
    deleteSection(req.params.id);
    res.json({ message: "Bloc supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression du bloc" });
  }
});

module.exports = router;
