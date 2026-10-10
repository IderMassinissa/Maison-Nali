// Applique le même pipeline d'optimisation que l'upload (cf.
// src/utils/optimiserImage.js) aux fichiers déjà présents dans
// back/public/uploads, EN PLACE : même nom, même extension -- les
// références en base (photo, photoUrl, focusX/focusY...) ne changent pas.
//
// Deux exclusions avant tout traitement :
// - fichiers non référencés en base (orphelins) : jamais touchés, listés à
//   part -- un script d'optimisation n'est pas l'endroit pour décider si un
//   fichier orphelin doit être supprimé, ça reste une décision manuelle.
// - gain de poids < 15% : pas assez pour justifier de réécrire le fichier
//   (risque de perte qualité pour un gain marginal) -- laissé tel quel.
//
// Dry-run par défaut (aucune écriture) : affiche un tableau poids/dimensions
// avant-après par fichier. N'écrit sur disque qu'avec --apply, et refuse de
// le faire sans sauvegarde récente (< 1h) de back/public/uploads dans
// Code/Sauvegardes (cf. src/db/backup.js) -- cette garde ne s'applique pas
// au dry-run, qui ne modifie rien.
//
// Usage :
//   node src/db/optimize-uploads.js            (dry-run, rien n'est écrit)
//   node src/db/optimize-uploads.js --apply     (écrit, après vérif sauvegarde)

const fs = require("fs");
const path = require("path");
const { optimiserImage, ImageTropLourdeError } = require("../utils/optimiserImage");
const { detecterTypeImage } = require("../utils/detecterTypeImage");
const db = require("./connection");
const { trouverSauvegardeRecente, dossierSauvegardes, estRecente } = require("./sauvegardeRecente");
const { trouverFichiersReferences } = require("./fichiersReferences");

const APPLIQUER = process.argv.includes("--apply");

const DOSSIER_UPLOADS = path.join(__dirname, "../../public/uploads");

const GAIN_MIN_POURCENT = 15;

function formatKio(octets) {
  return (octets / 1024).toFixed(1) + " Kio";
}

async function main() {
  const sauvegarde = trouverSauvegardeRecente("uploads");
  const ageMs = sauvegarde ? Date.now() - sauvegarde.date.getTime() : null;

  console.log(
    sauvegarde
      ? `Dernière sauvegarde des uploads trouvée : ${sauvegarde.chemin} (il y a ${(ageMs / 60000).toFixed(0)} min)`
      : "Aucune sauvegarde des uploads trouvée dans " + dossierSauvegardes(),
  );

  if (APPLIQUER && !estRecente(sauvegarde)) {
    console.error(
      "Échec : --apply refusé sans sauvegarde de back/public/uploads datant de moins d'1h dans " +
        dossierSauvegardes() +
        ". Lance `npm run backup` puis réessaie.",
    );
    process.exit(1);
  }

  const references = trouverFichiersReferences();

  const fichiers = fs
    .readdirSync(DOSSIER_UPLOADS)
    .filter((nom) => fs.statSync(path.join(DOSSIER_UPLOADS, nom)).isFile());

  const lignes = [];
  const orphelines = [];
  const gainsFaibles = [];
  let totalAvant = 0;
  let totalApres = 0;
  let ignores = 0;

  for (const nom of fichiers) {
    const cheminFichier = path.join(DOSSIER_UPLOADS, nom);
    const original = fs.readFileSync(cheminFichier);
    const typeReel = detecterTypeImage(original);

    if (!typeReel) {
      console.warn(`Ignoré (pas une image JPEG/PNG/WebP reconnue) : ${nom}`);
      ignores++;
      continue;
    }

    if (!references.has(nom)) {
      orphelines.push(nom);
      continue;
    }

    let resultat;
    try {
      resultat = await optimiserImage(original, typeReel);
    } catch (err) {
      if (err instanceof ImageTropLourdeError) {
        console.warn(`Ignoré (${err.message}) : ${nom}`);
        ignores++;
        continue;
      }
      throw err;
    }

    const gainPourcent = 100 - (resultat.buffer.length / original.length) * 100;

    if (gainPourcent < GAIN_MIN_POURCENT) {
      gainsFaibles.push({ fichier: nom, gainPourcent });
      continue;
    }

    totalAvant += original.length;
    totalApres += resultat.buffer.length;

    lignes.push({
      fichier: nom,
      poidsAvant: original.length,
      poidsApres: resultat.buffer.length,
      dimAvant: `${resultat.largeurAvant}x${resultat.hauteurAvant}`,
      dimApres: `${resultat.largeurApres}x${resultat.hauteurApres}`,
    });

    if (APPLIQUER) {
      fs.writeFileSync(cheminFichier, resultat.buffer);
    }
  }

  console.log("");
  console.log(
    "Fichier".padEnd(45) +
      "Poids avant".padStart(14) +
      "Poids après".padStart(14) +
      "Dimensions avant".padStart(20) +
      "Dimensions après".padStart(20),
  );
  for (const l of lignes) {
    console.log(
      l.fichier.padEnd(45) +
        formatKio(l.poidsAvant).padStart(14) +
        formatKio(l.poidsApres).padStart(14) +
        l.dimAvant.padStart(20) +
        l.dimApres.padStart(20),
    );
  }

  if (gainsFaibles.length > 0) {
    console.log("");
    console.log(`Ignoré, gain faible (< ${GAIN_MIN_POURCENT}%) :`);
    for (const g of gainsFaibles) {
      console.log(`  ${g.fichier} (${g.gainPourcent.toFixed(1)}%)`);
    }
  }

  if (orphelines.length > 0) {
    console.log("");
    console.log("Orphelines (non référencées en base, jamais modifiées) :");
    for (const nom of orphelines) {
      console.log(`  ${nom}`);
    }
  }

  console.log("");
  console.log(
    `Total : ${formatKio(totalAvant)} -> ${formatKio(totalApres)} ` +
      `(-${totalAvant > 0 ? (100 - (totalApres / totalAvant) * 100).toFixed(1) : "0.0"}%), ` +
      `${lignes.length} fichier(s) traité(s), ${gainsFaibles.length} gain faible, ` +
      `${orphelines.length} orpheline(s), ${ignores} ignoré(s) (type/bombe)`,
  );
  console.log(
    APPLIQUER
      ? "Mode --apply : fichiers réécrits en place (orphelines et gains faibles non touchés)."
      : "Mode dry-run : rien n'a été écrit. Relance avec --apply pour appliquer (sauvegarde < 1h requise).",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
