import { useState } from "react";
import useSauvegardeBloc from "./SauvegardeBloc";

export default function EditionBlocReseaux({ section }) {
  const contenuInitial = JSON.parse(section.content || "{}");
  const [instagram, setInstagram] = useState(contenuInitial.instagram || "");
  const [facebook, setFacebook] = useState(contenuInitial.facebook || "");
  const { sauvegarder, enregistrement, succes } = useSauvegardeBloc(section.id);

  function handleSubmit(e) {
    e.preventDefault();
    sauvegarder({ instagram, facebook });
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Réseaux sociaux</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Lien Instagram
          </label>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/..."
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Lien Facebook
          </label>
          <input
            type="url"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/..."
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
