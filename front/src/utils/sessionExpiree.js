export function gererSessionExpiree(status) {
  if (status === 401 || status === 403) {
    window.location.href = "/admin/connexion";
    return true;
  }
  return false;
}
