// Importe back/seed/contenu.json (produit par content-export.js) dans la
// base courante. Pensé pour une base VIDE, juste après `npm run init-db` +
// `node src/db/init-admin.js` (il faut au moins un utilisateur, cf.
// résolution de user_id plus bas).
//
// Refuse de tourner si la base contient déjà du contenu, sauf --force --
// qui exige alors une sauvegarde de back/data/*.sqlite datant de moins
// d'1h dans Code/Sauvegardes (même garde que optimize-uploads.js --apply).
// --force écrase tout le contenu existant (pages/sections/settings/
// opening_hours/categories/products/event_photos/announcements), jamais
// les utilisateurs.
//
// Transaction unique : tout ou rien. Chaque section est validée avec les
// mêmes validateurs que PUT /api/pages/sections/:id/content (et de même
// pour settings/products/event_photos/opening_hours/announcements, avec
// leurs validateurs respectifs) -- une seule valeur invalide annule tout
// l'import, rien n'est écrit.
//
// Les photos elles-mêmes ne sont pas importées (back/seed/contenu.json ne
// contient que des chemins) : une fois l'import terminé, les chemins
// référencés mais absents de back/public/uploads sont listés en fin
// d'exécution ("fichiers référencés manquants").
//
// Usage (depuis back/) :
//   node src/db/content-import.js            (refuse si la base n'est pas vide)
//   node src/db/content-import.js --force     (écrase, sauvegarde < 1h requise)

const fs = require("fs");
const path = require("path");
const db = require("./connection");
const { trouverSauvegardeRecente, dossierSauvegardes, estRecente } = require("./sauvegardeRecente");
const { trouverFichiersReferences } = require("./fichiersReferences");
const { validateSectionContent } = require("../utils/validateSectionContent");
const { validateSettingValue } = require("../utils/validateSettingValue");
const { validatePhotoInterne } = require("../utils/validatePhotoInterne");
const { validateLienBouton } = require("../utils/validateLienBouton");
const { validateEventPhoto } = require("../utils/validateEventPhoto");
const { validateOpeningHours } = require("../utils/validateOpeningHours");
const { validateBannerDates } = require("../utils/validateBannerDates");

const FORCER = process.argv.includes("--force");
const CHEMIN_ENTREE = path.join(__dirname, "../../seed/contenu.json");
const DOSSIER_UPLOADS = path.join(__dirname, "../../public/uploads");

// Ordre important : tables enfants avant tables parentes pour le DELETE
// (sections -> pages, products -> categories), l'inverse pour l'INSERT.
const TABLES_CONTENU = [
  "pages",
  "sections",
  "settings",
  "opening_hours",
  "categories",
  "products",
  "event_photos",
  "announcements",
];

class ContenuInvalideError extends Error {}

function compterLignes(table) {
  return db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
}

function etatBase() {
  const comptes = {};
  for (const t of TABLES_CONTENU) comptes[t] = compterLignes(t);
  const vide = Object.values(comptes).every((n) => n === 0);
  return { vide, comptes };
}

function echouer(message) {
  console.error(`Échec : ${message}`);
  process.exit(1);
}

// Vide les tables de contenu (pas users, pas sessions), dans un ordre qui
// respecte les clés étrangères (enfant avant parent).
function viderTablesContenu() {
  db.prepare("DELETE FROM sections").run();
  db.prepare("DELETE FROM pages").run();
  db.prepare("DELETE FROM products").run();
  db.prepare("DELETE FROM categories").run();
  db.prepare("DELETE FROM opening_hours").run();
  db.prepare("DELETE FROM settings").run();
  db.prepare("DELETE FROM event_photos").run();
  db.prepare("DELETE FROM announcements").run();
}

