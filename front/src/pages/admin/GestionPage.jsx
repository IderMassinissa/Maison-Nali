import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { BLOCS_DISPONIBLES } from "../../blocsDisponibles";
const API_URL = import.meta.env.VITE_API_URL;

export default function GestionPage() {
  const { slug } = useParams();
  return <ContenuPage key={slug} slug={slug} />;
}

function BlocTriable({ section, slug, onSupprimer }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
      <span className="text-xs uppercase tracking-widest opacity-50">
        {section.type}
      </span>
      <span className="flex-1 text-sm">Position {section.position}</span>
      <Link
        to={`/admin/pages/${slug}/blocs/${section.id}`}
        className="text-xs uppercase tracking-widest text-brand-accent hover:underline"
      >
        Éditer
      </Link>
      <button
        onClick={() => onSupprimer(section.id)}
        className="text-xs uppercase tracking-widest text-red-600 hover:underline"
      >
        Supprimer
      </button>
    </div>
  );
}

function ContenuPage({ slug }) {
  const [page, setPage] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [ajoutOuvert, setAjoutOuvert] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  function chargerPage() {
    return fetch(`${API_URL}/api/pages/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Page introuvable");
        return res.json();
      })
      .then((data) => setPage(data))
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerPage();
  }, [slug]);

  async function handleAjouterBloc(type) {
    await fetch(`${API_URL}/api/pages/${slug}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type }),
    });
    setAjoutOuvert(false);
    chargerPage();
  }

  async function handleSupprimerBloc(id) {
    if (!window.confirm("Supprimer ce bloc ?")) return;
    await fetch(`${API_URL}/api/pages/sections/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    chargerPage();
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = page.sections.findIndex((s) => s.id === active.id);
    const newIndex = page.sections.findIndex((s) => s.id === over.id);
    const nouvelOrdre = arrayMove(page.sections, oldIndex, newIndex);

    setPage({ ...page, sections: nouvelOrdre });

    nouvelOrdre.forEach((section, index) => {
      fetch(`${API_URL}/api/pages/sections/${section.id}/position`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ position: index + 1 }),
      });
    });
  }

  if (chargement) return <p>Chargement...</p>;
  if (erreur) return <p className="text-red-600">{erreur}</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Page : {page.title}</h1>

      {page.sections.length === 0 ? (
        <p className="opacity-60 text-sm">
          Aucun bloc sur cette page pour l'instant.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={page.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {page.sections.map((section) => (
                <BlocTriable
                  key={section.id}
                  section={section}
                  slug={slug}
                  onSupprimer={handleSupprimerBloc}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {ajoutOuvert ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {BLOCS_DISPONIBLES.map((b) => (
            <button
              key={b.type}
              onClick={() => handleAjouterBloc(b.type)}
              className="px-4 py-2 border border-brand-border rounded-full text-xs uppercase tracking-widest hover:bg-brand-surface"
            >
              {b.label}
            </button>
          ))}
          <button
            onClick={() => setAjoutOuvert(false)}
            className="px-4 py-2 text-xs uppercase tracking-widest opacity-60"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAjoutOuvert(true)}
          className="mt-6 px-6 py-3 bg-brand-dark text-brand-light rounded-full text-xs uppercase tracking-widest"
        >
          + Ajouter un bloc
        </button>
      )}
    </div>
  );
}
