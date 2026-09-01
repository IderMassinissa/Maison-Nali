import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

export default function Footer() {
  const [reseaux, setReseaux] = useState({});

  useEffect(() => {
    Promise.all(
      ["social_instagram", "social_facebook", "social_tiktok"].map((key) =>
        fetch(`http://localhost:3001/api/settings/${key}`)
          .then((res) => res.json())
          .then((data) => [key, data.value]),
      ),
    ).then((entries) => setReseaux(Object.fromEntries(entries)));
  }, []);

  return (
    <footer className="bg-[#0b1a14] text-brand-light py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
        <div>
          <Link
            to="/"
            className="font-display text-2xl tracking-tight block mb-4 text-brand-accent uppercase"
          >
            Maison Nali
          </Link>
          <p className="text-xs uppercase tracking-widest opacity-60">
            Gardiens de la douceur algérienne
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            to="/patisseries"
            className="text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
          >
            Pâtisseries
          </Link>
          <Link
            to="/a-propos"
            className="text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
          >
            À propos
          </Link>
          <Link
            to="/adresse"
            className="text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
          >
            Adresse
          </Link>
        </div>

        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-4">
            {reseaux.social_instagram && (
              <a
                href={reseaux.social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-accent transition-colors"
              >
                <FaInstagram />
              </a>
            )}
            {reseaux.social_facebook && (
              <a
                href={reseaux.social_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-accent transition-colors"
              >
                <FaFacebookF />
              </a>
            )}
            {reseaux.social_tiktok && (
              <a
                href={reseaux.social_tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-accent transition-colors"
              >
                <FaTiktok />
              </a>
            )}
          </div>
          <p className="text-[10px] opacity-40">
            © 2026 Maison Nali. Tous droits réservés.
          </p>
          <Link
            to="/mentions-legales"
            className="text-[10px] opacity-40 hover:opacity-100 transition-opacity"
          >
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
