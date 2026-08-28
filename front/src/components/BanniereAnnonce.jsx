export default function BanniereAnnonce({ message, active }) {
  if (!active) return null;

  return (
    <div className="bg-brand-accent text-brand-dark text-center py-3 px-4 text-sm font-medium">
      {message}
    </div>
  );
}
