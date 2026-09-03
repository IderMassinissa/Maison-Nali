import Hero from "./components/Hero";
import GrillePatisseries from "./components/GrillePatisseries";
import BlocHistoire from "./components/BlocHistoire";
import BlocLocalisation from "./components/BlocLocalisation";

export const BLOCS_DISPONIBLES = [
  { type: "hero", label: "Hero (bannière principale)" },
  { type: "grille-patisseries", label: "Grille Pâtisseries" },
  { type: "bloc-histoire", label: "Bloc Histoire" },
  { type: "bloc-localisation", label: "Bloc Localisation" },
];

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
    case "grille-patisseries":
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
