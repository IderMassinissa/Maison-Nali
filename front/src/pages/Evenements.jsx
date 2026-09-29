import usePageContent from "../hooks/usePageContent";
import ServiceIndisponible from "../components/ServiceIndisponible";
import { RenduSections } from "../blockRegistry";

export default function Evenements() {
  const { sections, chargement, erreur } = usePageContent("evenements");

  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  return <RenduSections sections={sections} />;
}
