import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function ChangerMotDePasse() {
  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    setSucces(false);

    if (nouveauMotDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas");
      return;
    }

    setEnregistrement(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ancienMotDePasse, nouveauMotDePasse }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErreur(data.error);
        return;
      }

      setSucces(true);
      setAncienMotDePasse("");
      setNouveauMotDePasse("");
      setConfirmation("");
    } catch (err) {
      console.error(err);
      setErreur("Erreur réseau");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Changer mon mot de passe</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label
            htmlFor="mdp-actuel"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Mot de passe actuel
          </label>
          <input
            id="mdp-actuel"
            type="password"
            value={ancienMotDePasse}
            onChange={(e) => setAncienMotDePasse(e.target.value)}
            required
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label
            htmlFor="mdp-nouveau"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Nouveau mot de passe
          </label>
          <input
            id="mdp-nouveau"
            type="password"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            required
            minLength={8}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label
            htmlFor="mdp-confirmation"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Confirmer le nouveau mot de passe
          </label>
          <input
            id="mdp-confirmation"
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>

        {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
        {succes && (
          <p className="text-green-600 text-sm">Mot de passe mis à jour !</p>
        )}

        <button
          type="submit"
          disabled={enregistrement}
          className="px-8 py-3 bg-brand-dark text-brand-accent rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
        >
          {enregistrement ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
