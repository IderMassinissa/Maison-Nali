/**
 * Résout un chemin de photo stocké en base vers une URL réellement
 * chargeable par le navigateur. Seuls les fichiers uploadés via l'admin
 * vivent sur le back (/uploads, préfixé par VITE_API_URL) ; les autres
 * chemins relatifs (ex. /images/...) sont servis statiquement par le
 * front lui-même, donc renvoyés tels quels.
 */
const API_URL = import.meta.env.VITE_API_URL;

/** @returns {string} l'URL utilisable par un <img src>, ou la valeur d'origine si vide/externe/déjà résolue. */
export function urlImage(chemin) {
  if (!chemin) return chemin;
  if (chemin.startsWith("http://") || chemin.startsWith("https://")) {
    return chemin;
  }
  if (chemin.startsWith("/uploads/")) {
    return `${API_URL}${chemin}`;
  }
  return chemin;
}
