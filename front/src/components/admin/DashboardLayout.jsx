import { Link, Outlet, useNavigate } from "react-router-dom";

const PAGES = [
  { label: "Accueil", slug: "accueil" },
  { label: "Pâtisseries", slug: "patisseries" },
  { label: "À propos", slug: "a-propos" },
  { label: "Adresse", slug: "adresse" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await fetch("http://localhost:3001/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/admin/connexion");
  }

  return (
    <div className="flex min-h-screen bg-brand-light">
      <aside className="w-64 bg-white border-r border-brand-border flex flex-col p-6">
        <h2 className="font-display text-xl mb-8">Maison Nali</h2>

        <p className="text-xs uppercase tracking-widest opacity-50 mb-3">
          Pages
        </p>
        <nav className="flex flex-col gap-1 mb-8">
          {PAGES.map((page) => (
            <Link
              key={page.slug}
              to={`/admin/pages/${page.slug}`}
              className="px-3 py-2 rounded-lg text-sm hover:bg-brand-surface transition-colors"
            >
              {page.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs uppercase tracking-widest opacity-50 mb-3">
          Contenu
        </p>
        <nav className="flex flex-col gap-1 mb-8">
          <Link
            to="/admin/produits"
            className="px-3 py-2 rounded-lg text-sm hover:bg-brand-surface transition-colors"
          >
            Produits
          </Link>
          <Link
            to="/admin/theme"
            className="px-3 py-2 rounded-lg text-sm hover:bg-brand-surface transition-colors"
          >
            Thème du site
          </Link>
          <Link
            to="/admin/banniere"
            className="px-3 py-2 rounded-lg text-sm hover:bg-brand-surface transition-colors"
          >
            Bannière
          </Link>
          <Link
            to="/admin/reseaux"
            className="px-3 py-2 rounded-lg text-sm hover:bg-brand-surface transition-colors"
          >
            Réseaux sociaux
          </Link>
        </nav>

        <Link
          to="/admin/mot-de-passe"
          className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100 mb-4"
        >
          Changer mon mot de passe
        </Link>

        <button
          onClick={handleLogout}
          className="mt-auto text-xs uppercase tracking-widest opacity-60 hover:opacity-100 text-left"
        >
          Déconnexion
        </button>
      </aside>

      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
}
