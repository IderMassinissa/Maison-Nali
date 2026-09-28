import usePageContent from "../hooks/usePageContent";
import Hero from "../components/Hero";
import BlocHistoire from "../components/BlocHistoire";
import GrillePatisseries from "../components/GrillePatisseries";
import BlocLocalisation from "../components/BlocLocalisation";
import ServiceIndisponible from "../components/ServiceIndisponible";

export default function Accueil() {
  const { sections, chargement, erreur } = usePageContent("accueil");
  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

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
