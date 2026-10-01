import { useCallback, useEffect, useRef, useState } from "react";
import { urlImage } from "../utils/urlImage";

export default function CarrouselPhotos({ photos }) {
  const conteneurRef = useRef(null);
  const slidesRef = useRef([]);
  const [peutReculer, setPeutReculer] = useState(false);
  const [peutAvancer, setPeutAvancer] = useState(false);
  const [reduitMotion, setReduitMotion] = useState(false);
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

  function verifierLimites() {
    const el = conteneurRef.current;
    if (!el) return;
    setPeutReculer(el.scrollLeft > 4);
    setPeutAvancer(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

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
    verifierLimites();
    calculerPageActive();
  }, [photos, photosParPage, calculerPageActive]);

  useEffect(() => {
    function surRedimensionnement() {
      verifierLimites();
      calculerPageActive();
    }
    window.addEventListener("resize", surRedimensionnement);
    return () => window.removeEventListener("resize", surRedimensionnement);
  }, [photos, photosParPage, calculerPageActive]);

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

  function defiler(direction) {
    const el = conteneurRef.current;
    if (!el) return;
    const premiereSlide = el.firstElementChild;
    const largeurSlide = premiereSlide
      ? premiereSlide.getBoundingClientRect().width
      : el.clientWidth;
    el.scrollBy({
      left: direction * (largeurSlide + 16),
      behavior: reduitMotion ? "auto" : "smooth",
    });
  }

  function allerAPage(index) {
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
  }

  if (photos.length === 0) return null;

  const totalPages = Math.ceil(photos.length / photosParPage);

  return (
    <div className="relative max-w-7xl mx-auto">
      <div
        ref={conteneurRef}
        onScroll={() => {
          verifierLimites();
          calculerPageActive();
        }}
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
              className={`snap-start shrink-0 w-[85%] md:w-[calc((100%-1rem)/2)] aspect-[4/3] rounded-lg overflow-hidden bg-brand-border/20 ${
                auPremierPlan ? "opacity-100 scale-100" : "opacity-60 scale-95"
              } ${reduitMotion ? "" : "transition-all duration-300"}`}
            >
              <img
                src={urlImage(photo.image_url)}
                alt={photo.alt || "Réalisation Maison Nali"}
                loading={index === 0 ? "eager" : "lazy"}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => defiler(-1)}
        disabled={!peutReculer}
        aria-label="Photo précédente"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-brand-border bg-brand-light flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => defiler(1)}
        disabled={!peutAvancer}
        aria-label="Photo suivante"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-brand-border bg-brand-light flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
      >
        →
      </button>

      {totalPages > 1 && (
        <div
          role="group"
          aria-label="Pagination du carrousel"
          className="flex justify-center items-center gap-2 mt-3"
        >
          {Array.from({ length: totalPages }, (_, index) => {
            const actif = index === pageActive;
            const premierePhotoIndex = index * photosParPage + 1;
            return (
              <button
                key={index}
                type="button"
                onClick={() => allerAPage(index)}
                aria-label={`Aller à la photo ${premierePhotoIndex} sur ${photos.length}`}
                aria-current={actif ? "true" : undefined}
                className={`rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${
                  actif ? "w-3 h-3 bg-brand-accent" : "w-2 h-2 bg-brand-border"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
