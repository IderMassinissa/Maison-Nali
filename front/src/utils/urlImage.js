const API_URL = import.meta.env.VITE_API_URL;

export function urlImage(chemin) {
  if (!chemin) return chemin;
  if (chemin.startsWith("http://") || chemin.startsWith("https://")) {
    return chemin;
  }
  return `${API_URL}${chemin}`;
}
