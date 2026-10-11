/**
 * Affiché pendant le chargement du contenu d'une page (usePageContent /
 * fetch produit). Réserve une hauteur proche de celle du contenu réel une
 * fois chargé, pour que le pied de page ne saute pas brutalement vers le
 * bas à l'arrivée des données — le décalage de mise en page vient de la
 * transition "aucun contenu affiché" -> "contenu réel", pas des polices.
 */
export default function ChargementPage() {
  return <div className="min-h-screen" aria-hidden="true" />;
}
