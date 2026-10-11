/**
 * Localise la sauvegarde la plus récente produite par backup.js, pour les
 * scripts qui exigent une sauvegarde fraîche (< 1h) avant une écriture
 * risquée (optimize-uploads.js --apply, content-import.js --force). Lit le
 * système de fichiers sous Sauvegardes/ (ou BACKUP_DIR) ; n'écrit rien.
 */
const fs = require("fs");
const path = require("path");

const racineDepot = path.join(__dirname, "../../../");
const DOSSIER_SAUVEGARDES_DEFAUT = path.join(racineDepot, "..", "Sauvegardes");

const UNE_HEURE_MS = 60 * 60 * 1000;

// Les dossiers de sauvegarde sont nommés "YYYY-MM-DD_HHhMM" par backup.js --
// on parse ce nom plutôt que de se fier au mtime du dossier (peu fiable sur
// Windows pour un dossier dont seul le contenu a été copié après coup).
function dateDepuisNomDossier(nom) {
  const m = nom.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})h(\d{2})$/);
  if (!m) return null;
  const [, annee, mois, jour, heure, minute] = m;
  return new Date(Number(annee), Number(mois) - 1, Number(jour), Number(heure), Number(minute));
}

/** @returns {string} racine des sauvegardes (BACKUP_DIR si défini, sinon Sauvegardes/ par défaut). */
function dossierSauvegardes() {
  return process.env.BACKUP_DIR
    ? path.resolve(process.env.BACKUP_DIR)
    : DOSSIER_SAUVEGARDES_DEFAUT;
}

/**
 * @param {string} sousDossier "uploads" ou "data" — le sous-dossier que
 * backup.js crée dans chaque snapshot, utilisé ici comme preuve que ce
 * snapshot couvre bien ce qu'on s'apprête à écraser.
 * @returns {{date: Date, chemin: string} | null} le snapshot le plus
 * récent contenant ce sous-dossier, ou null si aucun n'existe.
 */
function trouverSauvegardeRecente(sousDossier) {
  const racine = dossierSauvegardes();
  if (!fs.existsSync(racine)) return null;

  let meilleure = null;
  for (const nom of fs.readdirSync(racine)) {
    const date = dateDepuisNomDossier(nom);
    if (!date) continue;

    const chemin = path.join(racine, nom, sousDossier);
    if (!fs.existsSync(chemin)) continue;

    if (!meilleure || date > meilleure.date) {
      meilleure = { date, chemin };
    }
  }
  return meilleure;
}

/** @returns {boolean} vrai si la sauvegarde date de moins d'une heure. */
function estRecente(sauvegarde) {
  return !!sauvegarde && Date.now() - sauvegarde.date.getTime() < UNE_HEURE_MS;
}

module.exports = {
  trouverSauvegardeRecente,
  dossierSauvegardes,
  estRecente,
  UNE_HEURE_MS,
};
