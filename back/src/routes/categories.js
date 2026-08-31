const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getAllCategories,
  createCategory,
} = require("../repositories/categories");

router.get("/", (req, res) => {
  res.json(getAllCategories());
});

router.post("/", requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Le nom est requis" });

  const result = createCategory(name);
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
