const fs = require("fs");
const path = require("path");

function horodatage() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}h${pad(d.getMinutes())}`
  );
}

function estRacineDisque(cheminAbsolu) {
  return path.dirname(cheminAbsolu) === cheminAbsolu;
}

const racineDepot = path.join(__dirname, "../../../");

const baseSauvegarde = process.env.BACKUP_DIR
  ? path.resolve(process.env.BACKUP_DIR)
  : path.join(racineDepot, "..", "Sauvegardes");

if (estRacineDisque(baseSauvegarde)) {
  console.error(
    `Échec : BACKUP_DIR (${baseSauvegarde}) correspond à la racine du disque. ` +
      "Choisis un sous-dossier, pas la racine.",
  );
  process.exit(1);
}

const dossierSauvegarde = path.join(baseSauvegarde, horodatage());

try {
  fs.mkdirSync(dossierSauvegarde, { recursive: true });
} catch (err) {
  console.error(
    `Échec : impossible de créer le dossier de sauvegarde ${dossierSauvegarde} (${err.message}).`,
  );
  process.exit(1);
}

try {
  const dataSrc = path.join(__dirname, "../../data");
  if (fs.existsSync(dataSrc)) {
    const dataDest = path.join(dossierSauvegarde, "data");
    fs.mkdirSync(dataDest, { recursive: true });
    for (const fichier of fs.readdirSync(dataSrc)) {
      if (fichier.endsWith(".sqlite")) {
        fs.copyFileSync(
          path.join(dataSrc, fichier),
          path.join(dataDest, fichier),
        );
      }
    }
  }

  const uploadsSrc = path.join(__dirname, "../../public/uploads");
  if (fs.existsSync(uploadsSrc)) {
    fs.cpSync(uploadsSrc, path.join(dossierSauvegarde, "uploads"), {
      recursive: true,
    });
  }
} catch (err) {
  console.error(`Échec pendant la copie vers ${dossierSauvegarde} (${err.message}).`);
  process.exit(1);
}

console.log("Sauvegarde créée :", dossierSauvegarde);
