/**
 * Routes de catégories de produits. Prévu pour une V2 (catégorisation des
 * pâtisseries) — non utilisé par le front à ce jour, gardé en l'état pour
 * cette V2.
 */
const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getAllCategories,
  createCategory,
} = require("../repositories/categories");

router.get("/", (req, res) => {
  try {
    res.json(getAllCategories());
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des catégories" });
  }
});

router.post("/", requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Le nom est requis" });

    const result = createCategory(name);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la catégorie" });
  }
});

module.exports = router;
