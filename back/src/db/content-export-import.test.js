// Round-trip content-export.js -> content-import.js, et garde-fous d'import (base non vide, contenu invalide, fichiers manquants).
const test = require("node:test");
const assert = require("node:assert");
const db = require("./connection");
const { exporterContenu } = require("./content-export");
const {
  importerDepuisFichier,
  etatBase,
  ContenuInvalideError,
  BaseNonVideError,
  TABLES_CONTENU,
} = require("./content-import");
const { createUser } = require("../repositories/users");

const CHEMIN_TEMP = require("path").join(__dirname, "../../data/contenu-test-temp.json");
const fs = require("fs");

// Les tables de contenu ne sont pas forcément vides au départ (d'autres
// fichiers de test de ce run peuvent avoir laissé des lignes) -- chaque
// test ci-dessous vide explicitement ce qu'il lui faut plutôt que de
// supposer un état initial particulier.
function viderTout() {
  db.prepare("DELETE FROM sections").run();
  db.prepare("DELETE FROM pages").run();
  db.prepare("DELETE FROM products").run();
  db.prepare("DELETE FROM categories").run();
  db.prepare("DELETE FROM opening_hours").run();
  db.prepare("DELETE FROM settings").run();
  db.prepare("DELETE FROM event_photos").run();
  db.prepare("DELETE FROM announcements").run();
}

