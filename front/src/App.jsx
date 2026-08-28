import Header from "./components/Header";
import BanniereAnnonce from "./components/BanniereAnnonce";
import Hero from "./components/Hero";
import Footer from "./components/Footer";

function App() {
  return (
    <div>
      <Header />
      <div className="pt-24">
        <BanniereAnnonce message="Fermeture exceptionnelle !" active={true} />
        <Hero />
        <Footer />
      </div>
    </div>
  );
}

export default App;
