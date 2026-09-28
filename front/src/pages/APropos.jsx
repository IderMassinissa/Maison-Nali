import usePageContent from "../hooks/usePageContent";
import BlocHistoire from "../components/BlocHistoire";

export default function APropos() {
  const { sections, chargement } = usePageContent("a-propos");
  if (chargement) return null;

  const histoire = sections.find((s) => s.type === "bloc-histoire");

  return <>{histoire && <BlocHistoire {...histoire.content} />}</>;
}
