import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function useSauvegardeBloc(sectionId) {
  const [enregistrement, setEnregistrement] = useState(false);
  const [succes, setSucces] = useState(false);
  const navigate = useNavigate();

  async function sauvegarder(contenu) {
    setEnregistrement(true);
    setSucces(false);

    try {
      const res = await fetch(
        `${API_URL}/api/pages/sections/${sectionId}/content`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: JSON.stringify(contenu) }),
        },
      );
      if (!res.ok) throw new Error("Échec de la sauvegarde");
      setSucces(true);
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      console.error(err);
    } finally {
      setEnregistrement(false);
    }
  }

  return { sauvegarder, enregistrement, succes };
}
