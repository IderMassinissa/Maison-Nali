import Header from "./components/Header";
import BanniereAnnonce from "./components/BanniereAnnonce";
import Hero from "./components/Hero";
import GrillePatisseries from "./components/GrillePatisseries";
import BlocHistoire from "./components/BlocHistoire";
import BlocLocalisation from "./components/BlocLocalisation";
import Footer from "./components/Footer";

function App() {
  return (
    <div>
      <Header />
      <div className="pt-24">
        <BanniereAnnonce message="Fermeture exceptionnelle !" active={true} />
        <Hero />
        <GrillePatisseries />
        <BlocHistoire />
        <BlocLocalisation />
        <Footer />
      </div>
    </div>
  );
}

export default App;
