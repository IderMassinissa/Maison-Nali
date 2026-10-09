// Script a relire avant execution -- ne pas lancer sans validation.
//
// Contexte : la section bloc-histoire de la page "a-propos" (id 46) a un
// champ content.photo = "/images/atelier-2.jpg", un fichier qui n'existe
// pas dans front/public/images (migration add-bloc-histoire-2-apropos.js
// l'avait renseigne, sans que la photo correspondante soit jamais livree).
// Resultat : image cassee visible sur /a-propos.
//
// Ce script vide photo et photoAlt sur cette section precise, pour que
// BlocHistoire retombe sur son PlaceholderPhoto (dégradé vert + motif or)
// en attendant une vraie photo d'atelier. Les autres champs (titre, texte)
// ne sont pas touches.
//
// Usage (depuis back/) : node src/db/fix-photo-manquante-atelier-apropos.js

const db = require("./connection");

const ID_SECTION = 46;

const section = db
  .prepare("SELECT id, type, content FROM sections WHERE id = ?")
  .get(ID_SECTION);

if (!section) {
  console.log(`Section ${ID_SECTION} introuvable, rien a faire.`);
  process.exit(0);
}

if (section.type !== "bloc-histoire") {
  console.log(
    `Section ${ID_SECTION} n'est pas un bloc-histoire (type=${section.type}), script arrete par securite.`,
  );
  process.exit(1);
}

const contenu = JSON.parse(section.content || "{}");

if (contenu.photo !== "/images/atelier-2.jpg") {
  console.log(
    `Section ${ID_SECTION} : content.photo n'est plus "/images/atelier-2.jpg" (valeur actuelle : ${JSON.stringify(contenu.photo)}). Rien fait, la situation a deja change.`,
  );
  process.exit(0);
}

const nouveauContenu = { ...contenu, photo: "", photoAlt: "" };

db.prepare("UPDATE sections SET content = ? WHERE id = ?").run(
  JSON.stringify(nouveauContenu),
  ID_SECTION,
);

console.log(
  `Section ${ID_SECTION} mise a jour : photo et photoAlt vides (placeholder affiche en attendant une vraie photo).`,
);
