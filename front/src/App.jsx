import useTheme from "./hooks/useTheme";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Accueil from "./pages/Accueil";
import Patisseries from "./pages/Patisseries";
import APropos from "./pages/APropos";
import Adresse from "./pages/Adresse";
import MentionsLegales from "./pages/MentionsLegales";
import Connexion from "./pages/admin/Connexion";
import DashboardLayout from "./components/admin/DashboardLayout";
import Dashboard from "./pages/admin/Dashboard";
import RouteProtegee from "./components/admin/RouteProtegee";
import { Outlet } from "react-router-dom";
import GestionPage from "./pages/admin/GestionPage";
import EditionBloc from "./pages/admin/EditionBloc";
import GestionProduits from "./pages/admin/GestionProduits";
import GestionTheme from "./pages/admin/GestionTheme";
import GestionBanniere from "./pages/admin/GestionBanniere";
import { useEffect, useState } from "react";
import BanniereAnnonce from "./components/BanniereAnnonce";
import ChangerMotDePasse from "./pages/admin/ChangerMotDePasse";
import GestionReseaux from "./pages/admin/GestionReseaux";
const API_URL = import.meta.env.VITE_API_URL;

function SiteLayout() {
  const [annonce, setAnnonce] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/announcements`)
      .then((res) => res.json())
      .then((data) => setAnnonce(data));
  }, []);

  return (
    <>
      <Header />
      <div className="pt-24">
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
  useTheme();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/patisseries" element={<Patisseries />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/adresse" element={<Adresse />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
        </Route>

        <Route path="/admin/connexion" element={<Connexion />} />
        <Route path="/admin" element={<RouteProtegee />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pages/:slug" element={<GestionPage />} />
            <Route path="pages/:slug/blocs/:id" element={<EditionBloc />} />
            <Route path="produits" element={<GestionProduits />} />
            <Route path="theme" element={<GestionTheme />} />
            <Route path="banniere" element={<GestionBanniere />} />
            <Route path="reseaux" element={<GestionReseaux />} />
            <Route path="mot-de-passe" element={<ChangerMotDePasse />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
