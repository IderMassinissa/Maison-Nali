import { useState } from "react";
import useSauvegardeBloc from "./SauvegardeBloc";

export default function EditionHero({ section }) {
  const contenuInitial = JSON.parse(section.content || "{}");
  const [titre, setTitre] = useState(contenuInitial.titre || "");
  const [sousTitre, setSousTitre] = useState(contenuInitial.sousTitre || "");
  const [photo, setPhoto] = useState(contenuInitial.photo || "");
  const [focusX, setFocusX] = useState(contenuInitial.focusX ?? 50);
  const [focusY, setFocusY] = useState(contenuInitial.focusY ?? 50);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const { sauvegarder, enregistrement, succes } = useSauvegardeBloc(section.id);

  async function handlePhotoChange(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;

    setUploadEnCours(true);
    const formData = new FormData();
    formData.append("photo", fichier);

    try {
      const res = await fetch("http://localhost:3001/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPhoto(`http://localhost:3001${data.url}`);
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
    sauvegarder({ titre, sousTitre, photo, focusX, focusY });
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Bloc Hero</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Titre principal
          </label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Sous-titre
          </label>
          <input
            type="text"
            value={sousTitre}
            onChange={(e) => setSousTitre(e.target.value)}
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Photo de fond
          </label>
          {photo && (
            <div
              className="relative mb-3 cursor-crosshair"
              onClick={handleClicPhoto}
            >
              <img
                src={photo}
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
            <p className="text-xs opacity-60 mb-3">
              Clique sur la photo pour choisir la zone à mettre en avant.
            </p>
          )}
          <label
            htmlFor="hero-photo-input"
            className="inline-block px-6 py-3 border border-brand-border rounded-full text-xs uppercase tracking-widest cursor-pointer hover:bg-brand-surface transition-colors"
          >
            {photo ? "Changer la photo" : "Choisir une photo"}
          </label>
          <input
            id="hero-photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {uploadEnCours && (
            <p className="text-xs opacity-60 mt-2">Envoi en cours...</p>
          )}
        </div>
        <button
          type="submit"
          disabled={enregistrement || uploadEnCours}
          className="px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
        >
          {enregistrement ? "Enregistrement..." : "Enregistrer"}
        </button>
        {succes && <p className="text-green-600 text-sm">Enregistré !</p>}
      </form>
    </div>
  );
}