function creerJeuDeDonnees(userId) {
  const pageId = db
    .prepare("INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, ?, ?)")
    .run("page-test-export", "Page de test export", 1, userId).lastInsertRowid;

  db.prepare(
    "INSERT INTO sections (type, position, content, page_id) VALUES (?, ?, ?, ?)",
  ).run("bloc-entete", 0, JSON.stringify({ libelle: "L", titre: "T", intro: "I" }), pageId);
  db.prepare(
    "INSERT INTO sections (type, position, content, page_id) VALUES (?, ?, ?, ?)",
  ).run("hero", 1, JSON.stringify({ titre: "Hero", photo: "" }), pageId);

  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("phone", "01 23 45 67 89");
  db.prepare("INSERT INTO opening_hours (day, open_time, close_time) VALUES (?, ?, ?)").run(
    "Lundi",
    "09:00",
    "18:00",
  );
  const catId = db
    .prepare("INSERT INTO categories (name) VALUES (?)")
    .run("Catégorie test").lastInsertRowid;
  db.prepare(
    "INSERT INTO products (name, description, photo_url, video_url, category_id, focus_x, focus_y, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  ).run("Produit test", "Desc", "", "", catId, 50, 50, 1);
  db.prepare("INSERT INTO event_photos (image_url, alt, position) VALUES (?, ?, ?)").run(
    "/uploads/photo-test-inexistante.jpg",
    "Alt test",
    1,
  );
  db.prepare(
    "INSERT INTO announcements (message, active, start_date, end_date) VALUES (?, ?, ?, ?)",
  ).run("Annonce test", 1, null, null);

  return { pageId };
}

let compteurEmail = 0;

// Crée un utilisateur de test dédié (email unique, jamais de collision
// avec un autre fichier de test). Pas de suppression programmée : la
// base de test est entièrement régénérée par pretest (init-test.js) à
// chaque lancement de `npm test`, et supprimer l'utilisateur ici avant
// d'avoir vidé pages/sections qui le référencent (FK) dépendrait d'un
// ordre d'exécution des hooks t.after() non garanti -- plus simple de ne
// pas le supprimer du tout, sans conséquence sur les autres tests.
function creerUtilisateurTemporaire() {
  compteurEmail += 1;
  const email = `test-content-import-${Date.now()}-${compteurEmail}@example.test`;
  const result = createUser(email, "hash-non-verifie");
  return result.lastInsertRowid;
}

test("round-trip export -> import : contenu strictement identique", async (t) => {
  viderTout();
  const userId = creerUtilisateurTemporaire();
  creerJeuDeDonnees(userId);

  const avant = exporterContenu();
  fs.writeFileSync(CHEMIN_TEMP, JSON.stringify(avant, null, 2));
  t.after(() => fs.existsSync(CHEMIN_TEMP) && fs.unlinkSync(CHEMIN_TEMP));

  viderTout();
  const resultat = importerDepuisFichier({ cheminEntree: CHEMIN_TEMP });
  t.after(viderTout);

  const apres = exporterContenu();

  // exportedAt differe forcement (regenere a chaque export) -- comparaison
  // sur tout le reste, qui doit etre un match exact (memes id, meme ordre).
  const { exportedAt: _a, ...avantSansDate } = avant;
  const { exportedAt: _b, ...apresSansDate } = apres;
  assert.deepStrictEqual(apresSansDate, avantSansDate);

  assert.strictEqual(resultat.comptes.pages, avant.pages.length);
  assert.strictEqual(
    resultat.comptes.sections,
    avant.pages.reduce((n, p) => n + p.sections.length, 0),
  );
});

test("refuse d'importer sur une base non vide (sans --force)", async (t) => {
  viderTout();
  const userId = creerUtilisateurTemporaire();
  creerJeuDeDonnees(userId);
  t.after(viderTout);

  const contenu = exporterContenu();
  fs.writeFileSync(CHEMIN_TEMP, JSON.stringify(contenu, null, 2));
  t.after(() => fs.existsSync(CHEMIN_TEMP) && fs.unlinkSync(CHEMIN_TEMP));

  // La base a du contenu (cf. creerJeuDeDonnees) -- l'import doit refuser.
  assert.throws(
    () => importerDepuisFichier({ cheminEntree: CHEMIN_TEMP }),
    BaseNonVideError,
  );

  // Rien ne doit avoir bougé : toujours le meme contenu qu'avant la tentative.
  const { comptes } = etatBase();
  assert.strictEqual(comptes.pages, contenu.pages.length);
});

test("transaction annulee si une section est invalide (titre bloc-entete vide)", async (t) => {
  viderTout();
  creerUtilisateurTemporaire();
  t.after(viderTout);

  const contenu = {
    exportedAt: new Date().toISOString(),
    pages: [
      {
        id: 1,
        slug: "page-invalide",
        title: "Page invalide",
        position: 1,
        sections: [
          { id: 1, type: "bloc-entete", position: 0, content: { libelle: "L", titre: "", intro: "" } },
          { id: 2, type: "hero", position: 1, content: { photo: "" } },
        ],
      },
    ],
    settings: [],
    opening_hours: [],
    categories: [],
    products: [],
    event_photos: [],
    announcements: [],
  };
  fs.writeFileSync(CHEMIN_TEMP, JSON.stringify(contenu, null, 2));
  t.after(() => fs.existsSync(CHEMIN_TEMP) && fs.unlinkSync(CHEMIN_TEMP));

  assert.throws(
    () => importerDepuisFichier({ cheminEntree: CHEMIN_TEMP }),
    ContenuInvalideError,
  );

  // Rien ecrit : ni la page, ni le hero (pourtant valide) qui la suivait.
  const { comptes } = etatBase();
  assert.strictEqual(comptes.pages, 0);
  assert.strictEqual(comptes.sections, 0);
});

test("liste les fichiers /uploads/... references mais absents du disque", async (t) => {
  viderTout();
  const userId = creerUtilisateurTemporaire();
  creerJeuDeDonnees(userId); // reference /uploads/photo-test-inexistante.jpg (event_photos)
  t.after(viderTout);

  const contenu = exporterContenu();
  fs.writeFileSync(CHEMIN_TEMP, JSON.stringify(contenu, null, 2));
  t.after(() => fs.existsSync(CHEMIN_TEMP) && fs.unlinkSync(CHEMIN_TEMP));

  viderTout();
  const resultat = importerDepuisFichier({ cheminEntree: CHEMIN_TEMP });

  assert.ok(resultat.manquants.includes("photo-test-inexistante.jpg"));
});

test("TABLES_CONTENU couvre bien toutes les tables de contenu exportees", () => {
  assert.deepStrictEqual(
    [...TABLES_CONTENU].sort(),
    [
      "announcements",
      "categories",
      "event_photos",
      "opening_hours",
      "pages",
      "products",
      "sections",
      "settings",
    ].sort(),
  );
});
