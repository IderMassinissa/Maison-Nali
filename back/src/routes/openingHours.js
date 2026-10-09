const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getAllOpeningHours,
  updateOpeningHour,
} = require("../repositories/openingHours");
const { validateOpeningHours } = require("../utils/validateOpeningHours");

router.get("/", (req, res) => {
  try {
    res.json(getAllOpeningHours());
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des horaires" });
  }
});

router.put("/:id", requireAuth, (req, res) => {
  try {
    const { openTime, closeTime } = req.body;
    const validation = validateOpeningHours(openTime, closeTime);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    updateOpeningHour(req.params.id, validation.openTime, validation.closeTime);
    res.json({ message: "Horaire mis à jour" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de l'horaire" });
  }
});

module.exports = router;
