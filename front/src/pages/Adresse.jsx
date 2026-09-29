import usePageContent from "../hooks/usePageContent";
import ServiceIndisponible from "../components/ServiceIndisponible";
import { RenduSections } from "../blockRegistry";

export default function Adresse() {
  const { sections, chargement, erreur } = usePageContent("adresse");
  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  return <RenduSections sections={sections} />;
}
