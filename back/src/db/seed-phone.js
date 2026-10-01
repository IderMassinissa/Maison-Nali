const { getSetting, setSetting } = require("../repositories/settings");

const existant = getSetting("phone");

if (existant) {
  console.log("Clé phone déjà présente, valeur inchangée :", existant);
} else {
  setSetting("phone", "01 86 04 43 34");
  console.log("Clé phone initialisée à : 01 86 04 43 34");
}
