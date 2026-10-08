const API_URL = import.meta.env.VITE_API_URL;

export function urlImage(chemin) {
  if (!chemin) return chemin;
  if (chemin.startsWith("http://") || chemin.startsWith("https://")) {
    return chemin;
  }
  // Seuls les fichiers uploades via l'admin vivent sur le back (/uploads) ;
  // les autres chemins relatifs (ex. /images/...) sont servis statiquement par le front lui-meme.
  if (chemin.startsWith("/uploads/")) {
    return `${API_URL}${chemin}`;
  }
  return chemin;
}
