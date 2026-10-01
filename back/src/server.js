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

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
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
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/api/upload", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Une erreur est survenue sur le serveur" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
