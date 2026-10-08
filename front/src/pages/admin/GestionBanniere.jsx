import { useEffect, useState } from "react";
import { statutBanniere } from "../../utils/bannerStatus";
const API_URL = import.meta.env.VITE_API_URL;

export default function GestionBanniere() {
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statut, setStatut] = useState("Désactivée");
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState("");

  function chargerAnnonce() {
    return fetch(`${API_URL}/api/announcements/admin`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMessage(data.message || "");
          setActive(!!data.active);
          setStartDate(data.start_date || "");
          setEndDate(data.end_date || "");
          setStatut(statutBanniere(data));
        }
      });
  }

  useEffect(() => {
    chargerAnnonce().finally(() => setChargement(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnregistrement(true);
    setSucces(false);
    setErreur("");

    try {
      const res = await fetch(`${API_URL}/api/announcements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, active, startDate, endDate }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErreur(data.error || "Échec de la sauvegarde");
        return;
      }

      setSucces(true);
      await chargerAnnonce();
    } catch {
      setErreur("Impossible de contacter le serveur");
    } finally {
      setEnregistrement(false);
    }
  }

  if (chargement) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bannière d'annonce</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="banniere-active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-5 h-5"
          />
          <label htmlFor="banniere-active" className="text-base">
            Afficher la bannière sur le site
          </label>
        </div>

        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Message
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ex : Fermé pour l'Aïd, réouverture le..."
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
              Début
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 min-w-0 px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
              />
              {startDate && (
                <button
                  type="button"
                  onClick={() => setStartDate("")}
                  className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
              Fin
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 min-w-0 px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
              />
              {endDate && (
                <button
                  type="button"
                  onClick={() => setEndDate("")}
                  className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs opacity-60">
          Les dates sont en heure de Paris, début et fin inclus. Laisse vide
          pour une bannière sans limite de durée.
        </p>

        <div>
          <p className="text-sm uppercase tracking-widest opacity-60 mb-2">
            Statut
          </p>
          <p className="text-sm">{statut}</p>
        </div>

        {message && (
          <div>
            <p className="text-sm uppercase tracking-widest opacity-60 mb-2">
              Aperçu
            </p>
            <div className="bg-brand-accent text-brand-dark text-center py-3 px-4 text-sm font-medium rounded-lg">
              {message}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={enregistrement}
          className="px-8 py-3 bg-brand-dark text-brand-accent rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
        >
          {enregistrement ? "Enregistrement..." : "Enregistrer"}
        </button>
        {succes && <p className="text-green-600 text-sm">Enregistré !</p>}
        {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      </form>
    </div>
  );
}
