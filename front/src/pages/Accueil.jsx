import BanniereAnnonce from "../components/BanniereAnnonce";
import Hero from "../components/Hero";
import GrillePatisseries from "../components/GrillePatisseries";
import BlocHistoire from "../components/BlocHistoire";
import BlocLocalisation from "../components/BlocLocalisation";
import BlocReseauxSociaux from "../components/BlocReseauxSociaux";

export default function Accueil() {
  return (
    <>
      <BanniereAnnonce
        message="Fermeture exceptionnelle le 15 septembre"
        active={true}
      />
      <Hero />
      <GrillePatisseries />
      <BlocHistoire />
      <BlocLocalisation />
      <BlocReseauxSociaux />
    </>
  );
}
