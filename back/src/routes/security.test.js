// Garde-fous transverses : route admin sans auth, injection SQL dans un paramètre.
const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../server");

test("accès à une route admin sans authentification renvoie 401", async () => {
  const res = await request(app).post("/api/products").send({ name: "Test" });
  assert.strictEqual(res.status, 401);
});

test("injection SQL dans un paramètre ne casse pas la requête", async () => {
  const res = await request(app).get("/api/products/1' OR '1'='1");
  assert.notStrictEqual(res.status, 500);
});

test("modification d'un réglage sans authentification renvoie 401", async () => {
  const res = await request(app)
    .put("/api/settings/social_instagram")
    .send({ value: "<script>alert(1)</script>" });
  assert.strictEqual(res.status, 401);
});

test("route inexistante renvoie 404 proprement", async () => {
  const res = await request(app).get("/api/route-qui-nexiste-pas");
  assert.strictEqual(res.status, 404);
});