function importerContenu(contenu) {
  const utilisateur = db.prepare("SELECT id FROM users ORDER BY id LIMIT 1").get();
  if (!utilisateur) {
    throw new ContenuInvalideError(
      "Aucun utilisateur en base -- lance node src/db/init-admin.js <email> <mot-de-passe> avant content:import.",
    );
  }

  const insertPage = db.prepare(
    "INSERT INTO pages (id, slug, title, position, user_id) VALUES (?, ?, ?, ?, ?)",
  );
  const insertSection = db.prepare(
    "INSERT INTO sections (id, type, position, content, page_id) VALUES (?, ?, ?, ?, ?)",
  );
  const insertSetting = db.prepare(
    "INSERT INTO settings (id, key, value) VALUES (?, ?, ?)",
  );
  const insertHoraire = db.prepare(
    "INSERT INTO opening_hours (id, day, open_time, close_time) VALUES (?, ?, ?, ?)",
  );
  const insertCategorie = db.prepare("INSERT INTO categories (id, name) VALUES (?, ?)");
  const insertProduit = db.prepare(
    "INSERT INTO products (id, name, description, photo_url, video_url, category_id, focus_x, focus_y, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertPhotoEvenement = db.prepare(
    "INSERT INTO event_photos (id, image_url, alt, position) VALUES (?, ?, ?, ?)",
  );
  const insertAnnonce = db.prepare(
    "INSERT INTO announcements (id, message, active, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
  );

  for (const page of contenu.pages || []) {
    insertPage.run(page.id, page.slug, page.title, page.position, utilisateur.id);

    for (const section of page.sections || []) {
      const validation = validateSectionContent(section.type, section.content);
      if (!validation.valid) {
        throw new ContenuInvalideError(
          `page "${page.slug}", section #${section.id} (${section.type}) : ${validation.error}`,
        );
      }
      insertSection.run(
        section.id,
        section.type,
        section.position,
        JSON.stringify(section.content || {}),
        page.id,
      );
    }
  }

  for (const reglage of contenu.settings || []) {
    const validation = validateSettingValue(reglage.key, reglage.value);
    if (!validation.valid) {
      throw new ContenuInvalideError(`réglage "${reglage.key}" : ${validation.error}`);
    }
    insertSetting.run(reglage.id, reglage.key, reglage.value);
  }

  for (const horaire of contenu.opening_hours || []) {
    const validation = validateOpeningHours(horaire.open_time, horaire.close_time);
    if (!validation.valid) {
      throw new ContenuInvalideError(`horaire "${horaire.day}" : ${validation.error}`);
    }
    insertHoraire.run(horaire.id, horaire.day, validation.openTime, validation.closeTime);
  }

  for (const categorie of contenu.categories || []) {
    if (!categorie.name) {
      throw new ContenuInvalideError(`catégorie #${categorie.id} : le nom est requis`);
    }
    insertCategorie.run(categorie.id, categorie.name);
  }

  for (const produit of contenu.products || []) {
    if (!produit.name) {
      throw new ContenuInvalideError(`produit #${produit.id} : le nom est requis`);
    }
    const validationPhoto = validatePhotoInterne(produit.photo_url);
    if (!validationPhoto.valid) {
      throw new ContenuInvalideError(`produit "${produit.name}" : ${validationPhoto.error}`);
    }
    const validationVideo = validateLienBouton(produit.video_url);
    if (!validationVideo.valid) {
      throw new ContenuInvalideError(`produit "${produit.name}" : ${validationVideo.error}`);
    }
    insertProduit.run(
      produit.id,
      produit.name,
      produit.description,
      produit.photo_url,
      produit.video_url,
      produit.category_id,
      produit.focus_x ?? 50,
      produit.focus_y ?? 50,
      produit.position ?? 0,
    );
  }

  for (const photo of contenu.event_photos || []) {
    const validation = validateEventPhoto({
      imageUrl: photo.image_url,
      alt: photo.alt,
      position: photo.position,
    });
    if (!validation.valid) {
      throw new ContenuInvalideError(`photo événement #${photo.id} : ${validation.error}`);
    }
    insertPhotoEvenement.run(photo.id, photo.image_url, photo.alt, photo.position);
  }

  for (const annonce of contenu.announcements || []) {
    const validation = validateBannerDates(annonce.start_date, annonce.end_date);
    if (!validation.valid) {
      throw new ContenuInvalideError(`annonce #${annonce.id} : ${validation.error}`);
    }
    insertAnnonce.run(
      annonce.id,
      annonce.message,
      annonce.active,
      validation.startDate,
      validation.endDate,
    );
  }
}

function rapportFichiersManquants() {
  const references = trouverFichiersReferences();
  const surDisque = fs.existsSync(DOSSIER_UPLOADS)
    ? new Set(fs.readdirSync(DOSSIER_UPLOADS))
    : new Set();

  const manquants = [...references].filter((f) => !surDisque.has(f)).sort();
  return manquants;
}

function main() {
  if (!fs.existsSync(CHEMIN_ENTREE)) {
    echouer(
      `${CHEMIN_ENTREE} introuvable. Lance d'abord npm run content:export sur une base qui a du contenu, ou récupère back/seed/contenu.json versionné dans le dépôt.`,
    );
  }

  const { vide, comptes } = etatBase();

  if (!vide) {
    if (!FORCER) {
      const nonVides = TABLES_CONTENU.filter((t) => comptes[t] > 0).map(
        (t) => `${t} (${comptes[t]})`,
      );
      echouer(
        `la base contient déjà du contenu : ${nonVides.join(", ")}. Relance sur une base vide (après npm run init-db), ou avec --force si tu sais ce que tu fais.`,
      );
    }

    const sauvegarde = trouverSauvegardeRecente("data");
    if (!estRecente(sauvegarde)) {
      echouer(
        `--force refusé sans sauvegarde de back/data/*.sqlite datant de moins d'1h dans ${dossierSauvegardes()}. Lance \`npm run backup\` puis réessaie.`,
      );
    }
    console.log(
      `--force : sauvegarde récente trouvée (${sauvegarde.chemin}, il y a ${((Date.now() - sauvegarde.date.getTime()) / 60000).toFixed(0)} min) -- le contenu existant va être remplacé.`,
    );
  }

  const contenu = JSON.parse(fs.readFileSync(CHEMIN_ENTREE, "utf8"));

  const transaction = db.transaction(() => {
    if (!vide) viderTablesContenu();
    importerContenu(contenu);
  });

  try {
    transaction();
  } catch (err) {
    if (err instanceof ContenuInvalideError) {
      echouer(`contenu invalide, import annulé (rien n'a été écrit) -- ${err.message}`);
    }
    throw err;
  }

  const { comptes: comptesApres } = etatBase();
  console.log("Import terminé :");
  for (const t of TABLES_CONTENU) {
    console.log(`  ${t} : ${comptesApres[t]}`);
  }

  const manquants = rapportFichiersManquants();
  if (manquants.length > 0) {
    console.log("");
    console.log(
      "Fichiers référencés manquants dans back/public/uploads -- affichage cassé (image brisée) tant" +
        " qu'une photo n'est pas réuploadée via l'admin pour ces entrées (le front n'a pas de repli" +
        " automatique vers le placeholder visuel sur une image qui échoue à charger, seulement sur une" +
        " valeur de photo vide) :",
    );
    for (const f of manquants) console.log(`  ${f}`);
  } else {
    console.log("Aucun fichier référencé manquant.");
  }
}

main();
