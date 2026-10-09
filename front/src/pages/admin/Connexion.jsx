import { useState } from "react";
import { useNavigate } from "react-router-dom";
import usePageSeo from "../../hooks/usePageSeo";
const API_URL = import.meta.env.VITE_API_URL;

export default function Connexion() {
  usePageSeo("Maison Nali — Administration", "Espace d'administration Maison Nali.");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErreur(data.error || "Erreur de connexion");
        return;
      }

      navigate("/admin");
    } catch (err) {
      console.error(err);
      setErreur("Impossible de contacter le serveur");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-center mb-8">
          Administration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="connexion-email"
              className="block text-xs uppercase tracking-widest opacity-60 mb-2"
            >
              Email
            </label>
            <input
              id="connexion-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="connexion-password"
              className="block text-xs uppercase tracking-widest opacity-60 mb-2"
            >
              Mot de passe
            </label>
            <input
              id="connexion-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white"
            />
          </div>

          {erreur && <p className="text-red-600 text-sm">{erreur}</p>}

          <button
            type="submit"
            className="w-full px-8 py-3 bg-brand-dark text-brand-light rounded-full text-sm uppercase tracking-widest"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
