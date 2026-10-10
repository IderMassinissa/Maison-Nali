const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getSetting, setSetting } = require("../repositories/settings");
const { validateSettingValue } = require("../utils/validateSettingValue");

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

    const validation = validateSettingValue(key, value);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    setSetting(key, value);
    res.json({ message: "Réglage mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du réglage" });
  }
});

module.exports = router;
