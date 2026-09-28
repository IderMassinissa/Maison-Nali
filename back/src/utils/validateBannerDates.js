const REGEX_DATE = /^\d{4}-\d{2}-\d{2}$/;

function estDateCalendaireValide(valeur) {
  if (!REGEX_DATE.test(valeur)) return false;
  const [annee, mois, jour] = valeur.split("-").map(Number);
  const date = new Date(Date.UTC(annee, mois - 1, jour));
  return (
    date.getUTCFullYear() === annee &&
    date.getUTCMonth() === mois - 1 &&
    date.getUTCDate() === jour
  );
}

function validateBannerDates(startDate, endDate) {
  const debut = startDate && startDate.trim() ? startDate.trim() : null;
  const fin = endDate && endDate.trim() ? endDate.trim() : null;

  if (debut && !estDateCalendaireValide(debut)) {
    return {
      valid: false,
      error: "La date de début est invalide (format attendu : AAAA-MM-JJ)",
    };
  }
  if (fin && !estDateCalendaireValide(fin)) {
    return {
      valid: false,
      error: "La date de fin est invalide (format attendu : AAAA-MM-JJ)",
    };
  }
  if (debut && fin && fin < debut) {
    return {
      valid: false,
      error: "La date de fin doit être après la date de début",
    };
  }

  return { valid: true, startDate: debut, endDate: fin };
}

module.exports = { validateBannerDates };
