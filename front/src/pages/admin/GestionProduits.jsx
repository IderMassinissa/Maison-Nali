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

const API_URL = import.meta.env.VITE_API_URL;

function ProduitTriable({ produit, onEditer, onSupprimer }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: produit.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

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
      {produit.photo_url && (
        <img
          src={urlImage(produit.photo_url)}
          alt={produit.name}
          className="w-12 h-12 rounded-lg object-cover"
          style={{
            objectPosition: `${produit.focus_x ?? 50}% ${produit.focus_y ?? 50}%`,
          }}
        />
      )}
      <span className="flex-1 min-w-0 text-sm font-medium">{produit.name}</span>
      <button
        onClick={() => onEditer(produit.id)}
        className="text-xs uppercase tracking-widest text-brand-accent hover:underline"
      >
        Éditer
      </button>
      <button
        onClick={() => onSupprimer(produit.id)}
        className="text-xs uppercase tracking-widest text-red-600 hover:underline"
      >
        Supprimer
      </button>
    </div>
  );
}

export default function GestionProduits() {
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modeEdition, setModeEdition] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  function chargerProduits() {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProduits(data))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerProduits();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Supprimer ce produit ?")) return;
    await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    chargerProduits();
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = produits.findIndex((p) => p.id === active.id);
    const newIndex = produits.findIndex((p) => p.id === over.id);
    const nouvelOrdre = arrayMove(produits, oldIndex, newIndex);

    setProduits(nouvelOrdre);

    nouvelOrdre.forEach((produit, index) => {
      fetch(`${API_URL}/api/products/${produit.id}/position`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ position: index + 1 }),
      });
    });
  }

  if (modeEdition !== null) {
    return (
      <FormulaireProduit
        produitId={modeEdition === "nouveau" ? null : modeEdition}
        produits={produits}
        onTermine={() => {
          setModeEdition(null);
          chargerProduits();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Produits</h1>
        <button
          onClick={() => setModeEdition("nouveau")}
          className="px-6 py-3 bg-brand-dark text-brand-light rounded-full text-xs uppercase tracking-widest"
        >
          + Ajouter une pâtisserie
        </button>
      </div>

      {chargement ? (
        <p>Chargement...</p>
      ) : produits.length === 0 ? (
        <p className="opacity-60 text-sm">Aucune pâtisserie pour l'instant.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={produits.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {produits.map((produit) => (
                <ProduitTriable
                  key={produit.id}
                  produit={produit}
                  onEditer={setModeEdition}
                  onSupprimer={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function FormulaireProduit({ produitId, produits, onTermine }) {
  const produitExistant = produitId
    ? produits.find((p) => p.id === produitId)
    : null;

  const [name, setName] = useState(produitExistant?.name || "");
  const [description, setDescription] = useState(
    produitExistant?.description || "",
  );
  const [photoUrl, setPhotoUrl] = useState(produitExistant?.photo_url || "");
  const [videoUrl, setVideoUrl] = useState(produitExistant?.video_url || "");
  const [focusX, setFocusX] = useState(produitExistant?.focus_x ?? 50);
  const [focusY, setFocusY] = useState(produitExistant?.focus_y ?? 50);
  const [enregistrement, setEnregistrement] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);

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
      setPhotoUrl(data.url);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setEnregistrement(true);

    const url = produitId
      ? `${API_URL}/api/products/${produitId}`
      : `${API_URL}/api/products`;
    const method = produitId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          photoUrl,
          videoUrl,
          categoryId: null,
          focusX,
          focusY,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Échec de l'enregistrement");
      }
      onTermine();
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">
        {produitId ? "Modifier" : "Ajouter"} une pâtisserie
      </h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Nom
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Photo
          </label>
          {photoUrl && (
            <div
              className="relative mb-3 cursor-crosshair w-32 h-32"
              onClick={handleClicPhoto}
            >
              <img
                src={urlImage(photoUrl)}
                alt="Aperçu"
                className="w-full h-full rounded-lg object-cover"
                style={{ objectPosition: `${focusX}% ${focusY}%` }}
              />
              <div
                className="absolute w-4 h-4 border-2 border-brand-accent rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${focusX}%`, top: `${focusY}%` }}
              />
            </div>
          )}
          {photoUrl && (
            <p className="text-xs opacity-60 mb-2">
              Clique sur la photo pour choisir la zone à mettre en avant.
            </p>
          )}
          <label
            htmlFor="photo-input"
            className="inline-block px-6 py-3 bg-brand-dark text-brand-light rounded-full text-xs uppercase tracking-widest cursor-pointer hover:bg-brand-dark/85 transition-colors"
          >
            {photoUrl ? "Changer la photo" : "Choisir une photo"}
          </label>
          <input
            id="photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {uploadEnCours && (
            <p className="text-xs opacity-60 mt-1">Envoi en cours...</p>
          )}
        </div>
        <div>
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Lien vidéo (optionnel)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/... ou instagram.com/..."
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={enregistrement || uploadEnCours}
            className="px-8 py-3 bg-brand-dark text-brand-accent rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={onTermine}
            className="px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest hover:bg-brand-dark/85 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
