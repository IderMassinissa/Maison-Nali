function getParisDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(
    date,
  );
}

function isBannerVisible(announcement, todayParis) {
  if (!announcement || !announcement.active) return false;

  const { start_date, end_date } = announcement;
  if (start_date && todayParis < start_date) return false;
  if (end_date && todayParis > end_date) return false;

  return true;
}

module.exports = { getParisDate, isBannerVisible };
