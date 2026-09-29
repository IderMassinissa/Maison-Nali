import usePageContent from "../hooks/usePageContent";
import usePageSeo from "../hooks/usePageSeo";
import ServiceIndisponible from "../components/ServiceIndisponible";
import { RenduSections } from "../blockRegistry";

const TITRE_REPLI = "Événements";
const DESCRIPTION_REPLI =
  "Maison Nali prépare vos événements sur mesure : mariages, fêtes, cadeaux.";

export default function Evenements() {
  const { sections, chargement, erreur } = usePageContent("evenements");

  const entete = sections.find((s) => s.type === "bloc-entete")?.content;
  usePageSeo(
    `${entete?.titre || TITRE_REPLI} — Maison Nali`,
    (entete?.intro || DESCRIPTION_REPLI).slice(0, 160),
  );

  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  return <RenduSections sections={sections} />;
}
