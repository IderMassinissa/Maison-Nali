/**
 * Redirige vers l'écran de connexion admin si le code de statut HTTP
 * indique une session expirée/absente. Appelé après chaque requête admin
 * échouée, pour renvoyer l'utilisateur se reconnecter sans qu'il reste
 * bloqué sur un écran qui ne répond plus.
 * @returns {boolean} vrai si une redirection a été déclenchée.
 */
export function gererSessionExpiree(status) {
  if (status === 401 || status === 403) {
    window.location.href = "/admin/connexion";
    return true;
  }
  return false;
}
