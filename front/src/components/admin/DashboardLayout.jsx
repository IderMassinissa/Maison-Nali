/**
 * Ossature commune de toutes les pages admin : nav latérale (pages à
 * éditer + contenu transverse) et zone de contenu (`<Outlet>`). PAGES est
 * un ordre d'affichage fixe choisi ici, indépendant de la colonne
 * `position` en base (qui pilote l'ordre sur le site public, pas celui-ci).
 */
import { Link, Outlet, useNavigate } from "react-router-dom";
import usePageSeo from "../../hooks/usePageSeo";
const API_URL = import.meta.env.VITE_API_URL;

const PAGES = [
  { label: "Accueil", slug: "accueil" },
  { label: "Pâtisseries", slug: "patisseries" },
  { label: "Événements", slug: "evenements" },
  { label: "À propos", slug: "a-propos" },
  { label: "Adresse", slug: "adresse" },
];

export default function DashboardLayout() {
  usePageSeo("Maison Nali — Administration", "Espace d'administration Maison Nali.");

  const navigate = useNavigate();

  async function handleLogout() {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/admin/connexion");
  }

  return (
    <div className="admin-layout flex min-h-screen bg-brand-light">
      <a
        href="#contenu-admin"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-brand-dark focus:rounded-lg focus:shadow-medium"
      >
        Aller au contenu
      </a>
      <aside className="w-64 bg-brand-light border-r-2 border-brand-dark flex flex-col p-6">
        <h2 className="font-display text-3xl mb-10 text-brand-dark">Maison Nali</h2>

        <p className="text-sm uppercase tracking-widest opacity-50 mb-3">
          Pages
        </p>
        <nav aria-label="Pages" className="flex flex-col gap-1 mb-8">
          {PAGES.map((page) => (
            <Link
              key={page.slug}
              to={`/admin/pages/${page.slug}`}
              className="px-3 py-2 rounded-lg text-base hover:bg-white hover:shadow-soft transition-colors"
            >
              {page.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm uppercase tracking-widest opacity-50 mb-3">
          Contenu
        </p>
        <nav aria-label="Contenu" className="flex flex-col gap-1 mb-8">
          <Link
            to="/admin/produits"
            className="px-3 py-2 rounded-lg text-base hover:bg-white hover:shadow-soft transition-colors"
          >
            Produits
          </Link>
          <Link
            to="/admin/photos-evenements"
            className="px-3 py-2 rounded-lg text-base hover:bg-white hover:shadow-soft transition-colors"
          >
            Photos événements
          </Link>
          <Link
            to="/admin/banniere"
            className="px-3 py-2 rounded-lg text-base hover:bg-white hover:shadow-soft transition-colors"
          >
            Bannière
          </Link>
          <Link
            to="/admin/coordonnees"
            className="px-3 py-2 rounded-lg text-base hover:bg-white hover:shadow-soft transition-colors"
          >
            Coordonnées
          </Link>
        </nav>

        <Link
          to="/admin/mot-de-passe"
          className="text-sm uppercase tracking-widest opacity-70 hover:opacity-100 mb-4"
        >
          Changer mon mot de passe
        </Link>

        <button
          onClick={handleLogout}
          className="mt-auto text-sm uppercase tracking-widest opacity-70 hover:opacity-100 text-left"
        >
          Déconnexion
        </button>
      </aside>

      <main id="contenu-admin" className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
}
