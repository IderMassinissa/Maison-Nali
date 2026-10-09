import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "http://localhost:5173").replace(
  /\/+$/,
  "",
);
const IMAGE_PAR_DEFAUT = "/images/Prendre Le Thé.webp";

function urlAbsolue(chemin) {
  if (chemin.startsWith("http://") || chemin.startsWith("https://")) {
    return chemin;
  }
  return `${SITE_URL}${encodeURI(chemin)}`;
}

function majMetaNom(nom, contenu) {
  let balise = document.querySelector(`meta[name="${nom}"]`);
  if (!balise) {
    balise = document.createElement("meta");
    balise.setAttribute("name", nom);
    document.head.appendChild(balise);
  }
  balise.setAttribute("content", contenu);
}

function majMetaPropriete(propriete, contenu) {
  let balise = document.querySelector(`meta[property="${propriete}"]`);
  if (!balise) {
    balise = document.createElement("meta");
    balise.setAttribute("property", propriete);
    document.head.appendChild(balise);
  }
  balise.setAttribute("content", contenu);
}

function majLienCanonical(href) {
  let balise = document.querySelector('link[rel="canonical"]');
  if (!balise) {
    balise = document.createElement("link");
    balise.setAttribute("rel", "canonical");
    document.head.appendChild(balise);
  }
  balise.setAttribute("href", href);
}

export default function usePageSeo(title, description, options = {}) {
  const { pathname } = useLocation();
  const image = options.image;

  useEffect(() => {
    document.title = title;
    majMetaNom("description", description);

    const urlCanonique = `${SITE_URL}${pathname}`;
    majLienCanonical(urlCanonique);

    majMetaPropriete("og:title", title);
    majMetaPropriete("og:description", description);
    majMetaPropriete("og:type", "website");
    majMetaPropriete("og:url", urlCanonique);
    majMetaPropriete("og:image", urlAbsolue(image || IMAGE_PAR_DEFAUT));
  }, [title, description, image, pathname]);
}
