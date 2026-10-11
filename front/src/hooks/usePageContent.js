/**
 * Charge une page publique par son slug (GET /api/pages/:slug) et reparse
 * le `content` JSON de chaque section (stocké en base comme une chaîne
 * brute) en objet, pour que les composants de page n'aient jamais à faire
 * ce parsing eux-mêmes.
 */
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function usePageContent(slug) {
  const [sections, setSections] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/pages/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Réponse API non ok");
        return res.json();
      })
      .then((data) => {
        const parsees = (data.sections || []).map((s) => ({
          id: s.id,
          type: s.type,
          content: JSON.parse(s.content || "{}"),
        }));
        setSections(parsees);
        setErreur(false);
      })
      .catch((err) => {
        console.error("Erreur usePageContent:", err);
        setErreur(true);
      })
      .finally(() => setChargement(false));
  }, [slug]);

  return { sections, chargement, erreur };
}
