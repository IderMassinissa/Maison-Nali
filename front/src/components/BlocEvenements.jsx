import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import CarrouselPhotos from "./CarrouselPhotos";
import { telHref } from "../utils/telephone";

const API_URL = import.meta.env.VITE_API_URL;

const CLES_RESEAUX = [
  { key: "social_instagram", label: "Instagram", Icone: FaInstagram },
  { key: "social_facebook", label: "Facebook", Icone: FaFacebookF },
  { key: "social_tiktok", label: "TikTok", Icone: FaTiktok },
];

function analyserFormats(brut) {
  return (brut || "")
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter(Boolean)
    .map((ligne) => {
      const indexSeparateur = ligne.indexOf("|");
      if (indexSeparateur === -1) return { nom: ligne, detail: "" };
      return {
        nom: ligne.slice(0, indexSeparateur).trim(),
        detail: ligne.slice(indexSeparateur + 1).trim(),
      };
    });
}

export default function BlocEvenements({ formats }) {
  const [photos, setPhotos] = useState([]);
  const [chargementPhotos, setChargementPhotos] = useState(true);
  const [erreurPhotos, setErreurPhotos] = useState(false);

  const [contact, setContact] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/api/event-photos`)
      .then((res) => {
        if (!res.ok) throw new Error("Réponse API non ok");
        return res.json();
      })
      .then((data) => {
        setPhotos(data);
        setErreurPhotos(false);
      })
      .catch(() => setErreurPhotos(true))
      .finally(() => setChargementPhotos(false));

    Promise.all(
      ["phone", ...CLES_RESEAUX.map((r) => r.key)].map((key) =>
        fetch(`${API_URL}/api/settings/${key}`)
          .then((res) => {
            if (!res.ok) throw new Error("Réponse API non ok");
            return res.json();
          })
          .then((data) => [key, data.value])
          .catch(() => [key, null]),
      ),
    ).then((entries) => setContact(Object.fromEntries(entries)));
  }, []);

  const formatsAnalyses = analyserFormats(formats);
  const liensReseaux = CLES_RESEAUX.filter((r) => contact[r.key]);

  return (
    <div className="px-6 md:px-12 py-20 md:py-28 max-w-4xl mx-auto">
      {!chargementPhotos && !erreurPhotos && photos.length > 0 && (
        <section className="mb-16 md:mb-20">
          <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8 text-center">
            Nos réalisations
          </h2>
          <CarrouselPhotos photos={photos} />
        </section>
      )}

      {formatsAnalyses.length > 0 && (
        <section className="mb-16 md:mb-20">
          <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8 text-center">
            Formats de boîtes
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formatsAnalyses.map((format, index) => (
              <li
                key={`${format.nom}-${index}`}
                className="p-6 border border-brand-dark rounded-lg bg-white shadow-soft"
              >
                <p className="font-display text-lg md:text-xl">
                  {format.nom}
                </p>
                {format.detail && (
                  <p className="text-sm opacity-70 mt-1">{format.detail}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8 text-center">
          Nous contacter
        </h2>
        <div className="text-center max-w-md mx-auto">
          <p className="text-sm leading-relaxed opacity-80 mb-8">
            Parlons de votre projet : appelez-nous ou passez à la boutique.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            {contact.phone && (
              <a
                href={telHref(contact.phone)}
                className="px-8 py-3 bg-brand-gradient text-text-on-dark rounded-full text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Appeler
              </a>
            )}
            <Link
              to="/adresse"
              className="px-8 py-3 bg-white border border-brand-border text-brand-dark rounded-full text-sm uppercase tracking-widest hover:border-brand-accent transition-colors"
            >
              Adresse et horaires
            </Link>
          </div>
          {liensReseaux.length > 0 && (
            <div className="flex gap-5 justify-center text-xl">
              {liensReseaux.map((r) => (
                <a
                  key={r.key}
                  href={contact[r.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.label}
                  className="hover:text-brand-accent transition-colors"
                >
                  <r.Icone />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
