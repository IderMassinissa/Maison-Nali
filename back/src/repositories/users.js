const db = require("../db/connection");

function getUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

function createUser(email, passwordHash) {
  const stmt = db.prepare(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
  );
  return stmt.run(email, passwordHash);
}

function updatePassword(userId, newPasswordHash) {
  return db
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(newPasswordHash, userId);
}

module.exports = { getUserByEmail, createUser, updatePassword };
