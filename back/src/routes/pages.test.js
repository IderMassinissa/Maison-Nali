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
