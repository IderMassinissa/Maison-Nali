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

const racineProjet = path.join(__dirname, "../../../../../");
const dossierSauvegarde = path.join(
  racineProjet,
  "Sauvegardes",
  horodatage(),
);

fs.mkdirSync(dossierSauvegarde, { recursive: true });

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

console.log("Sauvegarde créée :", dossierSauvegarde);
