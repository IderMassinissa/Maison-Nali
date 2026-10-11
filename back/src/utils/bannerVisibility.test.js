// Date du jour à Paris autour du changement de jour UTC, visibilité de la bannière selon sa fenêtre de dates.
const test = require("node:test");
const assert = require("node:assert");
const { getParisDate, isBannerVisible } = require("./bannerVisibility");

test("getParisDate cas estival : 22h30 UTC est déjà le jour suivant à Paris", () => {
  assert.strictEqual(
    getParisDate(new Date("2026-06-30T22:30:00Z")),
    "2026-07-01",
  );
});

test("getParisDate cas hivernal : 23h30 UTC est déjà le jour suivant à Paris", () => {
  assert.strictEqual(
    getParisDate(new Date("2026-12-31T23:30:00Z")),
    "2027-01-01",
  );
});

test("isBannerVisible : inactive avec dates valides -> false", () => {
  assert.strictEqual(
    isBannerVisible(
      { active: 0, start_date: "2026-01-01", end_date: "2026-12-31" },
      "2026-06-15",
    ),
    false,
  );
});

test("isBannerVisible : actif sans dates -> true", () => {
  assert.strictEqual(
    isBannerVisible({ active: 1, start_date: null, end_date: null }, "2026-06-15"),
    true,
  );
});

test("isBannerVisible : avant le début -> false", () => {
  assert.strictEqual(
    isBannerVisible(
      { active: 1, start_date: "2026-07-01", end_date: null },
      "2026-06-30",
    ),
    false,
  );
});

test("isBannerVisible : le jour du début -> true (inclus)", () => {
  assert.strictEqual(
    isBannerVisible(
      { active: 1, start_date: "2026-07-01", end_date: null },
      "2026-07-01",
    ),
    true,
  );
});

test("isBannerVisible : entre début et fin -> true", () => {
  assert.strictEqual(
    isBannerVisible(
      { active: 1, start_date: "2026-07-01", end_date: "2026-07-31" },
      "2026-07-15",
    ),
    true,
  );
});

test("isBannerVisible : le jour de fin -> true (inclus)", () => {
  assert.strictEqual(
    isBannerVisible(
      { active: 1, start_date: "2026-07-01", end_date: "2026-07-31" },
      "2026-07-31",
    ),
    true,
  );
});

test("isBannerVisible : après la fin -> false", () => {
  assert.strictEqual(
    isBannerVisible(
      { active: 1, start_date: "2026-07-01", end_date: "2026-07-31" },
      "2026-08-01",
    ),
    false,
  );
});

test("isBannerVisible : seulement début, aujourd'hui après -> true", () => {
  assert.strictEqual(
    isBannerVisible(
      { active: 1, start_date: "2026-07-01", end_date: null },
      "2026-08-01",
    ),
    true,
  );
});

test("isBannerVisible : seulement fin, aujourd'hui avant -> true", () => {
  assert.strictEqual(
    isBannerVisible(
      { active: 1, start_date: null, end_date: "2026-07-31" },
      "2026-01-01",
    ),
    true,
  );
});
