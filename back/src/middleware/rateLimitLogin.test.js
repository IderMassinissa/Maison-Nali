const test = require("node:test");
const assert = require("node:assert");
const rateLimitLogin = require("./rateLimitLogin");

function fausseReponse() {
  const res = {
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(corps) {
      res.corps = corps;
      return res;
    },
  };
  return res;
}

function appeler(ip) {
  const req = { ip };
  const res = fausseReponse();
  let suivantAppele = false;
  rateLimitLogin(req, res, () => {
    suivantAppele = true;
  });
  return { res, suivantAppele };
}

test.beforeEach(() => rateLimitLogin.reinitialiser());

test("les 5 premières tentatives passent", () => {
  for (let i = 0; i < 5; i++) {
    const { suivantAppele, res } = appeler("1.2.3.4");
    assert.strictEqual(suivantAppele, true, `tentative ${i + 1} devait passer`);
    assert.strictEqual(res.statusCode, undefined);
  }
});

test("la 6e tentative est bloquée avec un message en français", () => {
  for (let i = 0; i < 5; i++) appeler("1.2.3.5");

  const { suivantAppele, res } = appeler("1.2.3.5");
  assert.strictEqual(suivantAppele, false);
  assert.strictEqual(res.statusCode, 429);
  assert.match(res.corps.error, /trop de tentatives/i);
  assert.match(res.corps.error, /minute/i);
});

test("deux IP différentes ont des compteurs indépendants", () => {
  for (let i = 0; i < 5; i++) appeler("1.2.3.6");

  // La 6e tentative sur .6 est bloquee...
  const bloquee = appeler("1.2.3.6");
  assert.strictEqual(bloquee.suivantAppele, false);

  // ...mais une autre IP n'est pas affectee.
  const autreIp = appeler("9.9.9.9");
  assert.strictEqual(autreIp.suivantAppele, true);
});

test("après expiration de la fenêtre, le compteur repart à zéro", () => {
  for (let i = 0; i < 5; i++) appeler("1.2.3.7");
  assert.strictEqual(appeler("1.2.3.7").suivantAppele, false);

  // On ne peut pas attendre 15 minutes dans un test : on vide directement
  // le compteur, ce qui simule l'expiration de la fenetre.
  rateLimitLogin.reinitialiser();

  assert.strictEqual(appeler("1.2.3.7").suivantAppele, true);
});

test("une connexion réussie réinitialise le compteur de l'IP : 4 échecs + succès + 4 échecs ne bloque pas", () => {
  const ip = "1.2.3.8";

  // 4 tentatives (ratees cote appelant, le middleware ne distingue pas
  // echec/succes -- il compte juste les appels).
  for (let i = 0; i < 4; i++) {
    assert.strictEqual(appeler(ip).suivantAppele, true, `echec ${i + 1}`);
  }

  // La 5e "tentative" est en realite la connexion reussie : auth.js
  // appelle reinitialiserTentativesIp(req.ip) avant de repondre.
  assert.strictEqual(appeler(ip).suivantAppele, true);
  rateLimitLogin.reinitialiserTentativesIp(ip);

  // 4 nouvelles tentatives : si le compteur n'avait pas ete remis a zero,
  // on serait a 5+4=9 appels cumules et bloque depuis longtemps. Elles
  // doivent toutes passer.
  for (let i = 0; i < 4; i++) {
    assert.strictEqual(
      appeler(ip).suivantAppele,
      true,
      `tentative ${i + 1} apres reinitialisation`,
    );
  }
});

test("purgerEntreesExpirees supprime les entrées hors fenêtre, garde les récentes", () => {
  appeler("1.2.3.9"); // entree fraiche, "depuis" = maintenant
  const map = rateLimitLogin._tentativesParIp;

  // Fabrique une entree artificiellement vieille (fenetre de 15 min + 1ms
  // depassee), sans attendre 15 minutes reelles.
  map.set("1.2.3.10", { compte: 3, depuis: Date.now() - 15 * 60 * 1000 - 1 });

  rateLimitLogin.purgerEntreesExpirees();

  assert.strictEqual(map.has("1.2.3.9"), true, "l'entree recente doit rester");
  assert.strictEqual(map.has("1.2.3.10"), false, "l'entree expiree doit disparaitre");
});

test("demarrerPurgePeriodique/arreterPurgePeriodique gèrent le minuteur sans laisser le process bloqué", (t) => {
  rateLimitLogin.arreterPurgePeriodique();
  const minuteur = rateLimitLogin.demarrerPurgePeriodique(50);
  t.after(() => rateLimitLogin.arreterPurgePeriodique());

  // .unref() doit avoir ete applique (sinon ce minuteur empecherait `node
  // --test` de se terminer tout seul une fois les tests finis).
  assert.strictEqual(minuteur.hasRef(), false);
});
