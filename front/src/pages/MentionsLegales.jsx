export default function MentionsLegales() {
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
            <br />
            Téléphone : 01 86 04 43 34
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
