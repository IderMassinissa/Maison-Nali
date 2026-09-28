const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getAnnouncement,
  setAnnouncement,
} = require("../repositories/announcements");
const { getParisDate, isBannerVisible } = require("../utils/bannerVisibility");
const { validateBannerDates } = require("../utils/validateBannerDates");

router.get("/", (req, res) => {
  try {
    const announcement = getAnnouncement();
    const visible = isBannerVisible(announcement, getParisDate());
    res.json(visible ? announcement : null);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la bannière" });
  }
});

router.get("/admin", requireAuth, (req, res) => {
  try {
    res.json(getAnnouncement() || null);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la bannière" });
  }
});

router.put("/", requireAuth, (req, res) => {
  try {
    const { message, active, startDate, endDate } = req.body;

    const validation = validateBannerDates(startDate, endDate);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    setAnnouncement(message, active, validation.startDate, validation.endDate);
    res.json({ message: "Bannière mise à jour" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la bannière" });
  }
});

module.exports = router;
