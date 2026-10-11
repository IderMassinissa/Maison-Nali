/**
 * Formulaire admin des coordonnées (adresse, téléphone, réseaux sociaux),
 * un champ `settings` par ligne — chaque champ se sauvegarde
 * indépendamment des autres (son propre bouton, son propre état
 * enregistrement/succès), pas un seul submit global.
 */
import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const CHAMPS = [
  { key: "address_text", label: "Adresse", type: "textarea" },
  { key: "phone", label: "Téléphone", type: "tel", placeholder: "01 86 04 43 34" },
  { key: "social_instagram", label: "Lien Instagram", type: "url", placeholder: "https://..." },
  { key: "social_facebook", label: "Lien Facebook", type: "url", placeholder: "https://..." },
  { key: "social_tiktok", label: "Lien TikTok", type: "url", placeholder: "https://..." },
];

export default function GestionReseaux() {
  const [valeurs, setValeurs] = useState({});
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(null);
  const [succes, setSucces] = useState(null);

  useEffect(() => {
    Promise.all(
      CHAMPS.map((c) =>
        fetch(`${API_URL}/api/settings/${c.key}`)
          .then((res) => res.json())
          .then((data) => [c.key, data.value || ""]),
      ),
    ).then((entries) => {
      setValeurs(Object.fromEntries(entries));
      setChargement(false);
    });
  }, []);

  async function sauvegarder(key) {
    setEnregistrement(key);
    setSucces(null);
    try {
      const res = await fetch(`${API_URL}/api/settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value: valeurs[key] }),
      });
      if (res.ok) setSucces(key);
    } finally {
      setEnregistrement(null);
    }
  }

  if (chargement) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Coordonnées</h1>
      <div className="max-w-2xl space-y-6">
        {CHAMPS.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label
              htmlFor={`reseau-${key}`}
              className="block text-sm uppercase tracking-widest opacity-70 mb-2"
            >
              {label}
            </label>
            <div className="flex gap-3">
              {type === "textarea" ? (
                <textarea
                  id={`reseau-${key}`}
                  value={valeurs[key] || ""}
                  onChange={(e) =>
                    setValeurs((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  rows={3}
                  className="flex-1 min-w-0 px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
                />
              ) : (
                <input
                  id={`reseau-${key}`}
                  type={type}
                  value={valeurs[key] || ""}
                  onChange={(e) =>
                    setValeurs((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className="flex-1 min-w-0 px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
                />
              )}
              <button
                onClick={() => sauvegarder(key)}
                disabled={enregistrement === key}
                className="px-6 py-3 bg-brand-dark text-brand-accent rounded-full text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {enregistrement === key ? "..." : "Enregistrer"}
              </button>
            </div>
            {succes === key && (
              <p className="text-green-600 text-xs mt-1">Enregistré !</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
