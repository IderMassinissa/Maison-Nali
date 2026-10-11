/**
 * Carrousel de photos "nos réalisations" (page Événements). Défilement
 * horizontal natif (scroll-snap) plutôt qu'une librairie tierce : autoplay
 * en pause au survol/interaction, respecte prefers-reduced-motion, et un
 * IntersectionObserver suit quelle(s) photo(s) sont au premier plan pour
 * leur effet visuel (opacité/échelle) sans recalcul au scroll.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { urlImage } from "../utils/urlImage";
import ImageAvecRepli from "./ImageAvecRepli";

const DELAI_AUTOPLAY_MS = 3000;

function IconePause() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="2" y="1" width="3.5" height="12" rx="0.5" />
      <rect x="8.5" y="1" width="3.5" height="12" rx="0.5" />
    </svg>
  );
}

function IconeLecture() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M2 1.3 12.5 7 2 12.7Z" />
    </svg>
  );
}

function IconeFleche({ direction }) {
  const points =
    direction === -1 ? "9 2 3 8 9 14" : "3 2 9 8 3 14";
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CarrouselPhotos({ photos }) {
  const conteneurRef = useRef(null);
  const slidesRef = useRef([]);
  const [reduitMotion, setReduitMotion] = useState(false);
  const [enPause, setEnPause] = useState(false);
  const [idsAuPremierPlan, setIdsAuPremierPlan] = useState(() => new Set());
  const [photosParPage, setPhotosParPage] = useState(() =>
    window.matchMedia("(min-width: 768px)").matches ? 2 : 1,
  );
  const [pageActive, setPageActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const appliquer = () => setReduitMotion(mq.matches);
    appliquer();
    mq.addEventListener("change", appliquer);
    return () => mq.removeEventListener("change", appliquer);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const appliquer = () => setPhotosParPage(mq.matches ? 2 : 1);
    appliquer();
    mq.addEventListener("change", appliquer);
    return () => mq.removeEventListener("change", appliquer);
  }, []);

  const calculerPageActive = useCallback(() => {
    const el = conteneurRef.current;
    if (!el) return;
    const premiereSlide = el.firstElementChild;
    const largeurSlide = premiereSlide
      ? premiereSlide.getBoundingClientRect().width
      : el.clientWidth;
    const largeurPage = photosParPage * (largeurSlide + 16);
    const totalPages = Math.ceil(photos.length / photosParPage);
    const index = largeurPage > 0 ? Math.round(el.scrollLeft / largeurPage) : 0;
    setPageActive(Math.min(Math.max(index, 0), Math.max(totalPages - 1, 0)));
  }, [photos, photosParPage]);

  useEffect(() => {
    calculerPageActive();
  }, [photos, photosParPage, calculerPageActive]);

  useEffect(() => {
    window.addEventListener("resize", calculerPageActive);
    return () => window.removeEventListener("resize", calculerPageActive);
  }, [calculerPageActive]);

  useEffect(() => {
    if (reduitMotion) return;
    const conteneur = conteneurRef.current;
    if (!conteneur || photos.length === 0) return;

    const observateur = new IntersectionObserver(
      (entrees) => {
        setIdsAuPremierPlan((precedent) => {
          const suivant = new Set(precedent);
          entrees.forEach((entree) => {
            const id = entree.target.dataset.photoId;
            if (entree.intersectionRatio >= 0.6) suivant.add(id);
            else suivant.delete(id);
          });
          return suivant;
        });
      },
      { root: conteneur, threshold: [0, 0.6, 1] },
    );

    slidesRef.current.forEach((slide) => slide && observateur.observe(slide));
    return () => observateur.disconnect();
  }, [photos, reduitMotion]);

  const allerAPage = useCallback(
    (index) => {
      const el = conteneurRef.current;
      if (!el) return;
      const premiereSlide = el.firstElementChild;
      const largeurSlide = premiereSlide
        ? premiereSlide.getBoundingClientRect().width
        : el.clientWidth;
      el.scrollTo({
        left: index * photosParPage * (largeurSlide + 16),
        behavior: reduitMotion ? "auto" : "smooth",
      });
    },
    [photosParPage, reduitMotion],
  );

  const totalPages = Math.ceil(photos.length / photosParPage);

  useEffect(() => {
    if (reduitMotion || enPause || totalPages <= 1) return;
    const minuteur = setTimeout(() => {
      allerAPage((pageActive + 1) % totalPages);
    }, DELAI_AUTOPLAY_MS);
    return () => clearTimeout(minuteur);
  }, [pageActive, totalPages, reduitMotion, enPause, allerAPage]);

  if (photos.length === 0) return null;

  return (
    <div className="relative max-w-7xl mx-auto">
      <div
        ref={conteneurRef}
        onScroll={calculerPageActive}
        tabIndex={0}
        role="region"
        aria-label="Photos de nos réalisations"
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, index) => {
          const auPremierPlan =
            reduitMotion || idsAuPremierPlan.has(String(photo.id));
          return (
            <div
              key={photo.id}
              ref={(el) => (slidesRef.current[index] = el)}
              data-photo-id={photo.id}
              className={`relative snap-start shrink-0 w-[85%] md:w-[calc((100%-1rem)/2)] aspect-[4/3] rounded-lg overflow-hidden bg-brand-border/20 ${
                auPremierPlan ? "opacity-100 scale-100" : "opacity-60 scale-95"
              } ${reduitMotion ? "" : "transition-all duration-500 ease-out"}`}
            >
              <ImageAvecRepli
                src={photo.image_url ? urlImage(photo.image_url) : null}
                alt={photo.alt || "Réalisation Maison Nali"}
                loading={index === 0 ? "eager" : "lazy"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 mt-4">
          <p className="text-sm tracking-widest" aria-hidden="true">
            {Array.from({ length: totalPages }, (_, index) => (
              <span
                key={index}
                className={
                  index === pageActive
                    ? "text-brand-accent font-semibold"
                    : "opacity-40"
                }
              >
                {index + 1}
                {index < totalPages - 1 && <span className="opacity-40"> · </span>}
              </span>
            ))}
          </p>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => allerAPage((pageActive - 1 + totalPages) % totalPages)}
              aria-label="Photo précédente"
              className="w-11 h-11 flex items-center justify-center text-brand-dark/60 hover:text-brand-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              <IconeFleche direction={-1} />
            </button>

            <button
              type="button"
              onClick={() => setEnPause((precedent) => !precedent)}
              aria-label={
                enPause ? "Reprendre le diaporama" : "Mettre en pause le diaporama"
              }
              className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-brand-dark hover:border-brand-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              {enPause ? <IconeLecture /> : <IconePause />}
            </button>

            <button
              type="button"
              onClick={() => allerAPage((pageActive + 1) % totalPages)}
              aria-label="Photo suivante"
              className="w-11 h-11 flex items-center justify-center text-brand-dark/60 hover:text-brand-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              <IconeFleche direction={1} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
