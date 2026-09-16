import { useState } from "react";
import useSauvegardeBloc from "./SauvegardeBloc";
import EditeurCouleurBloc from "./EditeurCouleurBloc";

const COULEUR_FOND_DEFAUT = "#f4eee3";

export default function EditionGrillePatisseries({ section }) {
  const contenuInitial = JSON.parse(section.content || "{}");
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
      couleur,
      couleurGradientActif,
      couleurGradientFin,
      couleurGradientStyle,
    });
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Grille Pâtisseries</h1>
      <p className="opacity-70 text-sm max-w-lg mb-8">
        Ce bloc affiche automatiquement vos pâtisseries. Pour ajouter, modifier
        ou retirer une pâtisserie, rendez-vous dans la section « Produits » du
        menu.
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Couleur de fond des cartes
          </label>
          <p className="text-xs opacity-50 mb-3">
            Le dégradé ne s'applique qu'aux cartes grandes et moyennes — les
            petites cartes restent toujours en couleur unie.
          </p>
          <EditeurCouleurBloc
            label="Fond des cartes"
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
