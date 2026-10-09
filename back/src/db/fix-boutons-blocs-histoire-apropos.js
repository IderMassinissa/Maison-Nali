// Script a relire avant execution -- ne pas lancer sans validation.
//
// Contexte : les deux bloc-histoire de la page "a-propos" (sections 12 et 46)
// n'ont pas de bouton configure (ni texteBouton, ni lienBouton). Avec le
// nouveau mecanisme (lienBouton par defaut = "/a-propos" dans BlocHistoire),
// ils afficheraient sinon un bouton qui renvoie vers la page elle-meme.
//
// Ce script donne a chacun un lien utile :
// - section 12 -> "Decouvrir nos patisseries" / "/patisseries"
// - section 46 -> "Nous rendre visite" / "/adresse"
// Les autres champs (titre, texte, photo, photoAlt) ne sont pas touches.
//
// Usage (depuis back/) : node src/db/fix-boutons-blocs-histoire-apropos.js

const db = require("./connection");

const MISES_A_JOUR = {
  12: { texteBouton: "Découvrir nos pâtisseries", lienBouton: "/patisseries" },
  46: { texteBouton: "Nous rendre visite", lienBouton: "/adresse" },
};

for (const [id, ajout] of Object.entries(MISES_A_JOUR)) {
  const section = db
    .prepare("SELECT id, type, content FROM sections WHERE id = ?")
    .get(Number(id));

  if (!section) {
    console.log(`Section ${id} introuvable, rien fait.`);
    continue;
  }

  if (section.type !== "bloc-histoire") {
    console.log(
      `Section ${id} n'est pas un bloc-histoire (type=${section.type}), ignorée par sécurité.`,
    );
    continue;
  }

  const contenu = JSON.parse(section.content || "{}");

  if (contenu.texteBouton || contenu.lienBouton) {
    console.log(
      `Section ${id} a déjà un texteBouton/lienBouton (${JSON.stringify({ texteBouton: contenu.texteBouton, lienBouton: contenu.lienBouton })}). Rien fait, pour ne pas écraser une saisie existante.`,
    );
    continue;
  }

  const nouveauContenu = { ...contenu, ...ajout };

  db.prepare("UPDATE sections SET content = ? WHERE id = ?").run(
    JSON.stringify(nouveauContenu),
    Number(id),
  );

  console.log(`Section ${id} mise à jour :`, ajout);
}
