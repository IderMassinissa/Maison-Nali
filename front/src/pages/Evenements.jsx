import usePageContent from "../hooks/usePageContent";
import usePageSeo from "../hooks/usePageSeo";
import ServiceIndisponible from "../components/ServiceIndisponible";
import ChargementPage from "../components/ChargementPage";
import BlocEntete from "../components/BlocEntete";
import Hero from "../components/Hero";
import BlocEvenements from "../components/BlocEvenements";

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

  if (chargement) return <ChargementPage />;
  if (erreur) return <ServiceIndisponible />;

  const evenements = sections.find(
    (s) => s.type === "bloc-evenements",
  )?.content;
  const hero = sections.find((s) => s.type === "hero")?.content;

  return (
    <>
      <Hero {...hero} estPremier={true} />
      {entete && <BlocEntete {...entete} estPremier={false} />}
      <BlocEvenements {...evenements} />
    </>
  );
}
