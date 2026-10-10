import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const SITE_URL = (import.meta.env.VITE_SITE_URL || "http://localhost:5173").replace(
  /\/+$/,
  "",
);
const ID_SCRIPT = "schema-local-business";

// Schema.org attend les jours en anglais ("Monday"...), la base stocke les
// jours en français (cf. HorairesTable.jsx) -- correspondance manuelle.
const JOUR_SCHEMA = {
  Lundi: "Monday",
  Mardi: "Tuesday",
  Mercredi: "Wednesday",
  Jeudi: "Thursday",
  Vendredi: "Friday",
  Samedi: "Saturday",
  Dimanche: "Sunday",
};

function majScriptJsonLd(donnees) {
  let balise = document.getElementById(ID_SCRIPT);
  if (!balise) {
    balise = document.createElement("script");
    balise.id = ID_SCRIPT;
    balise.type = "application/ld+json";
    document.head.appendChild(balise);
  }
  balise.textContent = JSON.stringify(donnees);
}

export default function useLocalBusinessSchema() {
  const [reglages, setReglages] = useState({});
  const [horaires, setHoraires] = useState([]);

  useEffect(() => {
    let annule = false;

    // Ces requêtes font doublon avec Footer.jsx/BlocLocalisation.jsx/
    // HorairesTable.jsx (cf. G6, duplication connue et volontairement non
    // corrigée ici). Les lancer au montage les fait entrer en concurrence
    // avec ces mêmes requêtes -- `priority: "low"` seul ne suffit pas :
    // mesuré en pratique, le simulateur réseau de Lighthouse (mode mobile,
    // bande passante partagée entre connexions actives) ralentit d'autant
    // le téléchargement de la grosse image LCP tant que ces petites requêtes
    // sont encore en vol (LCP mobile Adresse/À propos multiplié par 6 à 7,
    // cf. Documentation/A11y_Perf_Passe1_2026-10-09.md). Le JSON-LD n'a
    // aucun impact visuel : un délai de 2s après le montage laisse le temps
    // au contenu critique de la page (texte, image) de démarrer son
    // chargement avant que ces requêtes ne partent.
    const options = { priority: "low" };
    const delai = setTimeout(() => {
      Promise.all(
        [
          "address_text",
          "phone",
          "social_instagram",
          "social_facebook",
          "social_tiktok",
        ].map((cle) =>
          fetch(`${API_URL}/api/settings/${cle}`, options)
            .then((res) => (res.ok ? res.json() : { value: null }))
            .then((data) => [cle, data.value])
            .catch(() => [cle, null]),
        ),
      ).then((entrees) => {
        if (!annule) setReglages(Object.fromEntries(entrees));
      });

      fetch(`${API_URL}/api/opening-hours`, options)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (!annule) setHoraires(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!annule) setHoraires([]);
        });
    }, 2000);

    return () => {
      annule = true;
      clearTimeout(delai);
    };
  }, []);

  useEffect(() => {
    const sameAs = [
      reglages.social_instagram,
      reglages.social_facebook,
      reglages.social_tiktok,
    ].filter(Boolean);

    const openingHoursSpecification = horaires
      .filter((h) => h.open_time && h.close_time && JOUR_SCHEMA[h.day])
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: JOUR_SCHEMA[h.day],
        opens: h.open_time,
        closes: h.close_time,
      }));

    majScriptJsonLd({
      "@context": "https://schema.org",
      "@type": "Bakery",
      name: "Maison Nali",
      url: SITE_URL,
      ...(reglages.address_text && { address: reglages.address_text }),
      ...(reglages.phone && { telephone: reglages.phone }),
      ...(sameAs.length > 0 && { sameAs }),
      ...(openingHoursSpecification.length > 0 && {
        openingHoursSpecification,
      }),
    });
  }, [reglages, horaires]);
}
