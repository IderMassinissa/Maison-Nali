const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const SqliteSessionStore = require("./sqliteSessionStore");

const DB_TEST = path.join(__dirname, "../../data/sessions-test.sqlite");

function nettoyerFichiersDb() {
  for (const suffixe of ["", "-wal", "-shm"]) {
    const p = DB_TEST + suffixe;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

function nouveauStore(options = {}) {
  return new SqliteSessionStore({ path: DB_TEST, purge: false, ...options });
}

// Les methodes du Store suivent la convention Node "callback(err, resultat)".
// On les transforme en promesses pour ecrire des tests async/await clairs,
// sans dependre du fait que better-sqlite3 rappelle de facon synchrone.
function promisifier(methode, contexte) {
  return (...args) =>
    new Promise((resolve, reject) => {
      methode.call(contexte, ...args, (err, resultat) =>
        err ? reject(err) : resolve(resultat),
      );
    });
}

function attendre(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test.beforeEach(nettoyerFichiersDb);
test.after(nettoyerFichiersDb);

test("set puis get renvoie la session telle quelle", async (t) => {
  const store = nouveauStore();
  t.after(() => store.fermer());
  const set = promisifier(store.set, store);
  const get = promisifier(store.get, store);

  const session = { cookie: { maxAge: 60000 }, userId: 42 };
  await set("sid-1", session);

  const relue = await get("sid-1");
  assert.deepStrictEqual(relue, session);
});

test("get sur un sid inconnu renvoie null", async (t) => {
  const store = nouveauStore();
  t.after(() => store.fermer());
  const get = promisifier(store.get, store);

  const resultat = await get("sid-inexistant");
  assert.strictEqual(resultat, null);
});

test("une session expirée est refusée par get et supprimée de la base", async (t) => {
  const store = nouveauStore();
  t.after(() => store.fermer());
  const set = promisifier(store.set, store);
  const get = promisifier(store.get, store);
  const length = promisifier(store.length, store);

  // maxAge negatif : expire deja dans le passe au moment du set.
  await set("sid-expire", { cookie: { maxAge: -1000 } });

  const resultat = await get("sid-expire");
  assert.strictEqual(resultat, null);

  // La ligne doit avoir ete supprimee par get(), pas seulement ignoree.
  const n = await length();
  assert.strictEqual(n, 0);
});

test("destroy supprime bien la session", async (t) => {
  const store = nouveauStore();
  t.after(() => store.fermer());
  const set = promisifier(store.set, store);
  const get = promisifier(store.get, store);
  const destroy = promisifier(store.destroy, store);

  await set("sid-destroy", { cookie: { maxAge: 60000 } });
  await destroy("sid-destroy");

  const resultat = await get("sid-destroy");
  assert.strictEqual(resultat, null);
});

test("touch prolonge l'expiration d'une session existante", async (t) => {
  const store = nouveauStore();
  t.after(() => store.fermer());
  const set = promisifier(store.set, store);
  const touch = promisifier(store.touch, store);
  const get = promisifier(store.get, store);

  // Session dont l'expiration est tres proche.
  await set("sid-touch", { cookie: { maxAge: 50 } });
  // touch() avec un maxAge beaucoup plus grand doit repousser l'expiration.
  await touch("sid-touch", { cookie: { maxAge: 60000 } });

  // Meme apres le delai initial de 50ms, la session doit toujours etre
  // valide grace au touch.
  await attendre(80);
  const resultat = await get("sid-touch");
  assert.notStrictEqual(resultat, null);
});

test("la purge supprime les sessions expirées sans toucher aux valides", async (t) => {
  const store = nouveauStore();
  t.after(() => store.fermer());
  const set = promisifier(store.set, store);
  const get = promisifier(store.get, store);
  const length = promisifier(store.length, store);

  await set("sid-vieille", { cookie: { maxAge: -1000 } });
  await set("sid-fraiche", { cookie: { maxAge: 60000 } });

  store.purgerSessionsExpirees();

  const n = await length();
  assert.strictEqual(n, 1);

  const fraiche = await get("sid-fraiche");
  assert.notStrictEqual(fraiche, null);
});

test("une session survit à la fermeture et à la réouverture du store (redémarrage simulé)", async (t) => {
  const premierStore = nouveauStore();
  const set = promisifier(premierStore.set, premierStore);

  const session = { cookie: { maxAge: 60000 }, userId: 7 };
  await set("sid-persistant", session);

  // Ferme la connexion SQLite, comme un arret du serveur.
  premierStore.fermer();

  // Reouvre un store sur le MEME fichier, comme un redemarrage.
  const secondStore = nouveauStore();
  t.after(() => secondStore.fermer());
  const get = promisifier(secondStore.get, secondStore);

  const relue = await get("sid-persistant");
  assert.deepStrictEqual(relue, session);
});
