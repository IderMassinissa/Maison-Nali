import { useEffect, useState } from "react";
import EditeurCouleurBloc from "../../components/admin/editeurs/EditeurCouleurBloc";
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

// color_dark / color_light / color_surface / color_border restent en base mais ne
// sont plus des réglages globaux : chaque bloc gère désormais sa propre couleur
// depuis son éditeur (voir front/src/components/admin/editeurs/). Cet onglet ne
// garde que l'accent global et les deux éléments uniques du site (Header, Footer).
const CHAMPS_COULEUR = [
  { key: "color_primary", label: "Couleur primaire (accent doré)", couleurDefaut: "#d4af37" },
  { key: "color_header", label: "Couleur du header", couleurDefaut: "#faf6f0" },
  { key: "color_footer", label: "Couleur du footer", couleurDefaut: "#0b1a14" },
];

export default function GestionTheme() {
  const [valeurs, setValeurs] = useState({});
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(null);
  const [erreurs, setErreurs] = useState({});

  useEffect(() => {
    const cles = [
      ...CHAMPS_COULEUR.flatMap((c) => [
        c.key,
        `${c.key}_gradient_enabled`,
        `${c.key}_gradient_end`,
        `${c.key}_gradient_style`,
      ]),
      "font_heading",
    ];

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
          <div className="space-y-6">
            {CHAMPS_COULEUR.map(({ key, label, couleurDefaut }) => {
              const cleActif = `${key}_gradient_enabled`;
              const cleFin = `${key}_gradient_end`;
              const cleStyle = `${key}_gradient_style`;
              const gradientActif = valeurs[cleActif] === "true";

              return (
                <div key={key}>
                  <EditeurCouleurBloc
                    label={label}
                    couleurDefaut={couleurDefaut}
                    couleur={valeurs[key]}
                    gradientActif={gradientActif}
                    gradientFin={valeurs[cleFin]}
                    gradientStyle={valeurs[cleStyle]}
                    onChangeCouleur={(v) => sauvegarderChamp(key, v)}
                    onChangeGradientActif={(v) =>
                      sauvegarderChamp(cleActif, v ? "true" : "false")
                    }
                    onChangeGradientFin={(v) => sauvegarderChamp(cleFin, v)}
                    onChangeGradientStyle={(v) => sauvegarderChamp(cleStyle, v)}
                  />

                  {(enregistrement === key ||
                    enregistrement === cleActif ||
                    enregistrement === cleFin ||
                    enregistrement === cleStyle) && (
                    <span className="text-xs opacity-60">
                      Enregistrement...
                    </span>
                  )}
                  {(erreurs[key] || erreurs[cleFin] || erreurs[cleStyle]) && (
                    <p className="text-red-600 text-xs mt-1">
                      {erreurs[key] || erreurs[cleFin] || erreurs[cleStyle]}
                    </p>
                  )}
                </div>
              );
            })}
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
