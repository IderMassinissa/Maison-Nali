const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getActiveAnnouncement,
  setAnnouncement,
} = require("../repositories/announcements");

router.get("/", (req, res) => {
  const announcement = getActiveAnnouncement();
  res.json(announcement || null);
});

router.put("/", requireAuth, (req, res) => {
  const { message, active } = req.body;
  setAnnouncement(message, active);
  res.json({ message: "Bannière mise à jour" });
});

module.exports = router;
