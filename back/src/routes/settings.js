const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getSetting, setSetting } = require("../repositories/settings");

const POLICES_AUTORISEES = ["Cormorant Garamond", "Inter"];
const REGEX_COULEUR_HEX = /^#[0-9A-Fa-f]{6}$/;

router.get("/:key", (req, res) => {
  const value = getSetting(req.params.key);
  res.json({ key: req.params.key, value });
});

router.put("/:key", requireAuth, (req, res) => {
  const { value } = req.body;
  const key = req.params.key;

  if (key.startsWith("color_") && !REGEX_COULEUR_HEX.test(value)) {
    return res
      .status(400)
      .json({
        error: "Couleur invalide, format hexadécimal attendu (#RRGGBB)",
      });
  }

  if (key.startsWith("font_") && !POLICES_AUTORISEES.includes(value)) {
    return res.status(400).json({ error: "Police non autorisée" });
  }

  setSetting(key, value);
  res.json({ message: "Réglage mis à jour" });
});

module.exports = router;
