import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const ORDRE_JOURS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export default function EditionBlocLocalisation() {
  const [adresse, setAdresse] = useState("");
  const [enregistrementAdresse, setEnregistrementAdresse] = useState(false);
  const [succesAdresse, setSuccesAdresse] = useState(false);

  const [horaires, setHoraires] = useState([]);
  const [chargementHoraires, setChargementHoraires] = useState(true);
  const [enregistrementHoraire, setEnregistrementHoraire] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/settings/address_text`)
      .then((res) => res.json())
      .then((data) => setAdresse(data.value || ""));

    fetch(`${API_URL}/api/opening-hours`)
      .then((res) => res.json())
      .then((data) => {
        const trie = [...data].sort(
          (a, b) => ORDRE_JOURS.indexOf(a.day) - ORDRE_JOURS.indexOf(b.day),
        );
        setHoraires(trie);
      })
      .finally(() => setChargementHoraires(false));
  }, []);

  async function handleSubmitAdresse(e) {
    e.preventDefault();
    setEnregistrementAdresse(true);
    setSuccesAdresse(false);
    try {
      const res = await fetch(`${API_URL}/api/settings/address_text`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value: adresse }),
      });
      if (res.ok) setSuccesAdresse(true);
    } finally {
      setEnregistrementAdresse(false);
    }
  }

  async function sauvegarderHoraire(id, openTime, closeTime) {
    setEnregistrementHoraire(id);
    try {
      await fetch(`${API_URL}/api/opening-hours/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ openTime, closeTime }),
      });
    } finally {
      setEnregistrementHoraire(null);
    }
  }

  function handleChangeHoraire(id, champ, valeur) {
    setHoraires((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [champ]: valeur } : h)),
    );
  }

  function handleBlurHoraire(horaire) {
    sauvegarderHoraire(horaire.id, horaire.open_time, horaire.close_time);
  }

  function handleFermeHoraire(horaire, ferme) {
    const nouvel = ferme
      ? { ...horaire, open_time: null, close_time: null }
      : { ...horaire, open_time: "11:00", close_time: "19:00" };
    setHoraires((prev) => prev.map((h) => (h.id === horaire.id ? nouvel : h)));
    sauvegarderHoraire(horaire.id, nouvel.open_time, nouvel.close_time);
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Localisation</h1>
      <p className="text-xs opacity-60 mb-6">
        L'adresse et les horaires sont communs à tout le site — les modifier ici
        les met à jour partout où ils apparaissent.
      </p>

      <form onSubmit={handleSubmitAdresse} className="max-w-lg space-y-4 mb-12">
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Adresse
          </label>
          <textarea
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={enregistrementAdresse}
          className="px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
        >
          {enregistrementAdresse ? "Enregistrement..." : "Enregistrer"}
        </button>
        {succesAdresse && (
          <p className="text-green-600 text-sm">Enregistré !</p>
        )}
      </form>

      <div className="max-w-lg">
        <p className="text-xs uppercase tracking-widest opacity-60 mb-4">
          Horaires d'ouverture
        </p>
        {chargementHoraires ? (
          <p className="text-sm opacity-60">Chargement...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {horaires.map((horaire) => {
              const ferme = !horaire.open_time && !horaire.close_time;
              return (
                <div
                  key={horaire.id}
                  className="flex items-center gap-4 p-4 bg-white border border-brand-border rounded-xl"
                >
                  <span className="w-24 text-sm font-medium">
                    {horaire.day}
                  </span>
                  {ferme ? (
                    <span className="flex-1 text-sm opacity-60">Fermé</span>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="time"
                        value={horaire.open_time || ""}
                        onChange={(e) =>
                          handleChangeHoraire(
                            horaire.id,
                            "open_time",
                            e.target.value,
                          )
                        }
                        onBlur={() =>
                          handleBlurHoraire(
                            horaires.find((h) => h.id === horaire.id),
                          )
                        }
                        className="px-3 py-2 border border-brand-border rounded-lg text-sm"
                      />
                      <span className="opacity-50">à</span>
                      <input
                        type="time"
                        value={horaire.close_time || ""}
                        onChange={(e) =>
                          handleChangeHoraire(
                            horaire.id,
                            "close_time",
                            e.target.value,
                          )
                        }
                        onBlur={() =>
                          handleBlurHoraire(
                            horaires.find((h) => h.id === horaire.id),
                          )
                        }
                        className="px-3 py-2 border border-brand-border rounded-lg text-sm"
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ferme}
                      onChange={(e) =>
                        handleFermeHoraire(horaire, e.target.checked)
                      }
                    />
                    Fermé
                  </label>
                  {enregistrementHoraire === horaire.id && (
                    <span className="text-xs opacity-50">...</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
