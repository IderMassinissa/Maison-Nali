// Limite le nombre de tentatives de connexion par adresse IP, pour freiner
// une attaque par force brute sur le mot de passe admin. Implementation
// volontairement simple (compteur en memoire) : pas besoin de persistance
// entre redemarrages pour ce besoin, contrairement aux sessions.

const LIMITE_TENTATIVES = 5;
const FENETRE_MS = 15 * 60 * 1000; // 15 minutes

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

// Exporte pour les tests, qui ont besoin de repartir d'un etat vierge entre
// deux scenarios (sans ca, le compteur d'une IP de test resterait pollue
// par le test precedent).
function reinitialiser() {
  tentativesParIp.clear();
}

module.exports = rateLimitLogin;
module.exports.reinitialiser = reinitialiser;
