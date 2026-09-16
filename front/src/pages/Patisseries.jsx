import usePageContent from "../hooks/usePageContent";
import { RenduBloc } from "../blockRegistry";

export default function Patisseries() {
  const { sections, chargement } = usePageContent("patisseries");
  if (chargement) return null;

  return (
    <div className="pt-16 pb-24">
      <section className="px-6 md:px-12 mb-16 md:mb-24 text-center">
        <span className="text-brand-accent text-xs uppercase tracking-[0.3em] mb-6 block">
          Collection Signature
        </span>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight mb-8">
          Nos Pâtisseries
        </h1>
      </section>
      {sections.map((s) => (
        <RenduBloc key={s.id} type={s.type} content={s.content} />
      ))}
    </div>
  );
}
