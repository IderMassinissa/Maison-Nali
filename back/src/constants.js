/**
 * Constantes partagées entre plusieurs modules du back.
 *
 * NOM_COOKIE_SESSION est utilisé à la fois par server.js (qui configure le
 * cookie de session) et par la route de déconnexion (qui doit le supprimer
 * avec exactement le même nom) : centralisé ici pour que les deux ne
 * puissent pas diverger par une faute de frappe.
 *
 * COUT_BCRYPT est utilisé par repositories/auth.js (hash à la connexion et
 * au changement de mot de passe) et par db/init-admin.js (création du
 * premier compte) : centralisé ici pour que les deux ne puissent pas
 * diverger.
 */
const NOM_COOKIE_SESSION = "maison_nali_sid";
const COUT_BCRYPT = 12;

module.exports = { NOM_COOKIE_SESSION, COUT_BCRYPT };
