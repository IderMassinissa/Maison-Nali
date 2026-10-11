/**
 * Middleware Express branché sur POST /api/auth/login (voir routes/auth.js)
 * : limite le nombre de tentatives de connexion par adresse IP, pour
 * freiner une attaque par force brute sur le mot de passe admin.
 * Implémentation volontairement simple (compteur en mémoire, clé = IP) :
 * pas besoin de persistance entre redémarrages pour ce besoin, contrairement
 * aux sessions. Purge périodique + API de réinitialisation exportées pour
 * les tests et pour auth.js (succès de connexion = repart à zéro pour cette IP).
 */
const LIMITE_TENTATIVES = 5;
const FENETRE_MS = 15 * 60 * 1000; // 15 minutes
const INTERVALLE_PURGE_MS = 15 * 60 * 1000;

// cle = adresse IP, valeur = { compte, depuis } ("depuis" = debut de la
// fenetre de 15 minutes en cours pour cette IP).
const tentativesParIp = new Map();

function rateLimitLogin(req, res, next) {
  const ip = req.ip;
  const maintenant = Date.now();

  const entree = tentativesParIp.get(ip);

  if (!entree || maintenant - entree.depuis > FENETRE_MS) {
    // Pas d'historique, ou fenetre precedente expiree : on recommence a 1.
    tentativesParIp.set(ip, { compte: 1, depuis: maintenant });
    return next();
  }

  if (entree.compte >= LIMITE_TENTATIVES) {
    const attenteMs = FENETRE_MS - (maintenant - entree.depuis);
    const attenteMin = Math.ceil(attenteMs / 60000);
    return res.status(429).json({
      error: `Trop de tentatives de connexion. Réessaie dans ${attenteMin} minute(s).`,
    });
  }

  entree.compte += 1;
  next();
}

// A appeler depuis auth.js quand une connexion reussit : une IP qui vient
// de prouver qu'elle connait le bon mot de passe n'a plus de raison de
// rester comptee comme suspecte -- repart a zero plutot que de continuer a
// accumuler vers la limite a partir de tentatives anterieures (echouees ou
// non).
function reinitialiserTentativesIp(ip) {
  tentativesParIp.delete(ip);
}

// Purge perdiodique des entrees dont la fenetre de 15 minutes est expiree :
// une IP qui n'a plus retente depuis longtemps ne doit pas rester en
// memoire indefiniment (la Map grossirait sans fin sur un serveur qui tourne
// des mois). .unref() : ce minuteur ne doit jamais empecher le process de
// s'arreter proprement (Ctrl+C, fin des tests...).
function purgerEntreesExpirees() {
  const maintenant = Date.now();
  for (const [ip, entree] of tentativesParIp) {
    if (maintenant - entree.depuis > FENETRE_MS) {
      tentativesParIp.delete(ip);
    }
  }
}

let intervallePurge = null;

function demarrerPurgePeriodique(intervalleMs = INTERVALLE_PURGE_MS) {
  arreterPurgePeriodique();
  intervallePurge = setInterval(purgerEntreesExpirees, intervalleMs);
  intervallePurge.unref();
  return intervallePurge;
}

function arreterPurgePeriodique() {
  if (intervallePurge) {
    clearInterval(intervallePurge);
    intervallePurge = null;
  }
}

// Demarree automatiquement a l'import, comme un vrai middleware pret a
// l'emploi -- arreterPurgePeriodique()/demarrerPurgePeriodique() restent
// disponibles pour les tests qui veulent controler le minutage exactement.
demarrerPurgePeriodique();

// Exporte pour les tests, qui ont besoin de repartir d'un etat vierge entre
// deux scenarios (sans ca, le compteur d'une IP de test resterait pollue
// par le test precedent).
function reinitialiser() {
  tentativesParIp.clear();
}

module.exports = rateLimitLogin;
module.exports.reinitialiser = reinitialiser;
module.exports.reinitialiserTentativesIp = reinitialiserTentativesIp;
module.exports.purgerEntreesExpirees = purgerEntreesExpirees;
module.exports.demarrerPurgePeriodique = demarrerPurgePeriodique;
module.exports.arreterPurgePeriodique = arreterPurgePeriodique;
module.exports._tentativesParIp = tentativesParIp;
