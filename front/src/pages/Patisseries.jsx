import usePageContent from "../hooks/usePageContent";
import ServiceIndisponible from "../components/ServiceIndisponible";
import { RenduSections } from "../blockRegistry";

export default function Patisseries() {
  const { sections, chargement, erreur } = usePageContent("patisseries");
  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  return (
    <div className="pt-20 md:pt-28 pb-24 md:pb-32">
      <section className="px-6 md:px-12 mb-16 md:mb-24 text-center">
        <span className="text-brand-accent text-sm md:text-base uppercase tracking-[0.3em] mb-6 block">
          Collection Signature
        </span>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight mb-8">
          Nos Pâtisseries
        </h1>
      </section>
      <RenduSections sections={sections} />
    </div>
  );
}
