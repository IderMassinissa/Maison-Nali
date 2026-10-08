// DETTE TECHNIQUE — NE PAS SUPPRIMER TANT QUE LA PHOTO N'EST PAS REMPLACEE.
//
// Contexte : bloc-localisation de l'Accueil (section id 5) n'avait aucune photo
// en base -> placeholder visuel affiche en attendant (voir PlaceholderPhoto.jsx).
// On a cherche une vraie photo de facade complete et degagee dans
// front/public/photos-a-trier/, il n'y en a aucune — uniquement des plans serres
// sur l'enseigne. IMG_9873.JPG (enseigne en contre-plongee) est utilisee ici en
// bouche-trou le temps d'avoir une meilleure photo, pas la bonne image a terme.
//
// A faire des qu'une vraie photo de facade existe : uploader la nouvelle photo
// via l'admin (Accueil > bloc Localisation > Photo), ce qui ecrasera la valeur
// posee ici. Supprimer ce fichier une fois fait.

const db = require("./connection");

const FICHIER_TEMP = "/uploads/1791492981454-accueil-boutique-temp.jpg";
const PATCH = { photo: FICHIER_TEMP, focusX: 38, focusY: 60 };

const appliquer = db.transaction(() => {
  const page = db.prepare("SELECT id FROM pages WHERE slug = ?").get("accueil");
  if (!page) return { ok: false, raison: "page accueil introuvable" };

  const section = db
    .prepare(
      "SELECT id, content FROM sections WHERE page_id = ? AND type = 'bloc-localisation'",
    )
    .get(page.id);
  if (!section) return { ok: false, raison: "bloc-localisation introuvable" };

  const contenuActuel = JSON.parse(section.content || "{}");
  const contenuFusionne = { ...contenuActuel, ...PATCH };
  db.prepare("UPDATE sections SET content = ? WHERE id = ?").run(
    JSON.stringify(contenuFusionne),
    section.id,
  );

  return { ok: true, contenu: contenuFusionne };
});

const resultat = appliquer();
if (resultat.ok) {
  console.log("Photo bouche-trou posee sur Accueil / bloc-localisation :");
  console.log(JSON.stringify(resultat.contenu, null, 2));
} else {
  console.log(`Rien applique : ${resultat.raison}`);
}
