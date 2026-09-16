import Hero from "./components/Hero";
import GrillePatisseries from "./components/GrillePatisseries";
import BlocHistoire from "./components/BlocHistoire";
import BlocLocalisation from "./components/BlocLocalisation";

export function RenduBloc({ type, content }) {
  switch (type) {
    case "hero":
      return (
        <Hero
          titre={content.titre}
          sousTitre={content.sousTitre}
          photo={content.photo}
          focusX={content.focusX}
          focusY={content.focusY}
        />
      );
    case "bloc-patisseries":
      return <GrillePatisseries />;
    case "bloc-histoire":
      return <BlocHistoire titre={content.titre} texte={content.texte} />;
    case "bloc-localisation":
      return <BlocLocalisation />;
    default:
      return null;
  }
}
