// Affiché pendant le chargement du contenu d'une page (usePageContent /
// fetch produit). Réserve une hauteur proche de celle du contenu réel une
// fois chargé, pour que le pied de page ne saute pas brutalement vers le
// bas à l'arrivée des données -- cause du CLS élevé mesurée et confirmée
// (cf. Documentation/A11y_Perf_Passe1_2026-10-09.md, A2) : le décalage
// vient de la transition "aucun contenu affiché" -> "contenu réel", pas
// des polices (testé et écarté).
export default function ChargementPage() {
  return <div className="min-h-screen" aria-hidden="true" />;
}
