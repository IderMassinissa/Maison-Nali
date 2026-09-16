const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getSetting, setSetting } = require("../repositories/settings");
const {
  REGEX_COULEUR_HEX,
  GRADIENT_STYLES_AUTORISES,
} = require("../utils/couleurBloc");

const POLICES_AUTORISEES = [
  "Cormorant Garamond",
  "Playfair Display",
  "Marcellus",
  "Cinzel",
  "EB Garamond",
  "Inter",
  "Work Sans",
  "Jost",
  "Nunito Sans",
];

router.get("/:key", (req, res) => {
  try {
    const value = getSetting(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération du réglage" });
  }
});

router.put("/:key", requireAuth, (req, res) => {
  try {
    const { value } = req.body;
    const key = req.params.key;

    if (key.endsWith("_gradient_enabled")) {
      if (value !== "true" && value !== "false") {
        return res.status(400).json({ error: "Valeur booléenne attendue" });
      }
    } else if (key.endsWith("_gradient_style")) {
      if (!GRADIENT_STYLES_AUTORISES.includes(value)) {
        return res.status(400).json({ error: "Style de dégradé non autorisé" });
      }
    } else if (key.startsWith("color_") && !REGEX_COULEUR_HEX.test(value)) {
      return res.status(400).json({
        error: "Couleur invalide, format hexadécimal attendu (#RRGGBB)",
      });
    } else if (key.startsWith("font_") && !POLICES_AUTORISEES.includes(value)) {
      return res.status(400).json({ error: "Police non autorisée" });
    }

    setSetting(key, value);
    res.json({ message: "Réglage mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du réglage" });
  }
});

module.exports = router;
