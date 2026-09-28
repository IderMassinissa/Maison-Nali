import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import { telHref } from "../utils/telephone";
const API_URL = import.meta.env.VITE_API_URL;

export default function Footer() {
  const [reseaux, setReseaux] = useState({});

  useEffect(() => {
    Promise.all(
      ["social_instagram", "social_facebook", "social_tiktok", "phone"].map(
        (key) =>
          fetch(`${API_URL}/api/settings/${key}`)
            .then((res) => {
              if (!res.ok) throw new Error("Réponse API non ok");
              return res.json();
            })
            .then((data) => [key, data.value])
            .catch(() => [key, null]),
      ),
    ).then((entries) => setReseaux(Object.fromEntries(entries)));
  }, []);

  return (
    <footer className="text-brand-light py-16 px-6 md:px-12 bg-brand-footer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center gap-12 md:grid md:grid-cols-3 md:items-start md:text-left">
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
            {reseaux.phone && (
              <a
                href={telHref(reseaux.phone)}
                className="text-xs opacity-60 hover:opacity-100 hover:text-brand-accent transition-colors block mt-3"
              >
                {reseaux.phone}
              </a>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
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

          <div className="flex flex-col items-center gap-4 md:items-end md:justify-self-end">
            <p className="text-xs uppercase tracking-widest opacity-60">
              Suivez-nous
            </p>
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
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 mt-16">
          <p className="text-xs opacity-40">
            © 2026 Maison Nali. Tous droits réservés.
          </p>
          <span className="text-xs opacity-40">·</span>
          <Link
            to="/mentions-legales"
            className="text-xs opacity-40 hover:opacity-100 transition-opacity"
          >
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
