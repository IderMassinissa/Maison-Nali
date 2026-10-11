/**
 * Store de session express-session écrit à la main (pas de dépendance
 * tierce), persistant dans un fichier SQLite séparé de la base applicative
 * (back/data/sessions.sqlite). Branché dans server.js via
 * `session({ store: new SqliteSessionStore() })`. Implémente l'API "Store"
 * documentée par express-session : get/set/destroy sont obligatoires,
 * touch/all/length/clear sont optionnelles mais utiles (express-session les
 * appelle si elles existent). Doc officielle :
 * https://github.com/expressjs/session#session-store-implementation
 */
const Database = require("better-sqlite3");
const path = require("path");
const { Store } = require("express-session");

// Duree de session utilisee quand on ne trouve ni cookie.expires ni
// cookie.maxAge sur la session (ne devrait normalement pas arriver : le
// cookie du serveur a toujours un maxAge, cf. server.js) -- 24h par defaut,
// comme garde-fou.
const DUREE_PAR_DEFAUT_MS = 24 * 60 * 60 * 1000;

// Intervalle entre deux purges des sessions expirees.
const INTERVALLE_PURGE_MS = 15 * 60 * 1000;

const TABLE = "sessions";

class SqliteSessionStore extends Store {
  constructor(options = {}) {
    super(options);

    const dbPath =
      options.path || path.join(__dirname, "../../data/sessions.sqlite");
    this.db = new Database(dbPath);

    // Mode WAL : plusieurs connexions (le serveur + nos tests, par exemple)
    // peuvent lire/ecrire ce fichier sans se bloquer mutuellement. Meme
    // raison que pour back/data/test.sqlite (cf. db/connection.js).
    this.db.pragma("journal_mode = WAL");

    // expire est stocke en timestamp Unix (millisecondes) plutot qu'en
    // texte : une simple comparaison numerique suffit alors a savoir si une
    // session est encore valide, pas besoin de reparser une date a chaque
    // lecture.
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expire INTEGER NOT NULL
      )
    `);

    // Requetes preparees une seule fois a la construction, reutilisees a
    // chaque appel : plus rapide, et surtout jamais de concatenation de
    // valeur dans le SQL (tout passe par des parametres lies).
    this.requetes = {
      lire: this.db.prepare(`SELECT sess, expire FROM ${TABLE} WHERE sid = ?`),
      ecrire: this.db.prepare(`
        INSERT INTO ${TABLE} (sid, sess, expire) VALUES (@sid, @sess, @expire)
        ON CONFLICT(sid) DO UPDATE SET sess = @sess, expire = @expire
      `),
      supprimer: this.db.prepare(`DELETE FROM ${TABLE} WHERE sid = ?`),
      purger: this.db.prepare(`DELETE FROM ${TABLE} WHERE expire < ?`),
      tout: this.db.prepare(`SELECT sess FROM ${TABLE}`),
      vider: this.db.prepare(`DELETE FROM ${TABLE}`),
      compter: this.db.prepare(`SELECT COUNT(*) AS n FROM ${TABLE}`),
    };

    // Purge periodique des sessions expirees, pour que la table ne grossisse
    // pas indefiniment (un visiteur qui ne revient jamais laisserait sinon
    // sa ligne en base pour toujours). options.purge: false desactive la
    // purge -- utile dans les tests qui veulent controler le minutage
    // exactement.
    if (options.purge !== false) {
      this.intervallePurge = setInterval(
        () => this.purgerSessionsExpirees(),
        options.purgeIntervalMs || INTERVALLE_PURGE_MS,
      );
      // unref() : ce minuteur ne doit jamais empecher le process Node de
      // s'arreter (sans ca, un simple Ctrl+C ou l'arret des tests resterait
      // bloque en attendant le prochain tick du setInterval).
      this.intervallePurge.unref();
    }
  }

  // Calcule l'instant d'expiration (timestamp ms) a ecrire en base, a partir
  // de la session fournie par express-session :
  // 1. cookie.expires si present (deja calcule par express-session a partir
  //    du maxAge configure dans server.js) ;
  // 2. sinon cookie.maxAge brut (en millisecondes) ajoute a maintenant ;
  // 3. sinon la duree par defaut, en dernier recours.
  calculerExpiration(sess) {
    if (sess.cookie && sess.cookie.expires) {
      return new Date(sess.cookie.expires).getTime();
    }
    if (sess.cookie && sess.cookie.maxAge) {
      return Date.now() + sess.cookie.maxAge;
    }
    return Date.now() + DUREE_PAR_DEFAUT_MS;
  }

  purgerSessionsExpirees() {
    try {
      this.requetes.purger.run(Date.now());
    } catch (err) {
      console.error("Purge des sessions expirées :", err);
    }
  }

  // get(sid, callback) -- appelee par express-session a chaque requete pour
  // recharger la session a partir du cookie recu.
  get(sid, callback = () => {}) {
    let ligne;
    try {
      ligne = this.requetes.lire.get(sid);
    } catch (err) {
      return callback(err);
    }

    if (!ligne) return callback(null, null);

    if (ligne.expire < Date.now()) {
      // Session expiree : on la supprime tout de suite (plutot que
      // d'attendre la prochaine purge periodique) et on repond comme si
      // elle n'avait jamais existe.
      try {
        this.requetes.supprimer.run(sid);
      } catch (err) {
        console.error("Suppression d'une session expirée :", err);
      }
      return callback(null, null);
    }

    let sess;
    try {
      sess = JSON.parse(ligne.sess);
    } catch (err) {
      return callback(err);
    }
    callback(null, sess);
  }

  // set(sid, session, callback) -- appelee pour creer ou remplacer une
  // session (ex. a la connexion, apres session.regenerate()).
  set(sid, sess, callback = () => {}) {
    try {
      this.requetes.ecrire.run({
        sid,
        sess: JSON.stringify(sess),
        expire: this.calculerExpiration(sess),
      });
    } catch (err) {
      return callback(err);
    }
    callback(null);
  }

  // destroy(sid, callback) -- appelee a la deconnexion (req.session.destroy).
  destroy(sid, callback = () => {}) {
    try {
      this.requetes.supprimer.run(sid);
    } catch (err) {
      return callback(err);
    }
    callback(null);
  }

  // touch(sid, session, callback) -- appelee par express-session sur les
  // requetes qui ne modifient pas le contenu de la session (resave: false),
  // uniquement pour repousser son expiration. Reecrire sess+expire comme
  // set() est inutile pour le contenu (il n'a pas change) mais sans
  // consequence, et evite de dupliquer la logique de calcul d'expiration.
  touch(sid, sess, callback = () => {}) {
    this.set(sid, sess, callback);
  }

  // all(callback) -- optionnelle, renvoie toutes les sessions stockees.
  all(callback = () => {}) {
    let lignes;
    try {
      lignes = this.requetes.tout.all();
    } catch (err) {
      return callback(err);
    }
    try {
      callback(null, lignes.map((l) => JSON.parse(l.sess)));
    } catch (err) {
      callback(err);
    }
  }

  // length(callback) -- optionnelle, nombre de sessions stockees.
  length(callback = () => {}) {
    let ligne;
    try {
      ligne = this.requetes.compter.get();
    } catch (err) {
      return callback(err);
    }
    callback(null, ligne.n);
  }

  // clear(callback) -- optionnelle, vide entierement la table.
  clear(callback = () => {}) {
    try {
      this.requetes.vider.run();
    } catch (err) {
      return callback(err);
    }
    callback(null);
  }

  // Pas une methode de l'API Store : juste un arret propre (coupe le
  // minuteur de purge et ferme la connexion SQLite), utile en fin de test
  // ou a l'arret du serveur.
  fermer() {
    if (this.intervallePurge) clearInterval(this.intervallePurge);
    this.db.close();
  }
}

module.exports = SqliteSessionStore;
