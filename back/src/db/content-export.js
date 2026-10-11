/**
 * Exporte le contenu éditorial complet de la base dans back/seed/contenu.json
 * (`npm run content:export`) — pages, sections (content JSON, parsé pour
 * rester lisible dans le fichier), settings, opening_hours, categories,
 * products, event_photos, announcements. Jamais users, jamais sessions,
 * jamais de mot de passe. Lit uniquement la base ; n'écrit que ce fichier
 * JSON, jamais la base elle-même. Voir content-import.js pour la procédure
 * de remise en place inverse.
 *
 * JSON indenté, chaque tableau trié par id : un diff git sur ce fichier ne
 * doit montrer que ce qui a réellement changé, pas un réordonnancement.
 */
const fs = require("fs");
const path = require("path");
const db = require("./connection");

const CHEMIN_SORTIE = path.join(__dirname, "../../seed/contenu.json");

function parCroissant(a, b) {
  return a.id - b.id;
}

function exporterPages() {
  const pages = db.prepare("SELECT * FROM pages ORDER BY id").all();
  const sectionsParPage = db
    .prepare("SELECT * FROM sections ORDER BY id")
    .all();

  return pages.sort(parCroissant).map((page) => ({
    id: page.id,
    slug: page.slug,
    title: page.title,
    position: page.position,
    sections: sectionsParPage
      .filter((s) => s.page_id === page.id)
      .sort(parCroissant)
      .map((s) => ({
        id: s.id,
        type: s.type,
        position: s.position,
        // Parsé plutôt que gardé en chaîne brute : un JSON imbriqué lisible
        // et diffable, pas un blob de guillemets échappés.
        content: s.content ? JSON.parse(s.content) : {},
      })),
  }));
}

function exporterTable(nom, colonnes) {
  const lignes = db.prepare(`SELECT ${colonnes.join(", ")} FROM ${nom}`).all();
  return lignes.sort(parCroissant);
}

/**
 * Construit l'objet exporté en lisant la base, sans toucher au disque —
 * utilisé tel quel par les tests (round-trip export/import) et par main()
 * ci-dessous (écriture réelle du fichier JSON).
 * @returns {object} contenu éditorial complet, prêt pour JSON.stringify.
 */
function exporterContenu() {
  return {
    exportedAt: new Date().toISOString(),
    pages: exporterPages(),
    settings: exporterTable("settings", ["id", "key", "value"]),
    opening_hours: exporterTable("opening_hours", [
      "id",
      "day",
      "open_time",
      "close_time",
    ]),
    categories: exporterTable("categories", ["id", "name"]),
    products: exporterTable("products", [
      "id",
      "name",
      "description",
      "photo_url",
      "video_url",
      "category_id",
      "focus_x",
      "focus_y",
      "position",
    ]),
    event_photos: exporterTable("event_photos", [
      "id",
      "image_url",
      "alt",
      "position",
    ]),
    announcements: exporterTable("announcements", [
      "id",
      "message",
      "active",
      "start_date",
      "end_date",
    ]),
  };
}

function main() {
  const contenu = exporterContenu();

  fs.mkdirSync(path.dirname(CHEMIN_SORTIE), { recursive: true });
  fs.writeFileSync(CHEMIN_SORTIE, JSON.stringify(contenu, null, 2) + "\n");

  console.log(`Export écrit : ${CHEMIN_SORTIE}`);
  console.log(
    `  ${contenu.pages.length} page(s), ` +
      `${contenu.pages.reduce((n, p) => n + p.sections.length, 0)} section(s), ` +
      `${contenu.settings.length} réglage(s), ` +
      `${contenu.opening_hours.length} horaire(s), ` +
      `${contenu.categories.length} catégorie(s), ` +
      `${contenu.products.length} produit(s), ` +
      `${contenu.event_photos.length} photo(s) événement, ` +
      `${contenu.announcements.length} annonce(s).`,
  );
}

if (require.main === module) {
  main();
}

module.exports = { exporterContenu, CHEMIN_SORTIE };
