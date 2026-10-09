const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getAllPages, getPageBySlug } = require("../repositories/pages");
const {
  getSectionsByPageId,
  getSectionById,
  updateSectionContent,
} = require("../repositories/sections");
const { validateBlocHistoire } = require("../utils/validateBlocHistoire");
const { validateLienBouton } = require("../utils/validateLienBouton");

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

    if (section && section.type === "hero") {
      const { texteBouton = "", lienBouton = "" } = parsed || {};
      if (texteBouton.length > 50) {
        return res
          .status(400)
          .json({ error: "Le texte du bouton ne doit pas dépasser 50 caractères" });
      }
      const validationLien = validateLienBouton(lienBouton);
      if (!validationLien.valid) {
        return res.status(400).json({ error: validationLien.error });
      }
    }

    if (section && section.type === "bloc-histoire") {
      const { texteBouton = "", lienBouton = "" } = parsed || {};
      const validation = validateBlocHistoire(texteBouton, lienBouton);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
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

module.exports = router;
