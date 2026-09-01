const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const BASE_URL = "http://localhost:3001";

test("accès à une route admin sans authentification renvoie 401", async () => {
  const res = await request(BASE_URL)
    .post("/api/products")
    .send({ name: "Test" });
  assert.strictEqual(res.status, 401);
});

test("injection SQL dans un paramètre ne casse pas la requête", async () => {
  const res = await request(BASE_URL).get("/api/products/1' OR '1'='1");
  assert.notStrictEqual(res.status, 500);
});

test("couleur de thème invalide est rejetée", async () => {
  const res = await request(BASE_URL)
    .put("/api/settings/color_primary")
    .send({ value: "<script>alert(1)</script>" });
  assert.strictEqual(res.status, 401);
});

test("route inexistante renvoie 404 proprement", async () => {
  const res = await request(BASE_URL).get("/api/route-qui-nexiste-pas");
  assert.strictEqual(res.status, 404);
});
