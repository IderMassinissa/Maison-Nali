import { useEffect, useState } from "react";

const CHAMPS = [
  { key: "social_instagram", label: "Lien Instagram" },
  { key: "social_facebook", label: "Lien Facebook" },
  { key: "social_tiktok", label: "Lien TikTok" },
];

export default function GestionReseaux() {
  const [valeurs, setValeurs] = useState({});
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(null);
  const [succes, setSucces] = useState(null);

  useEffect(() => {
    Promise.all(
      CHAMPS.map((c) =>
        fetch(`http://localhost:3001/api/settings/${c.key}`)
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
      const res = await fetch(`http://localhost:3001/api/settings/${key}`, {
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
      <h1 className="font-display text-3xl mb-8">Réseaux sociaux</h1>
      <div className="max-w-lg space-y-6">
        {CHAMPS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
              {label}
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={valeurs[key] || ""}
                onChange={(e) =>
                  setValeurs((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder="https://..."
                className="flex-1 px-4 py-3 border border-brand-border rounded-lg bg-white"
              />
              <button
                onClick={() => sauvegarder(key)}
                disabled={enregistrement === key}
                className="px-6 py-3 bg-brand-dark text-brand-light rounded-full text-xs uppercase tracking-widest disabled:opacity-50"
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
