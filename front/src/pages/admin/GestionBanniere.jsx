import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function GestionBanniere() {
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/announcements`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setMessage(data.message || "");
          setActive(!!data.active);
        }
      })
      .finally(() => setChargement(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnregistrement(true);
    setSucces(false);

    try {
      const res = await fetch(`${API_URL}/api/announcements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, active }),
      });
      if (!res.ok) throw new Error("Échec de la sauvegarde");
      setSucces(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setEnregistrement(false);
    }
  }

  if (chargement) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bannière d'annonce</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="banniere-active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-5 h-5"
          />
          <label htmlFor="banniere-active" className="text-sm">
            Afficher la bannière sur le site
          </label>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Message
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ex : Fermé pour l'Aïd, réouverture le..."
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
          />
        </div>

        {message && (
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-2">
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
          className="px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
        >
          {enregistrement ? "Enregistrement..." : "Enregistrer"}
        </button>
        {succes && <p className="text-green-600 text-sm">Enregistré !</p>}
      </form>
    </div>
  );
}
