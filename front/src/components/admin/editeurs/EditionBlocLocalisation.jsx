import { useState } from "react";
import useSauvegardeBloc from "./SauvegardeBloc";

export default function EditionBlocLocalisation({ section }) {
  const contenuInitial = JSON.parse(section.content || "{}");
  const [adresse, setAdresse] = useState(contenuInitial.adresse || "");
  const [horaires, setHoraires] = useState(contenuInitial.horaires || "");
  const { sauvegarder, enregistrement, succes } = useSauvegardeBloc(section.id);

  function handleSubmit(e) {
    e.preventDefault();
    sauvegarder({ adresse, horaires });
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Localisation</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
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
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Horaires (résumé affiché)
          </label>
          <textarea
            value={horaires}
            onChange={(e) => setHoraires(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
          />
        </div>
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
