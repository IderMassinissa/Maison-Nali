const express = require("express");
const router = express.Router();
const { getUserByEmail } = require("../repositories/users");
const { verifyPassword } = require("../repositories/auth");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Identifiants incorrects" });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Identifiants incorrects" });
  }

  req.session.userId = user.id;
  res.json({ message: "Connecté" });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Déconnecté" });
  });
});

router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  res.json({ userId: req.session.userId });
});

module.exports = router;
