/**
 * Remonte en haut de page à chaque changement de route — react-router ne
 * le fait pas lui-même, une navigation garderait sinon le défilement de la
 * page précédente. Monté une fois à la racine de l'app, ne rend rien.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
