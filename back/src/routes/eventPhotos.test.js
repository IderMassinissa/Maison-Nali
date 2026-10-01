const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const BASE_URL = "http://localhost:3001";

test("POST /api/event-photos sans authentification renvoie 401", async () => {
  const res = await request(BASE_URL)
    .post("/api/event-photos")
    .send({ imageUrl: "/uploads/test.jpg" });
  assert.strictEqual(res.status, 401);
});

test("PUT /api/event-photos/:id sans authentification renvoie 401", async () => {
  const res = await request(BASE_URL)
    .put("/api/event-photos/1")
    .send({ alt: "Test" });
  assert.strictEqual(res.status, 401);
});

test("DELETE /api/event-photos/:id sans authentification renvoie 401", async () => {
  const res = await request(BASE_URL).delete("/api/event-photos/1");
  assert.strictEqual(res.status, 401);
});
