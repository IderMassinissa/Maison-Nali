import { useEffect, useState } from "react";

export default function usePageContent(slug) {
  const [sections, setSections] = useState({});
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/pages/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        const parSection = {};
        (data.sections || []).forEach((s) => {
          parSection[s.type] = JSON.parse(s.content || "{}");
        });
        setSections(parSection);
      })
      .finally(() => setChargement(false));
  }, [slug]);

  return { sections, chargement };
}
