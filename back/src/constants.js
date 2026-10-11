/**
 * Constantes partagées entre plusieurs modules du back.
 *
 * NOM_COOKIE_SESSION est utilisé à la fois par server.js (qui configure le
 * cookie de session) et par la route de déconnexion (qui doit le supprimer
 * avec exactement le même nom) : centralisé ici pour que les deux ne
 * puissent pas diverger par une faute de frappe.
 */
const NOM_COOKIE_SESSION = "maison_nali_sid";

module.exports = { NOM_COOKIE_SESSION };
