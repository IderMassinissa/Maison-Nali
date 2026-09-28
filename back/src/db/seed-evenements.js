const db = require("./connection");
const { getPageBySlug } = require("../repositories/pages");

const SLUG = "evenements";

const CONTENU_INITIAL = {
  titre: "Vos événements sur mesure",
  intro:
    "Mariages, fêtes de famille, Ramadan, cadeaux : Maison Nali prépare des assortiments de pâtisseries algériennes pour vos grands moments. Chaque demande fait l'objet d'un devis personnalisé. Contactez-nous pour en parler.",
  formats: [
    "Boîte de 6 pièces",
    "Boîte de 12 pièces",
    "Boîte de 24 pièces",
    "Plateau sur mesure",
  ].join("\n"),
};

// user_id = 1, l'admin créé via seed-admin.js — même convention que seed-pages.js
if (getPageBySlug(SLUG)) {
  console.log("Page 'evenements' déjà présente, rien à faire.");
} else {
  const maxPosition = db.prepare("SELECT MAX(position) as max FROM pages").get();
  const nouvellePosition = (maxPosition.max || 0) + 1;

  const resultatPage = db
    .prepare(
      "INSERT INTO pages (slug, title, position, user_id) VALUES (?, ?, ?, 1)",
    )
    .run(SLUG, "Événements", nouvellePosition);

  db.prepare(
    "INSERT INTO sections (type, position, content, page_id) VALUES (?, ?, ?, ?)",
  ).run(
    "bloc-evenements",
    1,
    JSON.stringify(CONTENU_INITIAL),
    resultatPage.lastInsertRowid,
  );

  console.log(
    `Page 'evenements' créée en position ${nouvellePosition}, section 'bloc-evenements' créée.`,
  );
}
