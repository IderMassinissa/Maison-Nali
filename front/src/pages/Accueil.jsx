import usePageContent from "../hooks/usePageContent";
import Hero from "../components/Hero";
import BlocHistoire from "../components/BlocHistoire";
import GrillePatisseries from "../components/GrillePatisseries";
import BlocLocalisation from "../components/BlocLocalisation";

export default function Accueil() {
  const { sections, chargement } = usePageContent("accueil");
  if (chargement) return null;

  const hero = sections.find((s) => s.type === "hero");
  const histoire = sections.find((s) => s.type === "bloc-histoire");

  return (
    <>
      {hero && <Hero {...hero.content} />}
      {histoire && <BlocHistoire {...histoire.content} />}
      <GrillePatisseries />
      <BlocLocalisation />
    </>
  );
}
