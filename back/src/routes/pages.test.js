// Routes pages/sections : lecture publique, écriture du contenu d'une section (auth, validation, 404).
const test = require("node:test");
const assert = require("node:assert");
const { before, after } = require("node:test");
const request = require("supertest");
const bcrypt = require("bcrypt");
const db = require("../db/connection");
const { createUser } = require("../repositories/users");
const app = require("../server");

const EMAIL_TEST = "test-sections-01@example.test";
const MOT_DE_PASSE_TEST = "MotDePasseTest123!";
const SLUG_PAGE_TEMP = "test-page-temp";

let agent;

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
});

function creerBlocEnteteTemporaire(suffixe) {
  const pageId = db
    .prepare(
      "INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, 999, 1)",
    )
    .run(`${SLUG_PAGE_TEMP}-${suffixe}`, "Page de test").lastInsertRowid;
  const sectionId = db
    .prepare(
      "INSERT INTO sections (type, position, content, page_id) VALUES ('bloc-entete', 0, '{}', ?)",
    )
    .run(pageId).lastInsertRowid;
  return { pageId, sectionId };
}

function supprimerPageTemporaire(pageId) {
  db.prepare("DELETE FROM sections WHERE page_id = ?").run(pageId);
  db.prepare("DELETE FROM pages WHERE id = ?").run(pageId);
}

test("PUT /api/pages/sections/:id/content sans authentification renvoie 401", async () => {
  const res = await request(app)
    .put("/api/pages/sections/1/content")
    .send({ content: "{}" });
  assert.strictEqual(res.status, 401);
});

test("bloc-entete : PUT content refuse un titre manquant (400)", async (t) => {
  const { pageId, sectionId } = creerBlocEnteteTemporaire("titre");
  t.after(() => supprimerPageTemporaire(pageId));

  const res = await agent
    .put(`/api/pages/sections/${sectionId}/content`)
    .send({ content: JSON.stringify({ libelle: "Test", titre: "" }) });
  assert.strictEqual(res.status, 400);
});

test("bloc-entete : PUT content refuse un libellé trop long (400)", async (t) => {
  const { pageId, sectionId } = creerBlocEnteteTemporaire("libelle");
  t.after(() => supprimerPageTemporaire(pageId));

  const res = await agent.put(`/api/pages/sections/${sectionId}/content`).send({
    content: JSON.stringify({ libelle: "x".repeat(61), titre: "Titre" }),
  });
  assert.strictEqual(res.status, 400);
});

test("bloc-entete : PUT content refuse un titre trop long (400)", async (t) => {
  const { pageId, sectionId } = creerBlocEnteteTemporaire("titrelong");
  t.after(() => supprimerPageTemporaire(pageId));

  const res = await agent.put(`/api/pages/sections/${sectionId}/content`).send({
    content: JSON.stringify({ titre: "x".repeat(101) }),
  });
  assert.strictEqual(res.status, 400);
});

test("bloc-entete : PUT content refuse une intro trop longue (400)", async (t) => {
  const { pageId, sectionId } = creerBlocEnteteTemporaire("introlongue");
  t.after(() => supprimerPageTemporaire(pageId));

  const res = await agent.put(`/api/pages/sections/${sectionId}/content`).send({
    content: JSON.stringify({ titre: "Titre", intro: "x".repeat(301) }),
  });
  assert.strictEqual(res.status, 400);
});

test("bloc-entete : PUT content accepte un contenu valide", async (t) => {
  const { pageId, sectionId } = creerBlocEnteteTemporaire("valide");
  t.after(() => supprimerPageTemporaire(pageId));

  const res = await agent.put(`/api/pages/sections/${sectionId}/content`).send({
    content: JSON.stringify({
      libelle: "Test",
      titre: "Titre de test",
      intro: "Introduction de test",
    }),
  });
  assert.strictEqual(res.status, 200);
});
