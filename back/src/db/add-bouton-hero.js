const db = require("./connection");

const BOUTON_PAR_SLUG = {
  accueil: { texteBouton: "Découvrir nos pâtisseries", lienBouton: "/patisseries" },
  evenements: { texteBouton: "Nous contacter", lienBouton: "/adresse" },
};

const ajouter = db.transaction(() => {
  const resultats = [];

  for (const [slug, bouton] of Object.entries(BOUTON_PAR_SLUG)) {
    const page = db.prepare("SELECT id FROM pages WHERE slug = ?").get(slug);
    if (!page) {
      resultats.push({ slug, modifie: false, raison: "page introuvable" });
      continue;
    }

    const hero = db
      .prepare("SELECT id, content FROM sections WHERE page_id = ? AND type = 'hero'")
      .get(page.id);
    if (!hero) {
      resultats.push({ slug, modifie: false, raison: "aucune section hero" });
      continue;
    }

    const contenu = JSON.parse(hero.content || "{}");
    if (contenu.texteBouton || contenu.lienBouton) {
      resultats.push({ slug, modifie: false, raison: "déjà un bouton configuré" });
      continue;
    }

    const nouveauContenu = { ...contenu, ...bouton };
    db.prepare("UPDATE sections SET content = ? WHERE id = ?").run(
      JSON.stringify(nouveauContenu),
      hero.id,
    );
    resultats.push({ slug, modifie: true });
  }

  return resultats;
});

const resultats = ajouter();
resultats.forEach((r) =>
  console.log(
    r.modifie ? `${r.slug} : bouton ajouté` : `${r.slug} : rien fait (${r.raison})`,
  ),
);
