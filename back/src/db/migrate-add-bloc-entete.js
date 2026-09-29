const db = require("./connection");

const CONTENU_PAR_PAGE = {
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

const HERO_TITRE_TEST = "Le titre principal de test";
const HERO_TITRE_REEL = "L'ART DU MIEL ET DE LA FLEUR D'ORANGER";
const HERO_SOUS_TITRE_REEL =
  "Pâtisseries dorées, façonnées à la main pour sublimer vos plus belles occasions.";

const ajouterBlocEntete = db.transaction(() => {
  let pagesTraitees = 0;
  let heroCorrige = false;
  let evenementsAllege = false;

  const pages = db.prepare("SELECT * FROM pages").all();

  for (const page of pages) {
    const contenu = CONTENU_PAR_PAGE[page.slug];
    if (!contenu) continue;

    const dejaPresent = db
      .prepare(
        "SELECT id FROM sections WHERE page_id = ? AND type = 'bloc-entete'",
      )
      .get(page.id);
    if (dejaPresent) continue;

    db.prepare(
      "UPDATE sections SET position = position + 1 WHERE page_id = ?",
    ).run(page.id);

    db.prepare(
      "INSERT INTO sections (type, position, content, page_id) VALUES ('bloc-entete', 0, ?, ?)",
    ).run(JSON.stringify(contenu), page.id);

    pagesTraitees += 1;
  }

  const heroAccueil = db
    .prepare("SELECT * FROM sections WHERE page_id = 1 AND type = 'hero'")
    .get();
  if (heroAccueil) {
    const contenuHero = JSON.parse(heroAccueil.content || "{}");
    if (contenuHero.titre === HERO_TITRE_TEST) {
      contenuHero.titre = HERO_TITRE_REEL;
      contenuHero.sousTitre = HERO_SOUS_TITRE_REEL;
      db.prepare("UPDATE sections SET content = ? WHERE id = ?").run(
        JSON.stringify(contenuHero),
        heroAccueil.id,
      );
      heroCorrige = true;
    }
  }

  const blocEvenements = db
    .prepare("SELECT * FROM sections WHERE type = 'bloc-evenements'")
    .get();
  if (blocEvenements) {
    const contenuEvenements = JSON.parse(blocEvenements.content || "{}");
    if ("titre" in contenuEvenements || "intro" in contenuEvenements) {
      const { formats = "" } = contenuEvenements;
      db.prepare("UPDATE sections SET content = ? WHERE id = ?").run(
        JSON.stringify({ formats }),
        blocEvenements.id,
      );
      evenementsAllege = true;
    }
  }

  return { pagesTraitees, heroCorrige, evenementsAllege };
});

const resultat = ajouterBlocEntete();
console.log(
  `Migration terminée : ${resultat.pagesTraitees} page(s) ont reçu un bloc-entete. ` +
    `Hero accueil corrigé : ${resultat.heroCorrige}. ` +
    `bloc-evenements allégé (titre/intro retirés) : ${resultat.evenementsAllege}.`,
);
