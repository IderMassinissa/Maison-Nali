/**
 * Routes d'authentification admin : login (rate-limité par IP, session
 * régénérée pour empêcher la fixation de session), logout, lecture de la
 * session courante (/me), changement de mot de passe. Mots de passe
 * jamais manipulés en clair hors de ce fichier et de repositories/auth.js
 * (hash/vérification bcrypt) — la base ne stocke que le hash.
 */
const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const rateLimitLogin = require("../middleware/rateLimitLogin");
const { NOM_COOKIE_SESSION } = require("../constants");
const {
  getUserByEmail,
  createUser,
  updatePassword,
} = require("../repositories/users");
const { verifyPassword, hashPassword } = require("../repositories/auth");

router.post("/login", rateLimitLogin, async (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Identifiants incorrects" });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Identifiants incorrects" });
  }

  // Connexion reussie : cette IP n'a plus de raison de rester comptee comme
  // suspecte, meme si elle avait deja echoue plusieurs fois avant.
  rateLimitLogin.reinitialiserTentativesIp(req.ip);

  // Regenere l'identifiant de session avant d'y placer l'utilisateur
  // connecte : empeche la fixation de session (un identifiant de session
  // connu/pose par un attaquant avant la connexion ne devient jamais une
  // session authentifiee, puisqu'un nouvel identifiant est genere ici).
  req.session.regenerate((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur lors de la connexion" });
    }
    req.session.userId = user.id;
    res.json({ message: "Connecté" });
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    // Le cookie peut rester dans le navigateur apres destroy() (la session
    // qu'il designe n'existe simplement plus cote serveur) -- on le
    // supprime explicitement par propete.
    res.clearCookie(NOM_COOKIE_SESSION);
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
