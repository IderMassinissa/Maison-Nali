import usePageContent from "../hooks/usePageContent";
import usePageSeo from "../hooks/usePageSeo";
import ServiceIndisponible from "../components/ServiceIndisponible";
import BlocEntete from "../components/BlocEntete";
import Hero from "../components/Hero";
import BlocHistoire from "../components/BlocHistoire";
import GrillePatisseries from "../components/GrillePatisseries";
import BlocLocalisation from "../components/BlocLocalisation";

const TITRE_REPLI = "Maison Nali";
const DESCRIPTION_REPLI =
  "Pâtisserie algérienne artisanale à Paris — miel, fleur d'oranger et gestes transmis depuis trois générations.";

export default function Accueil() {
  const { sections, chargement, erreur } = usePageContent("accueil");

  const entete = sections.find((s) => s.type === "bloc-entete")?.content;
  usePageSeo(
    `${entete?.titre || TITRE_REPLI} — Maison Nali`,
    (entete?.intro || DESCRIPTION_REPLI).slice(0, 160),
  );

  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  const hero = sections.find((s) => s.type === "hero")?.content;
  const histoire = sections.find((s) => s.type === "bloc-histoire")?.content;

  return (
    <>
      {entete && <BlocEntete {...entete} />}
      <Hero {...hero} entetePresent={true} />
      <BlocHistoire {...histoire} fondSombre={false} />
      <GrillePatisseries />
      <BlocLocalisation />
    </>
  );
}
