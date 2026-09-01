import { useEffect, useState } from "react";

export default function GestionProduits() {
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modeEdition, setModeEdition] = useState(null); // null = liste, 'nouveau' ou un id = formulaire

  function chargerProduits() {
    fetch("http://localhost:3001/api/products")
      .then((res) => res.json())
      .then((data) => setProduits(data))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerProduits();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Supprimer ce produit ?")) return;

    await fetch(`http://localhost:3001/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    chargerProduits();
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
        <div className="flex flex-col gap-3">
          {produits.map((produit) => (
            <div
              key={produit.id}
              className="flex items-center gap-4 p-4 bg-white border border-brand-border rounded-xl"
            >
              {produit.photo_url && (
                <img
                  src={produit.photo_url}
                  alt={produit.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <span className="flex-1 text-sm font-medium">{produit.name}</span>
              <button
                onClick={() => setModeEdition(produit.id)}
                className="text-xs uppercase tracking-widest text-brand-accent hover:underline"
              >
                Éditer
              </button>
              <button
                onClick={() => handleDelete(produit.id)}
                className="text-xs uppercase tracking-widest text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
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
  const [enregistrement, setEnregistrement] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);

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
      setPhotoUrl(`http://localhost:3001${data.url}`);
    } catch (err) {
      alert("Erreur upload : " + err.message);
    } finally {
      setUploadEnCours(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnregistrement(true);

    const url = produitId
      ? `http://localhost:3001/api/products/${produitId}`
      : "http://localhost:3001/api/products";
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
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Nom
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Photo
          </label>
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Aperçu"
              className="w-32 h-32 rounded-lg object-cover mb-3"
            />
          )}
          <label
            htmlFor="photo-input"
            className="inline-block px-6 py-3 border border-brand-border rounded-full text-xs uppercase tracking-widest cursor-pointer hover:bg-brand-surface transition-colors"
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
            <p className="text-xs opacity-60 mt-2">Envoi en cours...</p>
          )}
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
            Lien vidéo (optionnel)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/... ou instagram.com/..."
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={enregistrement || uploadEnCours}
            className="px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={onTermine}
            className="px-8 py-3 border border-brand-border rounded-full text-sm uppercase tracking-widest"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
