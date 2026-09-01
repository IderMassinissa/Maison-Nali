import usePageContent from "../hooks/usePageContent";
import BlocLocalisation from "../components/BlocLocalisation";

export default function Adresse() {
  const { chargement } = usePageContent("adresse");
  if (chargement) return null;

  return (
    <div>
      <BlocLocalisation />
    </div>
  );
}
