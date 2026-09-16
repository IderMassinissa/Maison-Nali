import { useEffect } from "react";
import { construireDegradeCss } from "../utils/degrade";
const API_URL = import.meta.env.VITE_API_URL;

// color_dark / color_light / color_surface / color_border restent en base (settings)
// mais ne sont plus lus ici : chaque bloc gère désormais sa propre couleur via son
// content JSON (voir blockRegistry.jsx). Seuls color_primary (accent global) et
// color_header/color_footer (uniques, hors système de blocs) restent globaux.
const MAPPING_COULEURS = [
  { key: "color_primary", varCouleur: "--color-brand-accent", varDegrade: "--gradient-brand-accent" },
  { key: "color_header", varCouleur: "--color-brand-header", varDegrade: "--gradient-brand-header" },
  { key: "color_footer", varCouleur: "--color-brand-footer", varDegrade: "--gradient-brand-footer" },
];

export default function useTheme() {
  useEffect(() => {
    const cles = [
      ...MAPPING_COULEURS.flatMap((c) => [
        c.key,
        `${c.key}_gradient_enabled`,
        `${c.key}_gradient_end`,
        `${c.key}_gradient_style`,
      ]),
      "font_heading",
    ];

    Promise.all(
      cles.map((key) =>
        fetch(`${API_URL}/api/settings/${key}`)
          .then((res) => res.json())
          .then((data) => [key, data.value]),
      ),
    ).then((entries) => {
      const valeurs = Object.fromEntries(entries);
      const racine = document.documentElement;

      MAPPING_COULEURS.forEach(({ key, varCouleur, varDegrade }) => {
        if (valeurs[key]) racine.style.setProperty(varCouleur, valeurs[key]);

        const fin = valeurs[`${key}_gradient_end`];
        if (valeurs[`${key}_gradient_enabled`] === "true" && valeurs[key] && fin) {
          racine.style.setProperty(
            varDegrade,
            construireDegradeCss(
              valeurs[`${key}_gradient_style`],
              valeurs[key],
              fin,
            ),
          );
        } else {
          racine.style.setProperty(varDegrade, "none");
        }
      });

      if (valeurs.font_heading) {
        racine.style.setProperty(
          "--font-display",
          `"${valeurs.font_heading}", serif`,
        );

        const lien = document.createElement("link");
        lien.rel = "stylesheet";
        lien.href = `https://fonts.googleapis.com/css2?family=${valeurs.font_heading.replace(/ /g, "+")}:wght@400;600&display=swap`;
        document.head.appendChild(lien);
      }
    });
  }, []);
}
