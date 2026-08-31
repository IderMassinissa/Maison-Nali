const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getAllOpeningHours,
  updateOpeningHour,
} = require("../repositories/openingHours");

router.get("/", (req, res) => {
  res.json(getAllOpeningHours());
});

router.put("/:id", requireAuth, (req, res) => {
  const { openTime, closeTime } = req.body;
  updateOpeningHour(req.params.id, openTime, closeTime);
  res.json({ message: "Horaire mis à jour" });
});

module.exports = router;
