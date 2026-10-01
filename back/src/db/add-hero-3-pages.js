const db = require("./connection");

const HERO_PAR_SLUG = {
  patisseries: { titre: "Un héritage façonné à la main", photo: "" },
  "a-propos": { titre: "Trois générations de passion", photo: "" },
  evenements: { titre: "Des douceurs pour vos grands moments", photo: "" },
};

const ajouter = db.transaction(() => {
  const resultats = [];

  for (const [slug, contenu] of Object.entries(HERO_PAR_SLUG)) {
    const page = db.prepare("SELECT id FROM pages WHERE slug = ?").get(slug);
    if (!page) {
      resultats.push({ slug, ajoute: false, raison: "page introuvable" });
      continue;
    }

    const dejaPresent = db
      .prepare("SELECT id FROM sections WHERE page_id = ? AND type = 'hero'")
      .get(page.id);
    if (dejaPresent) {
      resultats.push({ slug, ajoute: false, raison: "hero déjà présent" });
      continue;
    }

    db.prepare(
      "UPDATE sections SET position = position + 1 WHERE page_id = ?",
    ).run(page.id);

    db.prepare(
      "INSERT INTO sections (type, position, content, page_id) VALUES ('hero', 0, ?, ?)",
    ).run(JSON.stringify(contenu), page.id);

    resultats.push({ slug, ajoute: true });
  }

  const accueil = db.prepare("SELECT id FROM pages WHERE slug = 'accueil'").get();
  let accueilNormalise = false;
  if (accueil) {
    const heroAccueil = db
      .prepare("SELECT id, position FROM sections WHERE page_id = ? AND type = 'hero'")
      .get(accueil.id);
    const enteteAccueil = db
      .prepare("SELECT id, position FROM sections WHERE page_id = ? AND type = 'bloc-entete'")
      .get(accueil.id);
    if (heroAccueil && enteteAccueil && heroAccueil.position !== 0) {
      db.prepare("UPDATE sections SET position = 0 WHERE id = ?").run(heroAccueil.id);
      db.prepare("UPDATE sections SET position = 1 WHERE id = ?").run(enteteAccueil.id);
      accueilNormalise = true;
    }
  }

  return { resultats, accueilNormalise };
});

const { resultats, accueilNormalise } = ajouter();
resultats.forEach((r) =>
  console.log(
    r.ajoute
      ? `hero ajouté à ${r.slug}`
      : `${r.slug} : rien ajouté (${r.raison})`,
  ),
);
console.log(
  accueilNormalise
    ? "accueil : positions normalisées (hero=0, bloc-entete=1)"
    : "accueil : positions déjà normalisées ou page introuvable",
);
