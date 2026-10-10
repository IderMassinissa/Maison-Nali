import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_SITE_URL alimente l'URL canonique, Open Graph et le JSON-LD
  // LocalBusiness (cf. usePageSeo.js, useLocalBusinessSchema.js) ainsi que
  // robots.txt/sitemap.xml (generate-seo-files.js). Mieux vaut un échec
  // explicite au build qu'un retour silencieux sur localhost:5173 en
  // production (même logique que SESSION_SECRET côté back/src/server.js).
  if (mode === "production") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    if (!env.VITE_SITE_URL) {
      throw new Error(
        "VITE_SITE_URL manquant -- obligatoire pour un build de production (URL canonique, Open Graph, sitemap, JSON-LD).",
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
  };
});
