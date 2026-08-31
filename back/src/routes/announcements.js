const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getActiveAnnouncement,
  setAnnouncement,
} = require("../repositories/announcements");

router.get("/", (req, res) => {
  try {
    const announcement = getActiveAnnouncement();
    res.json(announcement || null);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la bannière" });
  }
});

router.put("/", requireAuth, (req, res) => {
  try {
    const { message, active } = req.body;
    setAnnouncement(message, active);
    res.json({ message: "Bannière mise à jour" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la bannière" });
  }
});

module.exports = router;
