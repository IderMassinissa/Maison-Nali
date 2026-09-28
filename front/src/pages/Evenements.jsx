import { useEffect, useState } from "react";
import usePageContent from "../hooks/usePageContent";
import ServiceIndisponible from "../components/ServiceIndisponible";
import CarrouselPhotos from "../components/CarrouselPhotos";
import { telHref } from "../utils/telephone";

const API_URL = import.meta.env.VITE_API_URL;

const CLES_RESEAUX = [
  { key: "social_instagram", label: "Instagram" },
  { key: "social_facebook", label: "Facebook" },
  { key: "social_tiktok", label: "TikTok" },
];

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
  const formats = (contenu.formats || "")
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter(Boolean);

  const liensReseaux = CLES_RESEAUX.filter((r) => contact[r.key]);
  const aDesCoordonnees = Boolean(contact.phone) || liensReseaux.length > 0;

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
          <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">
            Nos réalisations
          </h2>
          <CarrouselPhotos photos={photos} />
        </section>
      )}

      {formats.length > 0 && (
        <section className="mb-16 md:mb-20">
          <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">
            Formats de boîtes
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm opacity-80">
            {formats.map((format) => (
              <li key={format}>{format}</li>
            ))}
          </ul>
        </section>
      )}

      {aDesCoordonnees && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">
            Nous contacter
          </h2>
          <ul className="flex flex-col gap-3">
            {contact.phone && (
              <li>
                <a
                  href={telHref(contact.phone)}
                  className="text-sm hover:text-brand-accent transition-colors"
                >
                  Téléphone : {contact.phone}
                </a>
              </li>
            )}
            {liensReseaux.map((r) => (
              <li key={r.key}>
                <a
                  href={contact[r.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-brand-accent transition-colors"
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
