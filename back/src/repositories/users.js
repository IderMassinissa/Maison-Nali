/**
 * Accès SQL à la table `users` (comptes admin uniquement — pas de notion
 * d'utilisateur public sur ce site). password_hash est toujours un hash
 * bcrypt déjà calculé (voir repositories/auth.js) : ce fichier ne hache
 * jamais rien lui-même, il stocke tel quel ce qu'on lui donne.
 */
const db = require("../db/connection");

/** @returns {object|undefined} l'utilisateur de cet email, ou undefined s'il n'existe pas. */
function getUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

/** Crée un utilisateur. @throws en cas de doublon (contrainte UNIQUE sur email). */
function createUser(email, passwordHash) {
  const stmt = db.prepare(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
  );
  return stmt.run(email, passwordHash);
}

/** Remplace le hash de mot de passe d'un utilisateur. */
function updatePassword(userId, newPasswordHash) {
  return db
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(newPasswordHash, userId);
}

module.exports = { getUserByEmail, createUser, updatePassword };
