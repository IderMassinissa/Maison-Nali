// Nom du cookie de session, partagé entre server.js (qui le configure) et
// auth.js (qui doit le supprimer avec exactement le même nom à la
// déconnexion) -- évite que les deux divergent un jour par une faute de
// frappe.
const NOM_COOKIE_SESSION = "maison_nali_sid";

module.exports = { NOM_COOKIE_SESSION };
