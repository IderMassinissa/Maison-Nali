import usePageContent from "../hooks/usePageContent";
import { RenduBloc } from "../blockRegistry";

export default function Accueil() {
  const { sections, chargement } = usePageContent("adresse");
  if (chargement) return null;

  return (
    <>
      {sections.map((s) => (
        <RenduBloc key={s.id} type={s.type} content={s.content} />
      ))}
    </>
  );
}
