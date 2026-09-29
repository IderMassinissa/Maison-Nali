import { useEffect, useState } from "react";
import usePageSeo from "../hooks/usePageSeo";

const API_URL = import.meta.env.VITE_API_URL;
const TELEPHONE_REPLI = "information momentanément indisponible";

export default function MentionsLegales() {
  usePageSeo(
    "Mentions légales — Maison Nali",
    "Informations légales de Maison Nali : éditeur du site, hébergement, propriété intellectuelle.",
  );

  const [telephone, setTelephone] = useState(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/settings/phone`)
      .then((res) => {
        if (!res.ok) throw new Error("Réponse API non ok");
        return res.json();
      })
      .then((data) => setTelephone(data.value || ""))
      .catch(() => setErreur(true));
  }, []);

  return (
    <div className="px-6 md:px-12 py-24 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-12">
        Mentions légales
      </h1>

      <div className="space-y-8 text-sm leading-relaxed opacity-80">
        <section>
          <h2 className="font-display text-xl mb-3 opacity-100">
            Éditeur du site
          </h2>
          <p>
            Maison Nali
            <br />
            7 Av. de la Porte de Montrouge, 75014 Paris, France
            {(erreur || telephone) && (
              <>
                <br />
                Téléphone : {erreur ? TELEPHONE_REPLI : telephone}
              </>
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3 opacity-100">Hébergement</h2>
          <p>[À compléter une fois l'hébergement choisi avec le client]</p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3 opacity-100">
            Propriété intellectuelle
          </h2>
          <p>
            L'ensemble des contenus présents sur ce site (textes, images, logo)
            est la propriété de Maison Nali, sauf mention contraire.
          </p>
        </section>
      </div>
    </div>
  );
}
