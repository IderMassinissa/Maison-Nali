const db = require("./connection");

const pages = [
  { slug: "accueil", title: "Accueil", position: 1 },
  { slug: "patisseries", title: "Pâtisseries", position: 2 },
  { slug: "a-propos", title: "À propos", position: 3 },
  { slug: "adresse", title: "Adresse", position: 4 },
];

// user_id = 1, l'admin créé via seed-admin.js
const insertPage = db.prepare(
  "INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, ?, 1)",
);
const insertSection = db.prepare(
  "INSERT INTO sections (type, position, content, page_id) VALUES (?, ?, ?, ?)",
);

const sectionsParPage = {
  accueil: [
    "hero",
    "grille-patisseries",
    "bloc-histoire",
    "bloc-localisation",
    "bloc-reseaux",
  ],
  patisseries: ["grille-patisseries"],
  "a-propos": ["bloc-histoire"],
  adresse: ["bloc-localisation", "bloc-reseaux"],
};

for (const page of pages) {
  const result = insertPage.run(page.slug, page.title, page.position);
  const pageId = result.lastInsertRowid;

  sectionsParPage[page.slug].forEach((type, index) => {
    insertSection.run(type, index + 1, JSON.stringify({}), pageId);
  });
}

console.log("Pages et blocs initiaux créés.");
