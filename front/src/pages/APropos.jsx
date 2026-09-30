import usePageContent from "../hooks/usePageContent";
import usePageSeo from "../hooks/usePageSeo";
import ServiceIndisponible from "../components/ServiceIndisponible";
import BlocEntete from "../components/BlocEntete";
import BlocHistoire from "../components/BlocHistoire";

const TITRE_REPLI = "À propos";
const DESCRIPTION_REPLI = "L'histoire et le savoir-faire de Maison Nali.";

export default function APropos() {
  const { sections, chargement, erreur } = usePageContent("a-propos");

  const entete = sections.find((s) => s.type === "bloc-entete")?.content;
  usePageSeo(
    `${entete?.titre || TITRE_REPLI} — Maison Nali`,
    (entete?.intro || DESCRIPTION_REPLI).slice(0, 160),
  );

  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  const histoire = sections.find((s) => s.type === "bloc-histoire")?.content;

  return (
    <>
      {entete && <BlocEntete {...entete} />}
      <BlocHistoire {...histoire} fondSombre={false} />
    </>
  );
}
