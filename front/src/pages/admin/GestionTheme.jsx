import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const POLICES_AUTORISEES = [
  "Cormorant Garamond",
  "Playfair Display",
  "Marcellus",
  "Cinzel",
  "EB Garamond",
  "Inter",
  "Work Sans",
  "Jost",
  "Nunito Sans",
];

const CHAMPS_COULEUR = [
  { key: "color_primary", label: "Couleur primaire (accent doré)" },
  { key: "color_dark", label: "Couleur foncée (fonds sombres)" },
  { key: "color_light", label: "Couleur claire (fond principal)" },
  { key: "color_surface", label: "Couleur surface (cartes, sections)" },
  { key: "color_border", label: "Couleur des bordures" },
];

export default function GestionTheme() {
  const [valeurs, setValeurs] = useState({});
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(null);
  const [erreurs, setErreurs] = useState({});

  useEffect(() => {
    const cles = [...CHAMPS_COULEUR.map((c) => c.key), "font_heading"];

    Promise.all(
      cles.map((key) =>
        fetch(`${API_URL}/api/settings/${key}`)
          .then((res) => res.json())
          .then((data) => [key, data.value]),
      ),
    ).then((entries) => {
      setValeurs(Object.fromEntries(entries));
      setChargement(false);
    });
  }, []);

  async function sauvegarderChamp(key, value) {
    setEnregistrement(key);
    setErreurs((prev) => ({ ...prev, [key]: "" }));

    try {
      const res = await fetch(`${API_URL}/api/settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErreurs((prev) => ({ ...prev, [key]: data.error }));
        setEnregistrement(null);
        return;
      }

      setValeurs((prev) => ({ ...prev, [key]: value }));
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      console.error(err);
      setErreurs((prev) => ({ ...prev, [key]: "Erreur réseau" }));
      setEnregistrement(null);
    }
  }

  if (chargement) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Thème du site</h1>

      <div className="max-w-lg space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-4">
            Couleurs
          </p>
          <div className="space-y-4">
            {CHAMPS_COULEUR.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm mb-2">{label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue={valeurs[key] || "#000000"}
                    onChange={(e) => sauvegarderChamp(key, e.target.value)}
                    className="w-12 h-12 rounded-lg border border-brand-border cursor-pointer"
                  />
                  <span className="text-sm font-mono">{valeurs[key]}</span>
                  {enregistrement === key && (
                    <span className="text-xs opacity-60">
                      Enregistrement...
                    </span>
                  )}
                </div>
                {erreurs[key] && (
                  <p className="text-red-600 text-xs mt-1">{erreurs[key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-4">
            Typographie
          </p>
          <label className="block text-sm mb-2">Police des titres</label>
          <select
            value={valeurs.font_heading || POLICES_AUTORISEES[0]}
            onChange={(e) => sauvegarderChamp("font_heading", e.target.value)}
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white mb-3"
          >
            {POLICES_AUTORISEES.map((police) => (
              <option key={police} value={police}>
                {police}
              </option>
            ))}
          </select>
          <p
            style={{
              fontFamily: valeurs.font_heading || POLICES_AUTORISEES[0],
            }}
            className="text-3xl px-4 py-6 bg-white border border-brand-border rounded-lg"
          >
            Maison Nali — Aperçu
          </p>
          {enregistrement === "font_heading" && (
            <p className="text-xs opacity-60 mt-1">Enregistrement...</p>
          )}
          {erreurs.font_heading && (
            <p className="text-red-600 text-xs mt-1">{erreurs.font_heading}</p>
          )}
        </div>
      </div>
    </div>
  );
}
