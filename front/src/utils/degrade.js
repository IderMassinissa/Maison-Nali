export const STYLES_DEGRADE = [
  { valeur: "diagonal", label: "Diagonal" },
  { valeur: "vertical", label: "Vertical" },
  { valeur: "horizontal", label: "Horizontal" },
  { valeur: "radial", label: "Radial (rond)" },
];

export function construireDegradeCss(style, couleurDebut, couleurFin) {
  switch (style) {
    case "vertical":
      return `linear-gradient(180deg, ${couleurDebut}, ${couleurFin})`;
    case "horizontal":
      return `linear-gradient(90deg, ${couleurDebut}, ${couleurFin})`;
    case "radial":
      return `radial-gradient(circle, ${couleurDebut}, ${couleurFin})`;
    case "diagonal":
    default:
      return `linear-gradient(135deg, ${couleurDebut}, ${couleurFin})`;
  }
}
