import { useEffect, useRef, useState } from "react";
import { urlImage } from "../utils/urlImage";

export default function CarrouselPhotos({ photos }) {
  const conteneurRef = useRef(null);
  const [peutReculer, setPeutReculer] = useState(false);
  const [peutAvancer, setPeutAvancer] = useState(false);

  function verifierLimites() {
    const el = conteneurRef.current;
    if (!el) return;
    setPeutReculer(el.scrollLeft > 4);
    setPeutAvancer(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    verifierLimites();
  }, [photos]);

  function defiler(direction) {
    const el = conteneurRef.current;
    if (!el) return;
    const premiereSlide = el.firstElementChild;
    const largeurSlide = premiereSlide
      ? premiereSlide.getBoundingClientRect().width
      : el.clientWidth;
    el.scrollBy({ left: direction * (largeurSlide + 16) });
  }

  return (
    <div className="relative">
      <div
        ref={conteneurRef}
        onScroll={verifierLimites}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory motion-safe:scroll-smooth pb-2"
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="snap-start shrink-0 w-[85%] md:w-[calc((100%-2rem)/3)] aspect-[4/3] rounded-2xl overflow-hidden bg-brand-border/20"
          >
            <img
              src={urlImage(photo.image_url)}
              alt={photo.alt || "Réalisation Maison Nali"}
              loading={index === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={() => defiler(-1)}
          disabled={!peutReculer}
          aria-label="Photo précédente"
          className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => defiler(1)}
          disabled={!peutAvancer}
          aria-label="Photo suivante"
          className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
        >
          →
        </button>
      </div>
    </div>
  );
}
