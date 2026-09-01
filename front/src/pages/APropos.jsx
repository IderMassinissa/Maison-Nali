import usePageContent from "../hooks/usePageContent";
import BlocHistoire from "../components/BlocHistoire";

export default function APropos() {
  const { sections, chargement } = usePageContent("a-propos");
  if (chargement) return null;

  return (
    <div>
      <BlocHistoire
        titre={sections["bloc-histoire"]?.titre}
        texte={sections["bloc-histoire"]?.texte}
      />
    </div>
  );
}
