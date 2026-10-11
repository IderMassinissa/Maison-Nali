/**
 * Calcule le statut lisible d'une annonce (Gestion Bannière, admin) selon
 * sa fenêtre de dates. Équivalent front de isBannerVisible côté back
 * (back/src/utils/bannerVisibility.js), mais pour affichage humain
 * ("Programmée", "Expirée"...) plutôt qu'un simple booléen.
 */
/** @returns {string} la date du jour à Paris, au format AAAA-MM-JJ. */
export function getParisDateFront(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(
    date,
  );
}

/** @returns {string} la date ISO (AAAA-MM-JJ) reformatée en JJ/MM/AAAA, ou chaîne vide si absente. */
export function formatDateFr(dateISO) {
  if (!dateISO) return "";
  const [annee, mois, jour] = dateISO.split("-");
  return `${jour}/${mois}/${annee}`;
}

/** @returns {string} statut lisible de l'annonce ("Désactivée", "Programmée (...)", "Expirée (...)", "Affichée actuellement"). */
export function statutBanniere(annonce) {
  if (!annonce || !annonce.active) return "Désactivée";

  const aujourdhui = getParisDateFront();
  const { start_date, end_date } = annonce;

  if (start_date && aujourdhui < start_date) {
    return `Programmée (début le ${formatDateFr(start_date)})`;
  }
  if (end_date && aujourdhui > end_date) {
    return `Expirée (fin le ${formatDateFr(end_date)})`;
  }
  return "Affichée actuellement";
}
