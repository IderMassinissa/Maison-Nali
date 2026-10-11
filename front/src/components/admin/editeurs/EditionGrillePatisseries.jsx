/** Écran informatif : ce bloc n'a pas de contenu propre à éditer, il affiche directement la table "Produits" — renvoie simplement vers cette section du menu. */
export default function EditionGrillePatisseries() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Grille Pâtisseries</h1>
      <p className="opacity-70 text-sm max-w-lg">
        Ce bloc affiche automatiquement vos pâtisseries. Pour ajouter, modifier
        ou retirer une pâtisserie, rendez-vous dans la section « Produits » du
        menu.
      </p>
    </div>
  );
}
