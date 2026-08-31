import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Accueil from "./pages/Accueil";
import Patisseries from "./pages/Patisseries";
import APropos from "./pages/APropos";
import Adresse from "./pages/Adresse";
import Connexion from "./pages/admin/Connexion";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="pt-24">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/patisseries" element={<Patisseries />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/adresse" element={<Adresse />} />
          <Route path="/admin/connexion" element={<Connexion />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
