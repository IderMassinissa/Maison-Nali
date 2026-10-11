/**
 * Route générique d'édition d'un bloc : charge la section par id puis
 * délègue au formulaire correspondant à son `type` (EDITEURS). `key={id}`
 * sur le wrapper force un remount complet au changement d'id (navigation
 * d'un bloc à l'autre) plutôt que de réutiliser l'état React du formulaire
 * précédent.
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EditionHero from "../../components/admin/editeurs/EditionHero";
import EditionGrillePatisseries from "../../components/admin/editeurs/EditionGrillePatisseries";
import EditionBlocHistoire from "../../components/admin/editeurs/EditionBlocHistoire";
import EditionBlocLocalisation from "../../components/admin/editeurs/EditionBlocLocalisation";
import EditionBlocEvenements from "../../components/admin/editeurs/EditionBlocEvenements";
import EditionBlocEntete from "../../components/admin/editeurs/EditionBlocEntete";
const API_URL = import.meta.env.VITE_API_URL;

const EDITEURS = {
  hero: EditionHero,
  "bloc-patisseries": EditionGrillePatisseries,
  "bloc-histoire": EditionBlocHistoire,
  "bloc-localisation": EditionBlocLocalisation,
  "bloc-evenements": EditionBlocEvenements,
  "bloc-entete": EditionBlocEntete,
};

export default function EditionBloc() {
  const { id } = useParams();
  return <ChargeurBloc key={id} id={id} />;
}

function ChargeurBloc({ id }) {
  const [section, setSection] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/pages/sections/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Bloc introuvable");
        return res.json();
      })
      .then((data) => setSection(data))
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <p>Chargement...</p>;
  if (erreur) return <p className="text-red-600">{erreur}</p>;

  const Editeur = EDITEURS[section.type];
  if (!Editeur)
    return (
      <p className="text-red-600">Type de bloc inconnu : {section.type}</p>
    );

  return <Editeur section={section} />;
}
