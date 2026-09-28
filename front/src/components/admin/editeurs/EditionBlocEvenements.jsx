import { useState } from "react";
import useSauvegardeBloc from "./SauvegardeBloc";

export default function EditionBlocEvenements({ section }) {
  const contenuInitial = JSON.parse(section.content || "{}");
  const [titre, setTitre] = useState(contenuInitial.titre || "");
  const [intro, setIntro] = useState(contenuInitial.intro || "");
  const [formats, setFormats] = useState(contenuInitial.formats || "");
  const { sauvegarder, enregistrement, succes } = useSauvegardeBloc(section.id);

  function handleSubmit(e) {
    e.preventDefault();
    sauvegarder({ titre, intro, formats });
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Événements</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            maxLength={100}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Introduction
          </label>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={5}
            maxLength={1000}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Formats de boîtes
          </label>
          <textarea
            value={formats}
            onChange={(e) => setFormats(e.target.value)}
            rows={5}
            maxLength={1000}
            placeholder={"Boîte de 6 pièces\nBoîte de 12 pièces"}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
          <p className="text-xs opacity-60 mt-2">
            Un format par ligne. Pour ajouter un détail, écris : Nom |
            détail. Exemple : Boîte de 6 pièces | Pour offrir
          </p>
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
