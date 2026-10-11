// Dates de bannière : vides, partielles, invalides, fin avant début, cohérentes.
const test = require("node:test");
const assert = require("node:assert");
const { validateBannerDates } = require("./validateBannerDates");

test("valeurs vides sont acceptées et normalisées à null", () => {
  const r = validateBannerDates("", "");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.startDate, null);
  assert.strictEqual(r.endDate, null);
});

test("valeurs absentes (undefined) sont acceptées", () => {
  const r = validateBannerDates(undefined, undefined);
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.startDate, null);
  assert.strictEqual(r.endDate, null);
});

test("format invalide est rejeté", () => {
  const r = validateBannerDates("31-02-2026", "");
  assert.strictEqual(r.valid, false);
});

test("date inexistante est rejetée (2026-02-31)", () => {
  const r = validateBannerDates("2026-02-31", "");
  assert.strictEqual(r.valid, false);
});

test("fin avant début est rejetée", () => {
  const r = validateBannerDates("2026-07-15", "2026-07-01");
  assert.strictEqual(r.valid, false);
});

test("dates valides et cohérentes (fin = début) sont acceptées", () => {
  const r = validateBannerDates("2026-07-01", "2026-07-01");
  assert.strictEqual(r.valid, true);
});

test("dates valides et cohérentes sont acceptées et renvoyées telles quelles", () => {
  const r = validateBannerDates("2026-07-01", "2026-07-31");
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.startDate, "2026-07-01");
  assert.strictEqual(r.endDate, "2026-07-31");
});
