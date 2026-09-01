import { useEffect, useState } from "react";

const ORDRE_JOURS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export default function HorairesTable() {
  const [horaires, setHoraires] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/opening-hours")
      .then((res) => res.json())
      .then((data) => setHoraires(data));
  }, []);

  if (horaires.length === 0) return null;

  const trie = [...horaires].sort(
    (a, b) => ORDRE_JOURS.indexOf(a.day) - ORDRE_JOURS.indexOf(b.day),
  );

  return (
    <div className="text-sm">
      {trie.map((h) => (
        <div
          key={h.id}
          className="flex justify-between py-1.5 border-b border-brand-border/40 last:border-0"
        >
          <span className="font-medium">{h.day}</span>
          <span className="opacity-80">
            {h.open_time && h.close_time
              ? `${h.open_time}–${h.close_time}`
              : "Fermé"}
          </span>
        </div>
      ))}
    </div>
  );
}
