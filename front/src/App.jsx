import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ChargementPage from "./components/ChargementPage";
import Accueil from "./pages/Accueil";
import Patisseries from "./pages/Patisseries";
import APropos from "./pages/APropos";
import Adresse from "./pages/Adresse";
import Evenements from "./pages/Evenements";
import MentionsLegales from "./pages/MentionsLegales";
import { Outlet } from "react-router-dom";
import BanniereAnnonce from "./components/BanniereAnnonce";
import ProduitDetail from "./pages/ProduitDetail";
import NotFound from "./pages/NotFound";

const Connexion = lazy(() => import("./pages/admin/Connexion"));
const DashboardLayout = lazy(() => import("./components/admin/DashboardLayout"));
const RouteProtegee = lazy(() => import("./components/admin/RouteProtegee"));
const GestionPage = lazy(() => import("./pages/admin/GestionPage"));
const EditionBloc = lazy(() => import("./pages/admin/EditionBloc"));
const GestionProduits = lazy(() => import("./pages/admin/GestionProduits"));
const GestionBanniere = lazy(() => import("./pages/admin/GestionBanniere"));
const ChangerMotDePasse = lazy(() => import("./pages/admin/ChangerMotDePasse"));
const GestionReseaux = lazy(() => import("./pages/admin/GestionReseaux"));
const GestionPhotosEvenements = lazy(() =>
  import("./pages/admin/GestionPhotosEvenements"),
);

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
      <main className="pt-24 md:pt-[153px] bg-brand-light">
        {annonce && (
          <BanniereAnnonce
            message={annonce.message}
            active={!!annonce.active}
          />
        )}
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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

        <Route
          path="/admin/connexion"
          element={
            <Suspense fallback={<ChargementPage />}>
              <Connexion />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<ChargementPage />}>
              <RouteProtegee />
            </Suspense>
          }
        >
          <Route
            element={
              <Suspense fallback={<ChargementPage />}>
                <DashboardLayout />
              </Suspense>
            }
          >
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
