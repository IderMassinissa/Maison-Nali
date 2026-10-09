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
