/**
 * Détermine si la bannière d'annonce doit s'afficher aujourd'hui, selon sa
 * fenêtre de dates (start_date/end_date, bornes incluses) et son drapeau
 * `active`. Utilisé par routes/announcements.js (GET public uniquement —
 * GET /admin renvoie toujours l'annonce brute, dates incluses).
 */
/** @returns {string} la date du jour à Paris, au format AAAA-MM-JJ (format "en-CA", qui produit cet ordre). */
function getParisDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(
    date,
  );
}

/** @returns {boolean} vrai si l'annonce est active et que todayParis (AAAA-MM-JJ) tombe dans sa fenêtre de dates. */
function isBannerVisible(announcement, todayParis) {
  if (!announcement || !announcement.active) return false;

  const { start_date, end_date } = announcement;
  if (start_date && todayParis < start_date) return false;
  if (end_date && todayParis > end_date) return false;

  return true;
}

module.exports = { getParisDate, isBannerVisible };
