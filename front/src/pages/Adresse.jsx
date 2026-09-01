import usePageContent from "../hooks/usePageContent";
import BlocLocalisation from "../components/BlocLocalisation";
import BlocReseauxSociaux from "../components/BlocReseauxSociaux";

export default function Adresse() {
  const { sections, chargement } = usePageContent("adresse");
  if (chargement) return null;

  return (
    <div>
      <BlocLocalisation adresse={sections["bloc-localisation"]?.adresse} />
      <BlocReseauxSociaux
        instagram={sections["bloc-reseaux"]?.instagram}
        facebook={sections["bloc-reseaux"]?.facebook}
      />
    </div>
  );
}
