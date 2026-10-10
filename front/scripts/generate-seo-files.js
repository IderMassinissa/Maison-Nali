// Génère robots.txt et sitemap.xml dans dist/ après le build (lancé par
// `npm run build`, cf. package.json). Les deux fichiers dépendent de
// VITE_SITE_URL -- jamais de domaine en dur dans le code, pour que le
// build reste identique quel que soit l'environnement de déploiement.
//
// Nécessaire car en dev/preview, Vite sert index.html (du HTML) pour
// n'importe quelle URL non reconnue -- y compris /robots.txt et
// /sitemap.xml, qui "répondaient" 200 sans jamais exister réellement (cf.
// Documentation/A11y_Perf_Passe1_2026-10-09.md, H1).
import { loadEnv } from "vite";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// mode "production" : lit .env et .env.production s'il existe, comme le
// ferait `vite build`.
const env = loadEnv("production", racine, "VITE_");

if (!env.VITE_SITE_URL) {
  console.error(
    "VITE_SITE_URL manquant -- obligatoire pour générer robots.txt/sitemap.xml en production.",
  );
  process.exit(1);
}

const siteUrl = env.VITE_SITE_URL.replace(/\/+$/, "");

const ROUTES_PUBLIQUES = [
  "/",
  "/patisseries",
  "/a-propos",
  "/adresse",
  "/evenements",
  "/mentions-legales",
];

const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ROUTES_PUBLIQUES.map(
    (route) => `  <url>\n    <loc>${siteUrl}${route}</loc>\n  </url>`,
  ).join("\n") +
  `\n</urlset>\n`;

const distDir = path.join(racine, "dist");
writeFileSync(path.join(distDir, "robots.txt"), robots);
writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);

console.log(`robots.txt et sitemap.xml générés (VITE_SITE_URL=${siteUrl})`);
