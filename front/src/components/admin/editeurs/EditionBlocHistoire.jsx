import { useState } from "react";
import useSauvegardeBloc from "./SauvegardeBloc";
import EditeurCouleurBloc from "./EditeurCouleurBloc";

const COULEUR_FOND_DEFAUT = "#0d231a";

export default function EditionBlocHistoire({ section }) {
  const contenuInitial = JSON.parse(section.content || "{}");
  const [titre, setTitre] = useState(contenuInitial.titre || "");
  const [texte, setTexte] = useState(contenuInitial.texte || "");
  const [couleur, setCouleur] = useState(contenuInitial.couleur || "");
  const [couleurGradientActif, setCouleurGradientActif] = useState(
    contenuInitial.couleurGradientActif || false,
  );
  const [couleurGradientFin, setCouleurGradientFin] = useState(
    contenuInitial.couleurGradientFin || "",
  );
  const [couleurGradientStyle, setCouleurGradientStyle] = useState(
    contenuInitial.couleurGradientStyle || "",
  );
  const { sauvegarder, enregistrement, succes } = useSauvegardeBloc(section.id);

  function handleSubmit(e) {
    e.preventDefault();
    sauvegarder({
      titre,
      texte,
      couleur,
      couleurGradientActif,
      couleurGradientFin,
      couleurGradientStyle,
    });
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Histoire</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Texte
          </label>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={5}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Couleur de fond de la section
          </label>
          <EditeurCouleurBloc
            label="Fond"
            couleurDefaut={COULEUR_FOND_DEFAUT}
            couleur={couleur}
            gradientActif={couleurGradientActif}
            gradientFin={couleurGradientFin}
            gradientStyle={couleurGradientStyle}
            onChangeCouleur={setCouleur}
            onChangeGradientActif={setCouleurGradientActif}
            onChangeGradientFin={setCouleurGradientFin}
            onChangeGradientStyle={setCouleurGradientStyle}
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
