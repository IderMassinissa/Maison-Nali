const test = require("node:test");
const assert = require("node:assert");
const { before, after } = require("node:test");
const request = require("supertest");
const bcrypt = require("bcrypt");
const db = require("../db/connection");
const { createUser } = require("../repositories/users");
const { deleteSection, getSectionById } = require("../repositories/sections");

const BASE_URL = "http://localhost:3001";

const EMAIL_TEST = "test-sections-phase4d@example.test";
const MOT_DE_PASSE_TEST = "MotDePasseTest123!";
const SLUG_PAGE_TEMP = "test-page-phase5a";

let agent;

before(async () => {
  const hash = await bcrypt.hash(MOT_DE_PASSE_TEST, 10);
  createUser(EMAIL_TEST, hash);

  agent = request.agent(BASE_URL);
  await agent
    .post("/api/auth/login")
    .send({ email: EMAIL_TEST, password: MOT_DE_PASSE_TEST });
});

after(() => {
  db.prepare("DELETE FROM users WHERE email = ?").run(EMAIL_TEST);
});

test("POST /api/pages/:slug/sections sans authentification renvoie 401", async () => {
  const res = await request(BASE_URL)
    .post("/api/pages/adresse/sections")
    .send({ type: "bloc-histoire" });
  assert.strictEqual(res.status, 401);
});

test("POST refuse un type à instance unique déjà présent sur la page (400)", async () => {
  const res = await agent
    .post("/api/pages/adresse/sections")
    .send({ type: "bloc-localisation" });
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test("POST accepte un bloc-histoire même si la page en a déjà un", async (t) => {
  let id;
  t.after(() => {
    if (id) deleteSection(id);
  });

  const res = await agent
    .post("/api/pages/a-propos/sections")
    .send({ type: "bloc-histoire" });
  assert.strictEqual(res.status, 201);
  id = res.body.id;

  const section = getSectionById(id);
  assert.strictEqual(section.type, "bloc-histoire");
});

test("DELETE /api/pages/sections/:id supprime le bloc", async (t) => {
  const creation = await agent
    .post("/api/pages/a-propos/sections")
    .send({ type: "bloc-histoire" });
  const id = creation.body.id;
  t.after(() => {
    deleteSection(id);
  });

  const res = await agent.delete(`/api/pages/sections/${id}`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(getSectionById(id), undefined);
});

test("PUT /api/pages/sections/:id/position met à jour la position", async (t) => {
  const creation = await agent
    .post("/api/pages/a-propos/sections")
    .send({ type: "bloc-histoire" });
  const id = creation.body.id;
  t.after(() => {
    deleteSection(id);
  });

  const res = await agent
    .put(`/api/pages/sections/${id}/position`)
    .send({ position: 9 });
  assert.strictEqual(res.status, 200);

  const section = getSectionById(id);
  assert.strictEqual(section.position, 9);
});

test("bloc-entete : POST accepté sur une page sans bloc-entete, puis refusé en doublon", async (t) => {
  const pageId = db
    .prepare(
      "INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, 999, 1)",
    )
    .run(SLUG_PAGE_TEMP, "Page de test phase 5a").lastInsertRowid;

  t.after(() => {
    db.prepare("DELETE FROM sections WHERE page_id = ?").run(pageId);
    db.prepare("DELETE FROM pages WHERE id = ?").run(pageId);
  });

  const premierAjout = await agent
    .post(`/api/pages/${SLUG_PAGE_TEMP}/sections`)
    .send({ type: "bloc-entete" });
  assert.strictEqual(premierAjout.status, 201);

  const section = getSectionById(premierAjout.body.id);
  assert.strictEqual(section.type, "bloc-entete");

  const deuxiemeAjout = await agent
    .post(`/api/pages/${SLUG_PAGE_TEMP}/sections`)
    .send({ type: "bloc-entete" });
  assert.strictEqual(deuxiemeAjout.status, 400);
  assert.ok(deuxiemeAjout.body.error);
});

test("bloc-entete : PUT content refuse un titre manquant (400)", async (t) => {
  const pageId = db
    .prepare(
      "INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, 999, 1)",
    )
    .run(SLUG_PAGE_TEMP + "-titre", "Page de test titre").lastInsertRowid;
  const creation = await agent
    .post(`/api/pages/${SLUG_PAGE_TEMP}-titre/sections`)
    .send({ type: "bloc-entete" });
  const id = creation.body.id;

  t.after(() => {
    db.prepare("DELETE FROM sections WHERE page_id = ?").run(pageId);
    db.prepare("DELETE FROM pages WHERE id = ?").run(pageId);
  });

  const res = await agent
    .put(`/api/pages/sections/${id}/content`)
    .send({ content: JSON.stringify({ libelle: "Test", titre: "" }) });
  assert.strictEqual(res.status, 400);
});

test("bloc-entete : PUT content refuse un libellé trop long (400)", async (t) => {
  const pageId = db
    .prepare(
      "INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, 999, 1)",
    )
    .run(SLUG_PAGE_TEMP + "-libelle", "Page de test libellé").lastInsertRowid;
  const creation = await agent
    .post(`/api/pages/${SLUG_PAGE_TEMP}-libelle/sections`)
    .send({ type: "bloc-entete" });
  const id = creation.body.id;

  t.after(() => {
    db.prepare("DELETE FROM sections WHERE page_id = ?").run(pageId);
    db.prepare("DELETE FROM pages WHERE id = ?").run(pageId);
  });

  const res = await agent.put(`/api/pages/sections/${id}/content`).send({
    content: JSON.stringify({ libelle: "x".repeat(61), titre: "Titre" }),
  });
  assert.strictEqual(res.status, 400);
});

test("bloc-entete : PUT content refuse un titre trop long (400)", async (t) => {
  const pageId = db
    .prepare(
      "INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, 999, 1)",
    )
    .run(SLUG_PAGE_TEMP + "-titrelong", "Page de test titre long")
    .lastInsertRowid;
  const creation = await agent
    .post(`/api/pages/${SLUG_PAGE_TEMP}-titrelong/sections`)
    .send({ type: "bloc-entete" });
  const id = creation.body.id;

  t.after(() => {
    db.prepare("DELETE FROM sections WHERE page_id = ?").run(pageId);
    db.prepare("DELETE FROM pages WHERE id = ?").run(pageId);
  });

  const res = await agent.put(`/api/pages/sections/${id}/content`).send({
    content: JSON.stringify({ titre: "x".repeat(101) }),
  });
  assert.strictEqual(res.status, 400);
});

test("bloc-entete : PUT content refuse une intro trop longue (400)", async (t) => {
  const pageId = db
    .prepare(
      "INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, 999, 1)",
    )
    .run(SLUG_PAGE_TEMP + "-introlongue", "Page de test intro longue")
    .lastInsertRowid;
  const creation = await agent
    .post(`/api/pages/${SLUG_PAGE_TEMP}-introlongue/sections`)
    .send({ type: "bloc-entete" });
  const id = creation.body.id;

  t.after(() => {
    db.prepare("DELETE FROM sections WHERE page_id = ?").run(pageId);
    db.prepare("DELETE FROM pages WHERE id = ?").run(pageId);
  });

  const res = await agent.put(`/api/pages/sections/${id}/content`).send({
    content: JSON.stringify({ titre: "Titre", intro: "x".repeat(301) }),
  });
  assert.strictEqual(res.status, 400);
});
