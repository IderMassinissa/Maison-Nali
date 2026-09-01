import { useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function useTheme() {
  useEffect(() => {
    const cles = [
      "color_primary",
      "color_dark",
      "color_light",
      "color_surface",
      "color_border",
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

      if (valeurs.color_primary)
        racine.style.setProperty("--color-brand-accent", valeurs.color_primary);
      if (valeurs.color_dark)
        racine.style.setProperty("--color-brand-dark", valeurs.color_dark);
      if (valeurs.color_light)
        racine.style.setProperty("--color-brand-light", valeurs.color_light);
      if (valeurs.color_surface)
        racine.style.setProperty(
          "--color-brand-surface",
          valeurs.color_surface,
        );
      if (valeurs.color_border)
        racine.style.setProperty("--color-brand-border", valeurs.color_border);
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
