const bcrypt = require("bcrypt");
const db = require("./connection");

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node src/db/seed-admin.js <email> <mot-de-passe>");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
    email,
    hash,
  );
  console.log("Compte admin créé :", email);
});
