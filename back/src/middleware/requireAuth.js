/** Middleware Express : bloque la requête (401) si aucune session admin n'est ouverte (req.session.userId absent), sinon laisse passer. */
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  next();
}

module.exports = requireAuth;
