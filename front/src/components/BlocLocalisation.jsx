import { useEffect, useMemo, useState } from "react";
import HorairesTable from "./HorairesTable";
import { telHref } from "../utils/telephone";
const API_URL = import.meta.env.VITE_API_URL;

const ADRESSE_REPLI = "42 Rue des Glycines\n75016 Paris, France";

export default function BlocLocalisation() {
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/settings/address_text`)
      .then((res) => {
        if (!res.ok) throw new Error("Réponse API non ok");
        return res.json();
      })
      .then((data) => setAdresse(data.value || ADRESSE_REPLI))
      .catch(() => setAdresse(ADRESSE_REPLI));

    fetch(`${API_URL}/api/settings/phone`)
      .then((res) => {
        if (!res.ok) throw new Error("Réponse API non ok");
        return res.json();
      })
      .then((data) => setTelephone(data.value || ""))
      .catch(() => setTelephone(""));
  }, []);

  const lienMaps = useMemo(
    () =>
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adresse.replace(/\n/g, ", "))}`,
    [adresse],
  );

  return (
    <section className="py-section-y md:py-section-y-lg px-6 md:px-12 bg-brand-light">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4">
          <h2 className="font-display text-[1.75rem] md:text-[2.5rem] tracking-tight mb-6">
            La boutique parisienne
          </h2>
          <div className="w-10 h-px bg-brand-accent mb-6" />
          <h3 className="text-lg md:text-xl font-sans font-normal mb-8 opacity-80">
            Nous rendre visite
          </h3>
          <div className="mb-6">
            <p className="text-base leading-relaxed opacity-80 whitespace-pre-line mb-2">
              {adresse}
            </p>
            {telephone && (
              <a
                href={telHref(telephone)}
                className="text-base opacity-80 hover:opacity-100 hover:text-brand-accent transition-colors block"
              >
                {telephone}
              </a>
            )}
          </div>
          <HorairesTable />

          <a
            href={lienMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mt-10 px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest transition-colors duration-200 ease-out hover:bg-brand-dark/85 hover:shadow-soft"
          >
            Voir l'itinéraire
          </a>
        </div>

        <div className="lg:col-span-8 relative">
          <div className="aspect-video rounded overflow-hidden shadow-soft group">
            <img
              className="w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
              src="/images/boutique.jpg"
              alt="Vitrine de la boutique Maison Nali à Paris"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
