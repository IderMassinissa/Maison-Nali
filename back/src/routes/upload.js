const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nomUnique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, nomUnique);
  },
});

const TYPES_AUTORISES = ["image/jpeg", "image/png", "image/webp"];
const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

const upload = multer({
  storage,
  limits: { fileSize: TAILLE_MAX },
  fileFilter: (req, file, cb) => {
    if (!TYPES_AUTORISES.includes(file.mimetype)) {
      return cb(
        new Error("Type de fichier non autorisé (JPEG, PNG, WebP uniquement)"),
      );
    }
    cb(null, true);
  },
});

router.post("/", requireAuth, upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
