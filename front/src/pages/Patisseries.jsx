import usePageContent from "../hooks/usePageContent";
import usePageSeo from "../hooks/usePageSeo";
import ServiceIndisponible from "../components/ServiceIndisponible";
import { RenduSections } from "../blockRegistry";

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

  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  return <RenduSections sections={sections} />;
}
