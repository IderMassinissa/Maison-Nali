/**
 * Bandeau d'annonce affiché en haut des pages publiques. `active` est déjà
 * calculé côté appelant (fenêtre de dates + drapeau en base, voir
 * back/src/utils/bannerVisibility.js) : ce composant se contente d'afficher
 * ou de masquer, sans logique de visibilité propre.
 */
export default function BanniereAnnonce({ message, active }) {
  if (!active) return null;

  return (
    <div className="bg-brand-accent text-brand-dark text-center py-3 px-4 text-sm font-medium">
      {message}
    </div>
  );
}
