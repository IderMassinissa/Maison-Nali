const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getSetting, setSetting } = require("../repositories/settings");
const { validatePhone } = require("../utils/phone");

const REGEX_URL = /^https?:\/\/.+/;

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

    if (key.startsWith("social_") && value && !REGEX_URL.test(value)) {
      return res.status(400).json({
        error: "Lien invalide, une URL http(s) est attendue",
      });
    }

    if (key === "phone" && value && !validatePhone(value)) {
      return res.status(400).json({
        error:
          "Numéro invalide (chiffres, espaces, +, ., -, () uniquement, entre 6 et 20 caractères)",
      });
    }

    setSetting(key, value);
    res.json({ message: "Réglage mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du réglage" });
  }
});

module.exports = router;
