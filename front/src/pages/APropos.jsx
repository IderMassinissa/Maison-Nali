import usePageContent from "../hooks/usePageContent";
import { RenduBloc } from "../blockRegistry";

export default function APropos() {
  const { sections, chargement } = usePageContent("a-propos");
  if (chargement) return null;

  return (
    <>
      {sections.map((s) => (
        <RenduBloc key={s.id} type={s.type} content={s.content} />
      ))}
    </>
  );
}
