import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function RouteProtegee() {
  const [statut, setStatut] = useState("chargement");

  useEffect(() => {
    fetch("http://localhost:3001/api/auth/me", { credentials: "include" })
      .then((res) => {
        setStatut(res.ok ? "connecte" : "non-connecte");
      })
      .catch(() => setStatut("non-connecte"));
  }, []);

  if (statut === "chargement") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (statut === "non-connecte") {
    return <Navigate to="/admin/connexion" replace />;
  }

  return <Outlet />;
}
