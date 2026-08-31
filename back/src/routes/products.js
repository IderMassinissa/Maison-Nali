const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../repositories/products");

router.get("/", (req, res) => {
  try {
    res.json(getAllProducts());
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des produits" });
  }
});

router.get("/:id", (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Produit introuvable" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération du produit" });
  }
});

router.post("/", requireAuth, (req, res) => {
  try {
    const { name, description, photoUrl, videoUrl, categoryId } = req.body;
    if (!name) return res.status(400).json({ error: "Le nom est requis" });

    const result = createProduct(
      name,
      description,
      photoUrl,
      videoUrl,
      categoryId,
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création du produit" });
  }
});

router.put("/:id", requireAuth, (req, res) => {
  try {
    const { name, description, photoUrl, videoUrl, categoryId } = req.body;
    if (!name) return res.status(400).json({ error: "Le nom est requis" });

    updateProduct(
      req.params.id,
      name,
      description,
      photoUrl,
      videoUrl,
      categoryId,
    );
    res.json({ message: "Produit mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du produit" });
  }
});

router.delete("/:id", requireAuth, (req, res) => {
  try {
    deleteProduct(req.params.id);
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression du produit" });
  }
});

module.exports = router;
