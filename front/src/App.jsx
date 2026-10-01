import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Accueil from "./pages/Accueil";
import Patisseries from "./pages/Patisseries";
import APropos from "./pages/APropos";
import Adresse from "./pages/Adresse";
import Evenements from "./pages/Evenements";
import MentionsLegales from "./pages/MentionsLegales";
import Connexion from "./pages/admin/Connexion";
import DashboardLayout from "./components/admin/DashboardLayout";
import RouteProtegee from "./components/admin/RouteProtegee";
import { Outlet } from "react-router-dom";
import GestionPage from "./pages/admin/GestionPage";
import EditionBloc from "./pages/admin/EditionBloc";
import GestionProduits from "./pages/admin/GestionProduits";
import GestionBanniere from "./pages/admin/GestionBanniere";
import { useEffect, useState } from "react";
import BanniereAnnonce from "./components/BanniereAnnonce";
import ChangerMotDePasse from "./pages/admin/ChangerMotDePasse";
import GestionReseaux from "./pages/admin/GestionReseaux";
import GestionPhotosEvenements from "./pages/admin/GestionPhotosEvenements";
import ProduitDetail from "./pages/ProduitDetail";
import NotFound from "./pages/NotFound";

const API_URL = import.meta.env.VITE_API_URL;

function SiteLayout() {
  const [annonce, setAnnonce] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/announcements`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAnnonce(data))
      .catch(() => setAnnonce(null));
  }, []);

  return (
    <>
      <Header />
      <div className="pt-24 bg-brand-light">
        {annonce && (
          <BanniereAnnonce
            message={annonce.message}
            active={!!annonce.active}
          />
        )}
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/patisseries" element={<Patisseries />} />
          <Route path="/patisseries/:id" element={<ProduitDetail />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/adresse" element={<Adresse />} />
          <Route path="/evenements" element={<Evenements />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/connexion" element={<Connexion />} />
        <Route path="/admin" element={<RouteProtegee />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/admin/produits" replace />} />
            <Route path="pages/:slug" element={<GestionPage />} />
            <Route path="pages/:slug/blocs/:id" element={<EditionBloc />} />
            <Route path="produits" element={<GestionProduits />} />
            <Route path="banniere" element={<GestionBanniere />} />
            <Route path="coordonnees" element={<GestionReseaux />} />
            <Route
              path="photos-evenements"
              element={<GestionPhotosEvenements />}
            />
            <Route
              path="reseaux"
              element={<Navigate to="/admin/coordonnees" replace />}
            />
            <Route
              path="prestations"
              element={<Navigate to="/admin/photos-evenements" replace />}
            />
            <Route path="mot-de-passe" element={<ChangerMotDePasse />} />
            <Route path="*" element={<Navigate to="/admin/produits" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
