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

// Lecture publique — le site public en a besoin
router.get("/", (req, res) => {
  res.json(getAllProducts());
});

router.get("/:id", (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Produit introuvable" });
  res.json(product);
});

// Écriture réservée à l'admin
router.post("/", requireAuth, (req, res) => {
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
});

router.put("/:id", requireAuth, (req, res) => {
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
});

router.delete("/:id", requireAuth, (req, res) => {
  deleteProduct(req.params.id);
  res.json({ message: "Produit supprimé" });
});

module.exports = router;
