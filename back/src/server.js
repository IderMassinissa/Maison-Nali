require("dotenv").config();
const express = require("express");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const pageRoutes = require("./routes/pages");
const announcementRoutes = require("./routes/announcements");
const settingsRoutes = require("./routes/settings");
const openingHoursRoutes = require("./routes/openingHours");
const eventPhotoRoutes = require("./routes/eventPhotos");
const path = require("path");
const uploadRoutes = require("./routes/upload");
const cors = require("cors");
const helmet = require("helmet");
const SqliteSessionStore = require("./db/sqliteSessionStore");
const { NOM_COOKIE_SESSION } = require("./constants");

const EST_PROD = process.env.NODE_ENV === "production";
const EST_TEST = process.env.NODE_ENV === "test";

// Variables obligatoires au démarrage : mieux vaut un arrêt immédiat et
// explicite qu'un comportement cassé ou non sécurisé en silence (session
// signée avec secret=undefined, CORS qui bloque tout le monde en prod...).
if (!process.env.SESSION_SECRET) {
  console.error(
    "SESSION_SECRET manquant dans .env -- impossible de démarrer le serveur.",
  );
  process.exit(1);
}

if (EST_PROD && !process.env.FRONT_URL) {
  console.error(
    "FRONT_URL manquant dans .env -- obligatoire en production (configure le CORS).",
  );
  process.exit(1);
}

const FRONT_URL = process.env.FRONT_URL || "http://localhost:5173";

const app = express();

// Derrière un reverse proxy (nginx, l'hébergeur choisi...), Express doit
// savoir qu'il peut faire confiance aux en-têtes X-Forwarded-* pour
// déterminer si la requête est bien en HTTPS (nécessaire pour
// cookie.secure). Désactivé par défaut -- à activer explicitement une fois
// l'infrastructure de production connue.
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// helmet() pose un ensemble d'en-têtes de sécurité par défaut (retire aussi
// X-Powered-By, cf. F2). Son réglage crossOriginResourcePolicy par défaut
// ("same-origin") bloquerait le chargement de /uploads/... par le front :
// front (http://localhost:5173) et back (http://localhost:3001) sont deux
// origines différentes par construction (même en production, sauf si un
// jour servis depuis le même domaine). On relâche explicitement cette seule
// protection à "cross-origin" -- elle n'a pas de sens ici, les images
// uploadées sont déjà publiques (servies sans authentification).
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: FRONT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    name: NOM_COOKIE_SESSION,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // En test, on reste sur le MemoryStore par défaut d'express-session
    // (pas besoin de fichier SQLite pour des tests jetables, et ça évite
    // tout conflit entre fichiers de test executes en serie).
    store: EST_TEST ? undefined : new SqliteSessionStore(),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      // HTTPS uniquement en production -- en dev local (http://localhost),
      // un cookie "secure" ne serait jamais envoyé par le navigateur.
      secure: EST_PROD,
    },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/opening-hours", openingHoursRoutes);
app.use("/api/event-photos", eventPhotoRoutes);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../public/uploads"), {
    maxAge: "7d",
  }),
);
app.use("/api/upload", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Une erreur est survenue sur le serveur" });
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;
