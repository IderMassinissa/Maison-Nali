/**
 * Validation du contenu JSON d'une section, selon son type — extrait de
 * routes/pages.js (PUT /sections/:id/content) pour être réutilisé tel quel
 * par l'import de contenu (db/content-import.js) : les deux chemins
 * doivent appliquer EXACTEMENT les mêmes règles, jamais une copie qui
 * pourrait diverger.
 */
const { validateBlocHistoire } = require("./validateBlocHistoire");
const { validateLienBouton } = require("./validateLienBouton");
const { validatePhotoInterne } = require("./validatePhotoInterne");

/**
 * @param {string} type type de la section (hero, bloc-histoire, bloc-localisation, bloc-entete, bloc-evenements, bloc-patisseries...).
 * @param {object} parsed contenu JSON déjà parsé (pas la chaîne brute).
 * @returns {{valid: true} | {valid: false, error: string}}
 */
function validateSectionContent(type, parsed) {
  if (type === "bloc-evenements") {
    const { titre = "", intro = "", formats = "" } = parsed || {};
    if (titre.length > 100) {
      return { valid: false, error: "Le titre ne doit pas dépasser 100 caractères" };
    }
    if (intro.length > 1000) {
      return {
        valid: false,
        error: "L'introduction ne doit pas dépasser 1000 caractères",
      };
    }
    if (formats.length > 1000) {
      return {
        valid: false,
        error: "La liste des formats ne doit pas dépasser 1000 caractères",
      };
    }
    return { valid: true };
  }

  if (type === "hero") {
    const { texteBouton = "", lienBouton = "", photo = "" } = parsed || {};
    if (texteBouton.length > 50) {
      return {
        valid: false,
        error: "Le texte du bouton ne doit pas dépasser 50 caractères",
      };
    }
    const validationLien = validateLienBouton(lienBouton);
    if (!validationLien.valid) return validationLien;
    const validationPhoto = validatePhotoInterne(photo);
    if (!validationPhoto.valid) return validationPhoto;
    return { valid: true };
  }

  if (type === "bloc-histoire") {
    const { texteBouton = "", lienBouton = "", photo = "" } = parsed || {};
    const validation = validateBlocHistoire(texteBouton, lienBouton);
    if (!validation.valid) return validation;
    const validationPhoto = validatePhotoInterne(photo);
    if (!validationPhoto.valid) return validationPhoto;
    return { valid: true };
  }

  if (type === "bloc-localisation") {
    const { photo = "" } = parsed || {};
    return validatePhotoInterne(photo);
  }

  if (type === "bloc-entete") {
    const { libelle = "", titre = "", intro = "" } = parsed || {};
    if (!titre.trim()) {
      return { valid: false, error: "Le titre est obligatoire" };
    }
    if (libelle.length > 60) {
      return { valid: false, error: "Le libellé ne doit pas dépasser 60 caractères" };
    }
    if (titre.length > 100) {
      return { valid: false, error: "Le titre ne doit pas dépasser 100 caractères" };
    }
    if (intro.length > 300) {
      return {
        valid: false,
        error: "L'introduction ne doit pas dépasser 300 caractères",
      };
    }
    return { valid: true };
  }

  // bloc-patisseries et tout type inconnu : aucune règle dédiée (le
  // contenu affiché provient de la table products, pas de content).
  return { valid: true };
}

module.exports = { validateSectionContent };
