import usePageContent from "../hooks/usePageContent";
import Hero from "../components/Hero";
import GrillePatisseries from "../components/GrillePatisseries";
import BlocHistoire from "../components/BlocHistoire";
import BlocLocalisation from "../components/BlocLocalisation";

export default function Accueil() {
  const { sections, chargement } = usePageContent("accueil");

  if (chargement) return null;

  return (
    <>
      <Hero
        titre={sections.hero?.titre}
        sousTitre={sections.hero?.sousTitre}
        photo={sections.hero?.photo}
        focusX={sections.hero?.focusX}
        focusY={sections.hero?.focusY}
      />
      <GrillePatisseries />
      <BlocHistoire
        titre={sections["bloc-histoire"]?.titre}
        texte={sections["bloc-histoire"]?.texte}
      />
      <BlocLocalisation />
    </>
  );
}
