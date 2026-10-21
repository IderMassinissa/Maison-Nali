/**
 * Hachage et vérification de mot de passe (bcrypt, coût 12). Utilisé par
 * routes/auth.js à la connexion et par le changement de mot de passe.
 * Ne touche pas la base — la lecture/écriture du hash vit dans
 * repositories/users.js.
 */
const bcrypt = require("bcrypt");
const { COUT_BCRYPT } = require("../constants");

/** @returns {Promise<string>} le hash bcrypt du mot de passe en clair. */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, COUT_BCRYPT);
}

/** @returns {Promise<boolean>} vrai si le mot de passe en clair correspond au hash stocké. */
async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

module.exports = { hashPassword, verifyPassword };
