import usePageContent from "../hooks/usePageContent";
import BlocHistoire from "../components/BlocHistoire";
import ServiceIndisponible from "../components/ServiceIndisponible";

export default function APropos() {
  const { sections, chargement, erreur } = usePageContent("a-propos");
  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  const histoire = sections.find((s) => s.type === "bloc-histoire");

  return <>{histoire && <BlocHistoire {...histoire.content} />}</>;
}
