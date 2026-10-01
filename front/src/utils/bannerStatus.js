export function getParisDateFront(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(
    date,
  );
}

export function formatDateFr(dateISO) {
  if (!dateISO) return "";
  const [annee, mois, jour] = dateISO.split("-");
  return `${jour}/${mois}/${annee}`;
}

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
