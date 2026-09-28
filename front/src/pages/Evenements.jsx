import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import usePageContent from "../hooks/usePageContent";
import ServiceIndisponible from "../components/ServiceIndisponible";
import CarrouselPhotos from "../components/CarrouselPhotos";
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

export default function Evenements() {
  const { sections, chargement, erreur } = usePageContent("evenements");

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

  if (chargement) return null;
  if (erreur) return <ServiceIndisponible />;

  const bloc = sections.find((s) => s.type === "bloc-evenements");
  const contenu = bloc?.content || {};
  const formats = analyserFormats(contenu.formats);

  const liensReseaux = CLES_RESEAUX.filter((r) => contact[r.key]);

  return (
    <div className="px-6 md:px-12 py-16 md:py-24 max-w-4xl mx-auto">
      <header className="mb-16 md:mb-20 text-center">
        <span className="text-brand-accent text-xs uppercase tracking-[0.3em] mb-6 block">
          Sur mesure
        </span>
        <h1 className="font-display text-4xl md:text-6xl tracking-tight mb-6">
          {contenu.titre || "Événements"}
        </h1>
        {contenu.intro && (
          <p className="text-sm md:text-base leading-relaxed opacity-80 max-w-2xl mx-auto">
            {contenu.intro}
          </p>
        )}
      </header>

      {!chargementPhotos && !erreurPhotos && photos.length > 0 && (
        <section className="mb-16 md:mb-20">
          <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8 text-center">
            Nos réalisations
          </h2>
          <CarrouselPhotos photos={photos} />
        </section>
      )}

      {formats.length > 0 && (
        <section className="mb-16 md:mb-20">
          <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8 text-center">
            Formats de boîtes
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formats.map((format, index) => (
              <li
                key={`${format.nom}-${index}`}
                className="p-6 border border-brand-border rounded-2xl bg-brand-surface"
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
                className="px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Appeler
              </a>
            )}
            <Link
              to="/adresse"
              className="px-8 py-3 border border-brand-border rounded-full text-sm uppercase tracking-widest hover:border-brand-accent transition-colors"
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
