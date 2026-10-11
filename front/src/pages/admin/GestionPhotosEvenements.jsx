/**
 * Gestion de la galerie "nos réalisations" (événements) : upload, texte
 * alternatif par photo, réorganisation par glisser-déposer (@dnd-kit),
 * suppression. LIMITE_PHOTOS dédouble côté front la limite imposée par
 * le back (repositories/eventPhotos.js) — purement pour désactiver le
 * bouton d'ajout sans attendre un aller-retour serveur, le back reste la
 * seule source de vérité qui l'applique réellement.
 */
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { urlImage } from "../../utils/urlImage";
import { gererSessionExpiree } from "../../utils/sessionExpiree";

const API_URL = import.meta.env.VITE_API_URL;
const LIMITE_PHOTOS = 5;

function PhotoTriable({ photo, onModifierAlt, onSupprimer }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: photo.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [alt, setAlt] = useState(photo.alt || "");
  const [enregistrement, setEnregistrement] = useState(false);

  async function sauvegarderAlt() {
    if (alt === (photo.alt || "")) return;
    setEnregistrement(true);
    await onModifierAlt(photo.id, alt);
    setEnregistrement(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white border border-brand-border rounded-xl"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-lg opacity-40"
        aria-label="Réordonner"
      >
        ⠿
      </button>
      <img
        src={urlImage(photo.image_url)}
        alt={alt || "Réalisation Maison Nali"}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
      />
      <input
        type="text"
        aria-label="Texte alternatif de la photo"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={sauvegarderAlt}
        placeholder="Texte alternatif"
        maxLength={150}
        className="flex-1 min-w-0 px-3 py-2 border border-brand-border rounded-lg text-sm"
      />
      {enregistrement && <span className="text-xs opacity-50">...</span>}
      <button
        onClick={() => onSupprimer(photo.id)}
        className="text-xs uppercase tracking-widest text-red-600 hover:underline"
      >
        Supprimer
      </button>
    </div>
  );
}

export default function GestionPhotosEvenements() {
  const [photos, setPhotos] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  function chargerPhotos() {
    fetch(`${API_URL}/api/event-photos`)
      .then((res) => {
        if (!res.ok) throw new Error("Réponse API non ok");
        return res.json();
      })
      .then((data) => {
        setPhotos(data);
        setErreur("");
      })
      .catch(() => setErreur("Impossible de charger les photos"))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerPhotos();
  }, []);

  async function handlePhotoChange(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    setErreur("");
    setUploadEnCours(true);

    const formData = new FormData();
    formData.append("photo", fichier);

    try {
      const resUpload = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const dataUpload = await resUpload.json();
      if (!resUpload.ok) throw new Error(dataUpload.error || "Échec de l'upload");

      const resCreation = await fetch(`${API_URL}/api/event-photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageUrl: dataUpload.url, alt: "" }),
      });
      if (!resCreation.ok) {
        const dataCreation = await resCreation.json();
        throw new Error(dataCreation.error || "Échec de l'enregistrement");
      }

      chargerPhotos();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setUploadEnCours(false);
      e.target.value = "";
    }
  }

  async function handleModifierAlt(id, alt) {
    try {
      const res = await fetch(`${API_URL}/api/event-photos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ alt }),
      });
      if (gererSessionExpiree(res.status)) return;
      if (!res.ok) {
        const data = await res.json();
        setErreur(data.error || "Échec de la mise à jour");
        return;
      }
      chargerPhotos();
    } catch {
      setErreur("Impossible de contacter le serveur");
    }
  }

  async function handleSupprimer(id) {
    if (!confirm("Supprimer cette photo ?")) return;
    const res = await fetch(`${API_URL}/api/event-photos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (gererSessionExpiree(res.status)) return;
    chargerPhotos();
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    const nouvelOrdre = arrayMove(photos, oldIndex, newIndex);

    setPhotos(nouvelOrdre);

    nouvelOrdre.forEach((photo, index) => {
      fetch(`${API_URL}/api/event-photos/${photo.id}/position`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ position: index + 1 }),
      });
    });
  }

  const limiteAtteinte = photos.length >= LIMITE_PHOTOS;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-2">Photos événements</h1>
          <p className="text-sm opacity-70">
            {photos.length} / {LIMITE_PHOTOS} photos
          </p>
        </div>
        <div>
          <label
            htmlFor="photo-evenement-input"
            className={`inline-block px-6 py-3 rounded-full text-xs uppercase tracking-widest ${
              limiteAtteinte || uploadEnCours
                ? "bg-brand-border text-brand-dark/40 cursor-not-allowed pointer-events-none"
                : "bg-brand-dark text-brand-light cursor-pointer"
            }`}
          >
            {uploadEnCours ? "Envoi..." : "+ Ajouter une photo"}
          </label>
          <input
            id="photo-evenement-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            disabled={limiteAtteinte || uploadEnCours}
            className="hidden"
          />
        </div>
      </div>

      {erreur && <p className="text-red-600 text-sm mb-6">{erreur}</p>}

      {chargement ? (
        <p>Chargement...</p>
      ) : photos.length === 0 ? (
        <p className="opacity-70 text-sm">Aucune photo pour l'instant.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {photos.map((photo) => (
                <PhotoTriable
                  key={photo.id}
                  photo={photo}
                  onModifierAlt={handleModifierAlt}
                  onSupprimer={handleSupprimer}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
