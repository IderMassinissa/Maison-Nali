/** Page catalogue : Hero, en-tête, puis grille de produits (chargée séparément par GrillePatisseries). SEO dérivé du bloc-entête, avec repli fixe si absent. */
import usePageContent from "../hooks/usePageContent";
import usePageSeo from "../hooks/usePageSeo";
import ServiceIndisponible from "../components/ServiceIndisponible";
import ChargementPage from "../components/ChargementPage";
import BlocEntete from "../components/BlocEntete";
import Hero from "../components/Hero";
import GrillePatisseries from "../components/GrillePatisseries";

const TITRE_REPLI = "Nos Pâtisseries";
const DESCRIPTION_REPLI =
  "Découvrez notre collection de pâtisseries algériennes artisanales.";

export default function Patisseries() {
  const { sections, chargement, erreur } = usePageContent("patisseries");

  const entete = sections.find((s) => s.type === "bloc-entete")?.content;
  usePageSeo(
    `${entete?.titre || TITRE_REPLI} — Maison Nali`,
    (entete?.intro || DESCRIPTION_REPLI).slice(0, 160),
  );

  if (chargement) return <ChargementPage />;
  if (erreur) return <ServiceIndisponible />;

  const hero = sections.find((s) => s.type === "hero")?.content;

  return (
    <>
      <Hero {...hero} estPremier={true} />
      {entete && <BlocEntete {...entete} estPremier={false} />}
      <GrillePatisseries />
    </>
  );
}
