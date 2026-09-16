import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function usePageContent(slug) {
  const [sections, setSections] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/pages/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        const parsees = (data.sections || []).map((s) => ({
          id: s.id,
          type: s.type,
          content: JSON.parse(s.content || "{}"),
        }));
        setSections(parsees);
      })
      .finally(() => setChargement(false));
  }, [slug]);

  return { sections, chargement };
}
