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
          couleur={content.couleur}
          couleurGradientActif={content.couleurGradientActif}
          couleurGradientFin={content.couleurGradientFin}
          couleurGradientStyle={content.couleurGradientStyle}
        />
      );
    case "bloc-patisseries":
      return (
        <GrillePatisseries
          couleur={content.couleur}
          couleurGradientActif={content.couleurGradientActif}
          couleurGradientFin={content.couleurGradientFin}
          couleurGradientStyle={content.couleurGradientStyle}
        />
      );
    case "bloc-histoire":
      return (
        <BlocHistoire
          titre={content.titre}
          texte={content.texte}
          couleur={content.couleur}
          couleurGradientActif={content.couleurGradientActif}
          couleurGradientFin={content.couleurGradientFin}
          couleurGradientStyle={content.couleurGradientStyle}
        />
      );
    case "bloc-localisation":
      return (
        <BlocLocalisation
          couleur={content.couleur}
          couleurGradientActif={content.couleurGradientActif}
          couleurGradientFin={content.couleurGradientFin}
          couleurGradientStyle={content.couleurGradientStyle}
        />
      );
    default:
      return null;
  }
}
