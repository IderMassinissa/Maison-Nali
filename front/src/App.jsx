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

function SiteLayout() {
  return (
    <>
      <Header />
      <div className="pt-24">
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
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/adresse" element={<Adresse />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
        </Route>

        <Route path="/admin/connexion" element={<Connexion />} />
        <Route path="/admin" element={<RouteProtegee />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pages/:slug" element={<GestionPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
