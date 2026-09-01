import usePageContent from "../hooks/usePageContent";
import Hero from "../components/Hero";
import GrillePatisseries from "../components/GrillePatisseries";
import BlocHistoire from "../components/BlocHistoire";
import BlocLocalisation from "../components/BlocLocalisation";
import BlocReseauxSociaux from "../components/BlocReseauxSociaux";

export default function Accueil() {
  const { sections, chargement } = usePageContent("accueil");

  if (chargement) return null;

  return (
    <>
      <Hero titre={sections.hero?.titre} sousTitre={sections.hero?.sousTitre} />
      <GrillePatisseries />
      <BlocHistoire
        titre={sections["bloc-histoire"]?.titre}
        texte={sections["bloc-histoire"]?.texte}
      />
      <BlocLocalisation
        adresse={sections["bloc-localisation"]?.adresse}
        horaires={sections["bloc-localisation"]?.horaires}
      />
      <BlocReseauxSociaux
        instagram={sections["bloc-reseaux"]?.instagram}
        facebook={sections["bloc-reseaux"]?.facebook}
      />
    </>
  );
}
