import Hero from "./components/Hero";
import BlocHistoire from "./components/BlocHistoire";
import GrillePatisseries from "./components/GrillePatisseries";
import BlocLocalisation from "./components/BlocLocalisation";
import BlocEvenements from "./components/BlocEvenements";
import BlocEntete from "./components/BlocEntete";

function RenduBloc({ type, content, indexDuType, entetePresent }) {
  switch (type) {
    case "bloc-entete":
      return <BlocEntete {...content} />;
    case "hero":
      return <Hero {...content} entetePresent={entetePresent} />;
    case "bloc-patisseries":
      return <GrillePatisseries />;
    case "bloc-histoire":
      return <BlocHistoire {...content} fondSombre={indexDuType % 2 === 1} />;
    case "bloc-localisation":
      return <BlocLocalisation />;
    case "bloc-evenements":
      return <BlocEvenements {...content} />;
    default:
      return null;
  }
}

export function RenduSections({ sections }) {
  const compteursParType = {};
  const entetePresent = sections.some((s) => s.type === "bloc-entete");

  return (
    <>
      {sections.map((section) => {
        const indexDuType = compteursParType[section.type] || 0;
        compteursParType[section.type] = indexDuType + 1;
        return (
          <RenduBloc
            key={section.id}
            type={section.type}
            content={section.content}
            indexDuType={indexDuType}
            entetePresent={entetePresent}
          />
        );
      })}
    </>
  );
}
