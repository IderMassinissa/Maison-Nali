/**
 * Formulaire admin d'édition d'un bloc-entête (libellé, titre, intro).
 * Lit le contenu initial depuis `section.content` (JSON brut en base),
 * sauvegarde via useSauvegardeBloc. Limites de longueur alignées sur
 * celles de back/src/utils/validateSectionContent.js.
 */
import { useState } from "react";
import useSauvegardeBloc from "../../../hooks/useSauvegardeBloc";
import { parseContenuSection } from "../../../utils/parseContenuSection";

export default function EditionBlocEntete({ section }) {
  const contenuInitial = parseContenuSection(section.content);
  const [libelle, setLibelle] = useState(contenuInitial.libelle || "");
  const [titre, setTitre] = useState(contenuInitial.titre || "");
  const [intro, setIntro] = useState(contenuInitial.intro || "");
  const { sauvegarder, enregistrement, succes, erreur } =
    useSauvegardeBloc(section.id);

  function handleSubmit(e) {
    e.preventDefault();
    sauvegarder({ libelle, titre, intro });
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc En-tête</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label
            htmlFor="entete-libelle"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Libellé (optionnel)
          </label>
          <input
            id="entete-libelle"
            type="text"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            maxLength={60}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label
            htmlFor="entete-titre"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Titre
          </label>
          <input
            id="entete-titre"
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
            maxLength={100}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label
            htmlFor="entete-intro"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Introduction (optionnelle)
          </label>
          <textarea
            id="entete-intro"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={3}
            maxLength={300}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <button
          type="submit"
          disabled={enregistrement}
          className="px-8 py-3 bg-brand-dark text-brand-accent rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
        >
          {enregistrement ? "Enregistrement..." : "Enregistrer"}
        </button>
        {succes && <p className="text-green-600 text-sm">Enregistré !</p>}
        {erreur && (
          <p role="alert" className="text-red-600 text-sm">
            {erreur}
          </p>
        )}
      </form>
    </div>
  );
}
