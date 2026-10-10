const test = require("node:test");
const assert = require("node:assert");
const { before, after } = require("node:test");
const fs = require("fs");
const path = require("path");
const request = require("supertest");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const db = require("../db/connection");
const { createUser } = require("../repositories/users");
const app = require("../server");

const EMAIL_TEST = "test-upload-lot-images@example.test";
const MOT_DE_PASSE_TEST = "MotDePasseTest123!";
const DOSSIER_UPLOADS = path.join(__dirname, "../../public/uploads");

let agent;
const fichiersCrees = [];

before(async () => {
  const hash = await bcrypt.hash(MOT_DE_PASSE_TEST, 10);
  createUser(EMAIL_TEST, hash);

  agent = request.agent(app);
  await agent
    .post("/api/auth/login")
    .send({ email: EMAIL_TEST, password: MOT_DE_PASSE_TEST });
});

after(() => {
  db.prepare("DELETE FROM users WHERE email = ?").run(EMAIL_TEST);
  // Cette route écrit réellement dans back/public/uploads (pas de
  // branchement test dédié) -- nettoyage obligatoire des fichiers créés
  // pendant les tests pour ne pas polluer le vrai dossier d'uploads.
  for (const nom of fichiersCrees) {
    const chemin = path.join(DOSSIER_UPLOADS, nom);
    if (fs.existsSync(chemin)) fs.unlinkSync(chemin);
  }
});

test("POST /api/upload sans authentification renvoie 401", async () => {
  const res = await request(app).post("/api/upload");
  assert.strictEqual(res.status, 401);
});

test("un faux .jpg (texte brut renommé) est toujours rejeté (400)", async () => {
  const res = await agent
    .post("/api/upload")
    .attach("photo", Buffer.from("pas une vraie image"), {
      filename: "fausse-image.jpg",
      contentType: "image/jpeg",
    });
  assert.strictEqual(res.status, 400);
});

test("une image valide est acceptée, redimensionnée et écrite sur disque", async (t) => {
  const grande = await sharp({
    create: { width: 3000, height: 1500, channels: 3, background: "orange" },
  })
    .jpeg()
    .toBuffer();

  const res = await agent
    .post("/api/upload")
    .attach("photo", grande, { filename: "photo.jpg", contentType: "image/jpeg" });

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.url.startsWith("/uploads/"));

  const nomFichier = res.body.url.replace("/uploads/", "");
  fichiersCrees.push(nomFichier);
  t.after(() => {
    const chemin = path.join(DOSSIER_UPLOADS, nomFichier);
    if (fs.existsSync(chemin)) fs.unlinkSync(chemin);
  });

  const cheminDisque = path.join(DOSSIER_UPLOADS, nomFichier);
  assert.ok(fs.existsSync(cheminDisque));
  const meta = await sharp(cheminDisque).metadata();
  assert.ok(meta.width <= 1600, `largeur ${meta.width} doit être <= 1600`);
  assert.strictEqual(meta.exif, undefined);
});

test("une image dépassant la limite de pixels (bombe) est refusée (400)", async () => {
  const bombe = await sharp({
    create: { width: 8000, height: 6000, channels: 3, background: "red" },
  })
    .jpeg()
    .toBuffer();

  const res = await agent
    .post("/api/upload")
    .attach("photo", bombe, { filename: "bombe.jpg", contentType: "image/jpeg" });

  assert.strictEqual(res.status, 400);
});
