/** Page Adresse : en-tête + bloc boutique (photo, horaires, itinéraire). SEO dérivé du bloc-entête, avec repli fixe si absent. */
import usePageContent from "../hooks/usePageContent";
import usePageSeo from "../hooks/usePageSeo";
import ServiceIndisponible from "../components/ServiceIndisponible";
import ChargementPage from "../components/ChargementPage";
import BlocEntete from "../components/BlocEntete";
import BlocLocalisation from "../components/BlocLocalisation";

const TITRE_REPLI = "Adresse";
const DESCRIPTION_REPLI =
  "Retrouvez Maison Nali à Paris : adresse, horaires et itinéraire.";

export default function Adresse() {
  const { sections, chargement, erreur } = usePageContent("adresse");

  const entete = sections.find((s) => s.type === "bloc-entete")?.content;
  usePageSeo(
    `${entete?.titre || TITRE_REPLI} — Maison Nali`,
    (entete?.intro || DESCRIPTION_REPLI).slice(0, 160),
  );

  if (chargement) return <ChargementPage />;
  if (erreur) return <ServiceIndisponible />;

  const localisation = sections.find(
    (s) => s.type === "bloc-localisation",
  )?.content;

  return (
    <>
      {entete && <BlocEntete {...entete} />}
      <BlocLocalisation {...localisation} />
    </>
  );
}
