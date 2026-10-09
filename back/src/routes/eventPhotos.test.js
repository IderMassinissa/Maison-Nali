const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../server");

test("POST /api/event-photos sans authentification renvoie 401", async () => {
  const res = await request(app)
    .post("/api/event-photos")
    .send({ imageUrl: "/uploads/test.jpg" });
  assert.strictEqual(res.status, 401);
});

test("PUT /api/event-photos/:id sans authentification renvoie 401", async () => {
  const res = await request(app)
    .put("/api/event-photos/1")
    .send({ alt: "Test" });
  assert.strictEqual(res.status, 401);
});

test("DELETE /api/event-photos/:id sans authentification renvoie 401", async () => {
  const res = await request(app).delete("/api/event-photos/1");
  assert.strictEqual(res.status, 401);
});
