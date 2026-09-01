import { useEffect, useMemo, useState } from "react";
import HorairesTable from "./HorairesTable";
const API_URL = import.meta.env.VITE_API_URL;

export default function BlocLocalisation() {
  const [adresse, setAdresse] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/settings/address_text`)
      .then((res) => res.json())
      .then((data) =>
        setAdresse(data.value || "42 Rue des Glycines\n75016 Paris, France"),
      );
  }, []);

  const lienMaps = useMemo(
    () =>
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adresse.replace(/\n/g, ", "))}`,
    [adresse],
  );

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-brand-light">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <span className="text-xs uppercase tracking-[0.2em] mb-6 block opacity-60">
            Nous rendre visite
          </span>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-8">
            La boutique parisienne
          </h2>
          <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line mb-6">
            {adresse}
          </p>
          <HorairesTable />

          <a
            href={lienMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mt-10 px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest transition-all duration-500 hover:bg-brand-accent hover:text-brand-dark"
          >
            Voir l'itinéraire
          </a>
        </div>

        <div className="lg:col-span-7 relative">
          <div className="aspect-video rounded-[2rem] overflow-hidden shadow-sm">
            <img
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              src="/images/boutique.jpg"
              alt="Vitrine de la boutique Maison Nali à Paris"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
