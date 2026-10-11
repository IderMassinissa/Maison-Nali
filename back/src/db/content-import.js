/**
 * Importe back/seed/contenu.json (produit par content-export.js) dans la
 * base courante (`npm run content:import`). Pensé pour une base VIDE, juste
 * après `init-db` + `init-admin.js` (il faut au moins un utilisateur, cf.
 * résolution de user_id plus bas).
 *
 * Refuse de tourner si la base contient déjà du contenu, sauf --force, qui
 * exige alors une sauvegarde de back/data/*.sqlite datant de moins d'1h
 * (même garde que optimize-uploads.js --apply) et écrase tout le contenu
 * existant (pages/sections/settings/opening_hours/categories/products/
 * event_photos/announcements), jamais les utilisateurs.
 *
 * Transaction unique : tout ou rien. Chaque section est validée avec les
 * mêmes validateurs que PUT /api/pages/sections/:id/content (et de même
 * pour settings/products/event_photos/opening_hours/announcements, avec
 * leurs validateurs respectifs) — une seule valeur invalide annule tout
 * l'import, rien n'est écrit.
 *
 * Les photos elles-mêmes ne sont pas importées (contenu.json ne contient
 * que des chemins) : une fois l'import terminé, les chemins référencés
 * mais absents de back/public/uploads sont listés en fin d'exécution.
 */
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

class FichierEntreeIntrouvableError extends Error {}
class BaseNonVideError extends Error {
  constructor(message, comptes) {
    super(message);
    this.comptes = comptes;
  }
}
class SauvegardeInsuffisanteError extends Error {}

/**
 * Logique complète de l'import, sans aucun console.log/process.exit —
 * testable directement. Lève une erreur typée à chaque refus, ne modifie
 * la base que si tout est validé (transaction unique, annulée
 * automatiquement par better-sqlite3 si ContenuInvalideError remonte
 * depuis l'intérieur).
 * @param {{cheminEntree?: string, forcer?: boolean}} options
 * @returns {{comptes: object, manquants: string[], sauvegardeUtilisee: object|null}}
 * @throws {FichierEntreeIntrouvableError|BaseNonVideError|SauvegardeInsuffisanteError|ContenuInvalideError}
 */
function importerDepuisFichier({ cheminEntree = CHEMIN_ENTREE, forcer = false } = {}) {
  if (!fs.existsSync(cheminEntree)) {
    throw new FichierEntreeIntrouvableError(
      `${cheminEntree} introuvable. Lance d'abord npm run content:export sur une base qui a du contenu, ou récupère back/seed/contenu.json versionné dans le dépôt.`,
    );
  }

  const { vide, comptes } = etatBase();
  let sauvegardeUtilisee = null;

  if (!vide) {
    if (!forcer) {
      const nonVides = TABLES_CONTENU.filter((t) => comptes[t] > 0).map(
        (t) => `${t} (${comptes[t]})`,
      );
      throw new BaseNonVideError(
        `la base contient déjà du contenu : ${nonVides.join(", ")}. Relance sur une base vide (après npm run init-db), ou avec --force si tu sais ce que tu fais.`,
        comptes,
      );
    }

    const sauvegarde = trouverSauvegardeRecente("data");
    if (!estRecente(sauvegarde)) {
      throw new SauvegardeInsuffisanteError(
        `--force refusé sans sauvegarde de back/data/*.sqlite datant de moins d'1h dans ${dossierSauvegardes()}. Lance \`npm run backup\` puis réessaie.`,
      );
    }
    sauvegardeUtilisee = sauvegarde;
  }

  const contenu = JSON.parse(fs.readFileSync(cheminEntree, "utf8"));

  const transaction = db.transaction(() => {
    if (!vide) viderTablesContenu();
    importerContenu(contenu);
  });
  transaction();

  return {
    comptes: etatBase().comptes,
    manquants: rapportFichiersManquants(),
    sauvegardeUtilisee,
  };
}

function main() {
  let resultat;
  try {
    resultat = importerDepuisFichier({ forcer: FORCER });
  } catch (err) {
    if (
      err instanceof FichierEntreeIntrouvableError ||
      err instanceof BaseNonVideError ||
      err instanceof SauvegardeInsuffisanteError
    ) {
      echouer(err.message);
    }
    if (err instanceof ContenuInvalideError) {
      echouer(`contenu invalide, import annulé (rien n'a été écrit) -- ${err.message}`);
    }
    throw err;
  }

  if (resultat.sauvegardeUtilisee) {
    const minutes = (
      (Date.now() - resultat.sauvegardeUtilisee.date.getTime()) /
      60000
    ).toFixed(0);
    console.log(
      `--force : sauvegarde récente trouvée (${resultat.sauvegardeUtilisee.chemin}, il y a ${minutes} min) -- le contenu existant a été remplacé.`,
    );
  }

  console.log("Import terminé :");
  for (const t of TABLES_CONTENU) {
    console.log(`  ${t} : ${resultat.comptes[t]}`);
  }

  if (resultat.manquants.length > 0) {
    console.log("");
    console.log(
      "Fichiers référencés manquants dans back/public/uploads -- le front bascule sur le" +
        " placeholder visuel pour ces entrées (ImageAvecRepli), à remplacer en réuploadant la" +
        " vraie photo via l'admin :",
    );
    for (const f of resultat.manquants) console.log(`  ${f}`);
  } else {
    console.log("Aucun fichier référencé manquant.");
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  importerDepuisFichier,
  etatBase,
  ContenuInvalideError,
  FichierEntreeIntrouvableError,
  BaseNonVideError,
  SauvegardeInsuffisanteError,
  TABLES_CONTENU,
  CHEMIN_ENTREE,
};
