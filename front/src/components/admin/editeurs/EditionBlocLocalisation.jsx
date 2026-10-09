import { useState, useEffect } from "react";
import useSauvegardeBloc from "./SauvegardeBloc";
import { urlImage } from "../../../utils/urlImage";
import { parseContenuSection } from "../../../utils/parseContenuSection";
const API_URL = import.meta.env.VITE_API_URL;

const ORDRE_JOURS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export default function EditionBlocLocalisation({ section }) {
  const contenuInitial = parseContenuSection(section.content);
  const [titre, setTitre] = useState(contenuInitial.titre || "");
  const [sousTitre, setSousTitre] = useState(contenuInitial.sousTitre || "");
  const [texteBouton, setTexteBouton] = useState(contenuInitial.texteBouton || "");
  const [photo, setPhoto] = useState(contenuInitial.photo || "");
  const [photoAlt, setPhotoAlt] = useState(contenuInitial.photoAlt || "");
  const [focusX, setFocusX] = useState(contenuInitial.focusX ?? 50);
  const [focusY, setFocusY] = useState(contenuInitial.focusY ?? 50);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const { sauvegarder, enregistrement, succes } = useSauvegardeBloc(section.id);

  const [horaires, setHoraires] = useState([]);
  const [chargementHoraires, setChargementHoraires] = useState(true);
  const [enregistrementHoraire, setEnregistrementHoraire] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/opening-hours`)
      .then((res) => res.json())
      .then((data) => {
        const trie = [...data].sort(
          (a, b) => ORDRE_JOURS.indexOf(a.day) - ORDRE_JOURS.indexOf(b.day),
        );
        setHoraires(trie);
      })
      .finally(() => setChargementHoraires(false));
  }, []);

  async function handlePhotoChange(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;

    setUploadEnCours(true);
    const formData = new FormData();
    formData.append("photo", fichier);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPhoto(data.url);
      setFocusX(50);
      setFocusY(50);
    } catch (err) {
      alert("Erreur upload : " + err.message);
    } finally {
      setUploadEnCours(false);
    }
  }

  function handleClicPhoto(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFocusX(Math.round(x));
    setFocusY(Math.round(y));
  }

  function handleSubmit(e) {
    e.preventDefault();
    sauvegarder({ titre, sousTitre, texteBouton, photo, photoAlt, focusX, focusY });
  }

  async function sauvegarderHoraire(id, openTime, closeTime) {
    setEnregistrementHoraire(id);
    try {
      await fetch(`${API_URL}/api/opening-hours/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ openTime, closeTime }),
      });
    } finally {
      setEnregistrementHoraire(null);
    }
  }

  function handleChangeHoraire(id, champ, valeur) {
    setHoraires((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [champ]: valeur } : h)),
    );
  }

  function handleBlurHoraire(horaire) {
    sauvegarderHoraire(horaire.id, horaire.open_time, horaire.close_time);
  }

  function handleFermeHoraire(horaire, ferme) {
    const nouvel = ferme
      ? { ...horaire, open_time: null, close_time: null }
      : { ...horaire, open_time: "11:00", close_time: "19:00" };
    setHoraires((prev) => prev.map((h) => (h.id === horaire.id ? nouvel : h)));
    sauvegarderHoraire(horaire.id, nouvel.open_time, nouvel.close_time);
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Localisation</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 mb-12">
        <div>
          <label
            htmlFor="localisation-titre"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Titre
          </label>
          <input
            id="localisation-titre"
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="La boutique parisienne"
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label
            htmlFor="localisation-sous-titre"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Sous-titre
          </label>
          <input
            id="localisation-sous-titre"
            type="text"
            value={sousTitre}
            onChange={(e) => setSousTitre(e.target.value)}
            placeholder="Nous rendre visite"
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label
            htmlFor="localisation-texte-bouton"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Texte du bouton
          </label>
          <input
            id="localisation-texte-bouton"
            type="text"
            value={texteBouton}
            onChange={(e) => setTexteBouton(e.target.value)}
            placeholder="Voir l'itinéraire"
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-70 mb-2">
            Photo de la boutique
          </label>
          {photo && (
            <div
              className="relative mb-3 cursor-crosshair"
              onClick={handleClicPhoto}
            >
              <img
                src={urlImage(photo)}
                alt="Aperçu"
                className="w-full max-w-sm h-48 object-cover rounded-lg"
                style={{ objectPosition: `${focusX}% ${focusY}%` }}
              />
              <div
                className="absolute w-4 h-4 border-2 border-brand-accent rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${focusX}%`, top: `${focusY}%` }}
              />
            </div>
          )}
          {photo && (
            <p className="text-xs opacity-70 mb-3">
              Clique sur la photo pour choisir la zone à mettre en avant.
            </p>
          )}
          <label
            htmlFor="localisation-photo-input"
            className="inline-block px-6 py-3 bg-brand-dark text-brand-light rounded-full text-xs uppercase tracking-widest cursor-pointer hover:bg-brand-dark/85 transition-colors"
          >
            {photo ? "Changer la photo" : "Choisir une photo"}
          </label>
          <input
            id="localisation-photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {uploadEnCours && (
            <p className="text-xs opacity-70 mt-2">Envoi en cours...</p>
          )}
        </div>
        <div>
          <label
            htmlFor="localisation-photo-alt"
            className="block text-sm uppercase tracking-widest opacity-70 mb-2"
          >
            Texte alternatif de la photo
          </label>
          <input
            id="localisation-photo-alt"
            type="text"
            value={photoAlt}
            onChange={(e) => setPhotoAlt(e.target.value)}
            placeholder="Description de la photo pour l'accessibilité"
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <button
          type="submit"
          disabled={enregistrement || uploadEnCours}
          className="px-8 py-3 bg-brand-dark text-brand-accent rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
        >
          {enregistrement ? "Enregistrement..." : "Enregistrer"}
        </button>
        {succes && <p className="text-green-600 text-sm">Enregistré !</p>}
      </form>

      <p className="text-xs opacity-70 mb-6">
        Les horaires sont communs à tout le site — les modifier ici les met à
        jour partout où ils apparaissent. L'adresse se modifie désormais depuis
        l'écran Coordonnées.
      </p>

      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest opacity-70 mb-4">
          Horaires d'ouverture
        </p>
        {chargementHoraires ? (
          <p className="text-sm opacity-70">Chargement...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {horaires.map((horaire) => {
              const ferme = !horaire.open_time && !horaire.close_time;
              return (
                <div
                  key={horaire.id}
                  className="flex items-center gap-4 p-4 bg-white border border-brand-border rounded-xl"
                >
                  <span className="w-24 text-sm font-medium">
                    {horaire.day}
                  </span>
                  {ferme ? (
                    <span className="flex-1 min-w-0 text-sm opacity-70">Fermé</span>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="time"
                        aria-label={`Heure d'ouverture, ${horaire.day}`}
                        value={horaire.open_time || ""}
                        onChange={(e) =>
                          handleChangeHoraire(
                            horaire.id,
                            "open_time",
                            e.target.value,
                          )
                        }
                        onBlur={() =>
                          handleBlurHoraire(
                            horaires.find((h) => h.id === horaire.id),
                          )
                        }
                        className="px-3 py-2 border border-brand-border rounded-lg text-sm"
                      />
                      <span className="opacity-50">à</span>
                      <input
                        type="time"
                        aria-label={`Heure de fermeture, ${horaire.day}`}
                        value={horaire.close_time || ""}
                        onChange={(e) =>
                          handleChangeHoraire(
                            horaire.id,
                            "close_time",
                            e.target.value,
                          )
                        }
                        onBlur={() =>
                          handleBlurHoraire(
                            horaires.find((h) => h.id === horaire.id),
                          )
                        }
                        className="px-3 py-2 border border-brand-border rounded-lg text-sm"
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ferme}
                      onChange={(e) =>
                        handleFermeHoraire(horaire, e.target.checked)
                      }
                    />
                    Fermé
                  </label>
                  {enregistrementHoraire === horaire.id && (
                    <span className="text-xs opacity-50">...</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
