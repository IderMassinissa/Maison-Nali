/**
 * Formulaire admin du bloc Événements : liste de formats de boîtes en
 * texte libre, une ligne par format, "nom|détail" optionnel (parsé côté
 * public par BlocEvenements.jsx — même format des deux côtés).
 */
import { useState } from "react";
import useSauvegardeBloc from "../../../hooks/useSauvegardeBloc";
import { parseContenuSection } from "../../../utils/parseContenuSection";

export default function EditionBlocEvenements({ section }) {
  const contenuInitial = parseContenuSection(section.content);
  const [formats, setFormats] = useState(contenuInitial.formats || "");
  const { sauvegarder, enregistrement, succes } = useSauvegardeBloc(section.id);

  function handleSubmit(e) {
    e.preventDefault();
    sauvegarder({ formats });
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Événements</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label
            htmlFor="evenements-formats"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Formats de boîtes
          </label>
          <textarea
            id="evenements-formats"
            value={formats}
            onChange={(e) => setFormats(e.target.value)}
            rows={5}
            maxLength={1000}
            placeholder={"Boîte de 6 pièces\nBoîte de 12 pièces"}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
          <p className="text-xs opacity-70 mt-2">
            Un format de boîte par ligne. Pour ajouter un détail (nombre de
            pièces, occasion...), sépare-le du nom avec une barre verticale
            « | ». Exemple : Boîte de 6 pièces | Idéal pour offrir
          </p>
        </div>
        <button
          type="submit"
          disabled={enregistrement}
          className="px-8 py-3 bg-brand-dark text-brand-accent rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
        >
          {enregistrement ? "Enregistrement..." : "Enregistrer"}
        </button>
        {succes && <p className="text-green-600 text-sm">Enregistré !</p>}
      </form>
    </div>
  );
}
