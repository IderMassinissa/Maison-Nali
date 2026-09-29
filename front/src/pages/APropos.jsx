import usePageContent from "../hooks/usePageContent";
import ServiceIndisponible from "../components/ServiceIndisponible";
import { RenduSections } from "../blockRegistry";

export default function APropos() {
  const { sections, chargement, erreur } = usePageContent("a-propos");
  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  return <RenduSections sections={sections} />;
}
