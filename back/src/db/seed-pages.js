const db = require("./connection");

const pages = [
  { slug: "accueil", title: "Accueil", position: 1 },
  { slug: "patisseries", title: "Pâtisseries", position: 2 },
  { slug: "a-propos", title: "À propos", position: 3 },
  { slug: "adresse", title: "Adresse", position: 4 },
  { slug: "evenements", title: "Événements", position: 5 },
];

// user_id = 1, l'admin créé via seed-admin.js
const insertPage = db.prepare(
  "INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, ?, 1)",
);
const insertSection = db.prepare(
  "INSERT INTO sections (type, position, content, page_id) VALUES (?, ?, ?, ?)",
);

const enteteParPage = {
  accueil: {
    libelle: "Maison Nali",
    titre: "Pâtisserie algérienne artisanale à Paris",
    intro: "Un savoir-faire familial transmis depuis trois générations.",
  },
  patisseries: {
    libelle: "Collection Signature",
    titre: "Nos Pâtisseries",
    intro: "",
  },
  "a-propos": {
    libelle: "À propos",
    titre: "Notre histoire, notre savoir-faire",
    intro: "",
  },
  adresse: {
    libelle: "Adresse",
    titre: "Nous rendre visite",
    intro: "",
  },
  evenements: {
    libelle: "Sur mesure",
    titre: "Vos événements sur mesure",
    intro:
      "Mariages, fêtes de famille, Ramadan, cadeaux : Maison Nali prépare des assortiments de pâtisseries algériennes pour vos grands moments. Chaque demande fait l'objet d'un devis personnalisé. Contactez-nous pour en parler.",
  },
};

const sectionsParPage = {
  accueil: ["hero", "bloc-histoire", "bloc-patisseries", "bloc-localisation"],
  patisseries: ["bloc-patisseries"],
  "a-propos": ["bloc-histoire"],
  adresse: ["bloc-localisation"],
  evenements: ["bloc-evenements"],
};

const contenuInitialParType = {
  "bloc-evenements": {
    formats:
      "Boîte de 6 pièces | Pour offrir ou goûter\n" +
      "Boîte de 12 pièces | Pour partager\n" +
      "Boîte de 24 pièces | Pour vos réceptions\n" +
      "Plateau sur mesure | Composé selon vos envies",
  },
};

for (const page of pages) {
  const result = insertPage.run(page.slug, page.title, page.position);
  const pageId = result.lastInsertRowid;

  insertSection.run(
    "bloc-entete",
    0,
    JSON.stringify(enteteParPage[page.slug]),
    pageId,
  );

  sectionsParPage[page.slug].forEach((type, index) => {
    const content = contenuInitialParType[type] || {};
    insertSection.run(type, index + 1, JSON.stringify(content), pageId);
  });
}

console.log("Pages et blocs initiaux créés.");
