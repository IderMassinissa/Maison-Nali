const db = require("./connection");

const CONTENU = {
  titre: "Un savoir-faire qui se transmet",
  texte:
    "Chaque recette porte la mémoire d'une génération : les dosages ajustés à la main, les tours de pâte répétés jusqu'à la justesse du geste. C'est cette exigence silencieuse qui fait la différence.",
  photo: "",
  photoAlt: "Détail d'un geste de pâtisserie traditionnelle algérienne",
};

const ajouter = db.transaction(() => {
  const page = db.prepare("SELECT id FROM pages WHERE slug = ?").get("a-propos");
  if (!page) return { ajoute: false, raison: "page a-propos introuvable" };

  const existants = db
    .prepare("SELECT COUNT(*) AS n FROM sections WHERE page_id = ? AND type = 'bloc-histoire'")
    .get(page.id);
  if (existants.n >= 2) return { ajoute: false, raison: "déjà 2 bloc-histoire ou plus" };

  const maxPosition = db
    .prepare("SELECT MAX(position) AS max FROM sections WHERE page_id = ?")
    .get(page.id);
  const position = (maxPosition.max ?? 0) + 1;

  db.prepare(
    "INSERT INTO sections (type, position, content, page_id) VALUES ('bloc-histoire', ?, ?, ?)",
  ).run(position, JSON.stringify(CONTENU), page.id);

  return { ajoute: true };
});

const resultat = ajouter();
console.log(
  resultat.ajoute
    ? "2e bloc-histoire ajouté à la page À propos."
    : `Rien ajouté : ${resultat.raison}`,
);
