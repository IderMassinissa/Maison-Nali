const patisseries = [
  {
    nom: "Baklawa Royale",
    description:
      "Trente couches de pâte extra-fine étirée à la main, un cœur d'amandes de Kabylie torréfiées et une infusion lente de miel pur à la fleur d'oranger.",
    image: "/images/baklawa.jpg",
    taille: "large",
  },
  {
    nom: "Makrout El Louz",
    description:
      "Le joyau blanc d'Alger : un cœur fondant d'amandes parfumées au zeste de citron, délicatement poudré de sucre glace.",
    image: "/images/makrout.jpg",
    taille: "small",
  },
  {
    nom: "Tcharek El Aryane",
    description:
      "Croissant de lune parsemé d'amandes effilées, offrant un contraste parfait entre le croquant extérieur et le fondant intérieur.",
    image: "/images/tcharek.jpg",
    taille: "small",
  },
  {
    nom: "Dziriyet",
    description:
      "Petits paniers de dentelle de pâte, garnis d'une frangipane délicate aux amandes et à la fleur d'oranger, glacés au sirop de miel.",
    image: "/images/dziriyet.jpg",
    taille: "large",
  },
  {
    nom: "Griwech",
    description:
      "Pâte tressée croustillante au sésame, plongée dans un bain de miel tiède. Une texture aérienne et addictive.",
    image: "/images/griwech.jpg",
    taille: "large",
  },
  {
    nom: "M'chewek",
    description:
      "Boules fondantes aux amandes, parsemées d'amandes concassées pour un aspect \"hérisson\", décorées d'une cerise confite.",
    image: "/images/mchewek.jpg",
    taille: "small",
  },
];

function CartePatisserie({ nom, description, image, taille }) {
  const hauteurImage = taille === "large" ? "md:h-[450px]" : "md:h-auto";
  return (
    <article className="bg-brand-surface rounded-[40px] overflow-hidden shadow-sm border border-brand-border/30 flex flex-col h-full">
      <div
        className={`aspect-[16/9] md:aspect-auto ${hauteurImage} overflow-hidden`}
      >
        <img className="w-full h-full object-cover" src={image} alt={nom} />
      </div>
      <div className={taille === "large" ? "p-8 md:p-12" : "p-8"}>
        <h3
          className={
            taille === "large"
              ? "font-display text-3xl md:text-4xl mb-4"
              : "font-display text-2xl mb-3"
          }
        >
          {nom}
        </h3>
        <p
          className={
            taille === "large"
              ? "text-sm md:text-base opacity-70 leading-relaxed max-w-lg"
              : "text-xs opacity-70 leading-relaxed"
          }
        >
          {description}
        </p>
      </div>
    </article>
  );
}

export default function GrillePatisseries() {
  return (
    <section className="px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-8">
            <CartePatisserie {...patisseries[0]} />
          </div>
          <div className="md:col-span-4">
            <CartePatisserie {...patisseries[1]} />
          </div>

          <div className="md:col-span-4 order-2 md:order-1">
            <CartePatisserie {...patisseries[2]} />
          </div>
          <div className="md:col-span-8 order-1 md:order-2">
            <CartePatisserie {...patisseries[3]} />
          </div>

          <div className="md:col-span-7">
            <CartePatisserie {...patisseries[4]} />
          </div>
          <div className="md:col-span-5">
            <CartePatisserie {...patisseries[5]} />
          </div>
        </div>
      </div>
    </section>
  );
}
