const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  detecterTypeImage,
  EXTENSION_PAR_TYPE,
} = require("../utils/detecterTypeImage");
const { optimiserImage, ImageTropLourdeError } = require("../utils/optimiserImage");

// Stockage en mémoire (Buffer), pas directement sur disque : le temps de
// vérifier le contenu réel du fichier (cf. plus bas), avant de l'écrire
// nous-mêmes avec un nom et une extension que NOUS choisissons -- jamais
// l'extension fournie par le client (voir E2 dans le rapport sécurité).
const storage = multer.memoryStorage();

const TYPES_AUTORISES = ["image/jpeg", "image/png", "image/webp"];
const TAILLE_MAX = 5 * 1024 * 1024;

const upload = multer({
  storage,
  limits: { fileSize: TAILLE_MAX },
  fileFilter: (req, file, cb) => {
    // Premier filtre, rapide mais insuffisant seul : le Content-Type
    // déclaré par le client est entièrement falsifiable. Il évite juste de
    // charger en mémoire un fichier dont le type annoncé est déjà hors
    // liste -- le vrai contrôle est après upload, sur le contenu reçu.
    if (!TYPES_AUTORISES.includes(file.mimetype)) {
      return cb(
        new Error("Type de fichier non autorisé (JPEG, PNG, WebP uniquement)"),
      );
    }
    cb(null, true);
  },
});

router.post("/", requireAuth, (req, res) => {
  upload.single("photo")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: `Erreur d'upload : ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    // Deuxième filtre, le seul qui compte vraiment : on lit les premiers
    // octets du fichier réellement reçu ("magic bytes"), indépendamment du
    // Content-Type déclaré ou du nom de fichier d'origine -- les deux sont
    // falsifiables, pas le contenu binaire du fichier lui-même.
    const typeReel = detecterTypeImage(req.file.buffer);
    if (!typeReel) {
      return res.status(400).json({
        error:
          "Le contenu du fichier ne correspond à aucune image JPEG, PNG ou WebP valide",
      });
    }

    // Rotation EXIF, suppression de toutes les métadonnées (GPS inclus),
    // redimensionnement (sans jamais agrandir) et recompression -- cf.
    // Documentation/A11y_Perf_Passe1_2026-10-09.md, A1/G2 (lot images).
    let resultat;
    try {
      resultat = await optimiserImage(req.file.buffer, typeReel);
    } catch (errOptim) {
      if (errOptim instanceof ImageTropLourdeError) {
        return res.status(400).json({ error: errOptim.message });
      }
      console.error(errOptim);
      return res
        .status(500)
        .json({ error: "Erreur lors du traitement de l'image" });
    }

    // L'extension du fichier écrit sur disque vient du type réellement
    // détecté, jamais du nom de fichier fourni par le client.
    const extension = EXTENSION_PAR_TYPE[typeReel];
    const nomUnique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    const cheminDestination = path.join(
      __dirname,
      "../../public/uploads",
      nomUnique,
    );

    fs.writeFile(cheminDestination, resultat.buffer, (errEcriture) => {
      if (errEcriture) {
        console.error(errEcriture);
        return res
          .status(500)
          .json({ error: "Erreur lors de l'enregistrement du fichier" });
      }
      res.json({ url: `/uploads/${nomUnique}` });
    });
  });
});

module.exports = router;
