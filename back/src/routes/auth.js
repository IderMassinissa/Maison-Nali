const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getUserByEmail,
  createUser,
  updatePassword,
} = require("../repositories/users");
const { verifyPassword, hashPassword } = require("../repositories/auth");

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

router.put("/password", requireAuth, async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    if (!nouveauMotDePasse || nouveauMotDePasse.length < 8) {
      return res.status(400).json({
        error: "Le nouveau mot de passe doit faire au moins 8 caractères",
      });
    }

    const db = require("../db/connection");
    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(req.session.userId);

    const valide = await verifyPassword(ancienMotDePasse, user.password_hash);
    if (!valide) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }

    const nouveauHash = await hashPassword(nouveauMotDePasse);
    updatePassword(user.id, nouveauHash);

    res.json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors du changement de mot de passe" });
  }
});

module.exports = router;
