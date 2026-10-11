/**
 * Crée le compte admin (`node src/db/init-admin.js <email> <mot-de-passe>`),
 * à lancer une fois après `init-db` et avant `content:import` (qui a besoin
 * d'un utilisateur existant pour rattacher les pages importées). Mot de
 * passe haché en bcrypt avant écriture, jamais stocké en clair. Pas
 * idempotent : la contrainte UNIQUE sur users.email fait échouer une
 * seconde exécution avec le même email plutôt que de créer un doublon.
 */
const bcrypt = require("bcrypt");
const db = require("./connection");

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node src/db/init-admin.js <email> <mot-de-passe>");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
    email,
    hash,
  );
  console.log("Compte admin créé :", email);
});
