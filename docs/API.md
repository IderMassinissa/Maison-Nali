# API

Toutes les routes vérifiées en lisant `back/src/routes/*.js` le 2026-10-10 (branche `docs/v1`). Base : `/api`. Format : JSON (`Content-Type: application/json`), sauf `/api/upload` (`multipart/form-data`). Toutes les réponses d'erreur ont la forme `{ "error": "message en français" }`, sauf mention contraire.

Le tableau d'autorisation ci-dessous a été **revérifié ligne par ligne contre le code actuel** pour cette documentation, aucun écart trouvé.

## Authentification (`/api/auth`) — `back/src/routes/auth.js`

| Méthode | URL | Auth | Corps attendu | Validations | Codes |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | non (limité en débit : 5 tentatives / 15 min / IP, `rateLimitLogin`) | `{ email, password }` | email existe + mot de passe correct (bcrypt) | 200 `{ message }` (régénère la session) · 401 identifiants incorrects · 429 trop de tentatives |
| POST | `/api/auth/logout` | non | — | — | 200 `{ message }` (détruit la session, supprime le cookie) |
| GET | `/api/auth/me` | non* | — | — | 200 `{ userId }` · 401 si pas de session — *sert justement à vérifier si on est connecté* |
| PUT | `/api/auth/password` | **oui** | `{ ancienMotDePasse, nouveauMotDePasse }` | nouveau mot de passe ≥ 8 caractères ; ancien mot de passe vérifié contre le hash | 200 `{ message }` · 400 trop court · 401 ancien mot de passe incorrect/pas de session · 500 |

## Pages et blocs (`/api/pages`) — `back/src/routes/pages.js`

| Méthode | URL | Auth | Corps attendu | Validations | Codes |
|---|---|---|---|---|---|
| GET | `/api/pages` | non | — | — | 200 liste des pages |
| GET | `/api/pages/:slug` | non | — | — | 200 `{ ...page, sections: [...] }` · 404 page introuvable |
| GET | `/api/pages/sections/:id` | **oui** | — | — | 200 section brute · 404 |
| PUT | `/api/pages/sections/:id/content` | **oui** | `{ content }` (chaîne JSON) | JSON valide, **puis règles spécifiques au `type` de la section** (voir ci-dessous) | 200 `{ message }` · 400 JSON invalide ou validation échouée |

Validations par type de section (uniquement si `section.type` correspond) :

- **`bloc-evenements`** : `titre` ≤ 100 car., `intro` ≤ 1000 car., `formats` ≤ 1000 car.
- **`hero`** : `texteBouton` ≤ 50 car. ; `lienBouton` via `validateLienBouton` (chemin interne `/...` ou `https://` explicite uniquement, ≤ 200 car.) ; `photo` via `validatePhotoInterne` (`/uploads/<nom>.(jpg|jpeg|png|webp)` ou vide, ≤ 300 car.).
- **`bloc-histoire`** : `texteBouton`/`lienBouton` via `validateBlocHistoire` (mêmes règles que le lien du Hero) ; `photo` via `validatePhotoInterne`.
- **`bloc-localisation`** : `photo` via `validatePhotoInterne`.
- **`bloc-entete`** : `titre` obligatoire (non vide), `libelle` ≤ 60 car., `titre` ≤ 100 car., `intro` ≤ 300 car.
- **`bloc-patisseries`** : aucune règle dédiée (contenu non utilisé par l'affichage public, qui lit `products`).

## Produits (`/api/products`) — `back/src/routes/products.js`

| Méthode | URL | Auth | Corps attendu | Validations | Codes |
|---|---|---|---|---|---|
| GET | `/api/products` | non | — | — | 200 liste triée par `position` |
| GET | `/api/products/:id` | non | — | — | 200 produit · 404 |
| POST | `/api/products` | **oui** | `{ name, description, photoUrl, videoUrl, categoryId, focusX, focusY }` | `name` requis ; `photoUrl` via `validatePhotoInterne` ; `videoUrl` via `validateLienBouton` | 201 `{ id }` · 400 |
| PUT | `/api/products/:id` | **oui** | idem POST | idem POST | 200 `{ message }` · 400 |
| PUT | `/api/products/:id/position` | **oui** | `{ position }` | aucune validation de format explicite | 200 `{ message }` |
| DELETE | `/api/products/:id` | **oui** | — | — | 200 `{ message }` |

`focusX`/`focusY` par défaut à 50 (centre) si absents, cf. `back/src/repositories/products.js`.

## Catégories (`/api/categories`) — `back/src/routes/categories.js`

**Non utilisée par le front actuel** (commentaire explicite dans le code : prévu pour une V2 de catégorisation, aucun appel émis depuis `front/src`).

| Méthode | URL | Auth | Corps attendu | Validations | Codes |
|---|---|---|---|---|---|
| GET | `/api/categories` | non | — | — | 200 liste |
| POST | `/api/categories` | **oui** | `{ name }` | `name` requis | 201 `{ id }` · 400 |

## Bannière (`/api/announcements`) — `back/src/routes/announcements.js`

| Méthode | URL | Auth | Corps attendu | Validations | Codes |
|---|---|---|---|---|---|
| GET | `/api/announcements` | non | — | renvoie `null` si la bannière est inactive ou hors de sa fenêtre de dates (fuseau Europe/Paris) | 200 bannière ou `null` |
| GET | `/api/announcements/admin` | **oui** | — | pas de filtrage de visibilité (vue admin brute) | 200 bannière ou `null` |
| PUT | `/api/announcements` | **oui** | `{ message, active, startDate, endDate }` | dates au format `AAAA-MM-JJ`, calendairement valides, `endDate >= startDate` si les deux sont fournies | 200 `{ message }` · 400 |

## Réglages (`/api/settings`) — `back/src/routes/settings.js`

Paires clé/valeur libres (`settings.key` unique). Clés connues utilisées par le front : `phone`, `address_text`, `social_instagram`, `social_facebook`, `social_tiktok`.

| Méthode | URL | Auth | Corps attendu | Validations | Codes |
|---|---|---|---|---|---|
| GET | `/api/settings/:key` | non | — | — | 200 `{ key, value }` (`value: null` si clé absente) |
| PUT | `/api/settings/:key` | **oui** | `{ value }` | si `key` commence par `social_` : doit être une URL `http(s)://...` ; si `key === "phone"` : regex `^[0-9 +.()-]{6,20}$` | 200 `{ message }` · 400 |

## Horaires (`/api/opening-hours`) — `back/src/routes/openingHours.js`

| Méthode | URL | Auth | Corps attendu | Validations | Codes |
|---|---|---|---|---|---|
| GET | `/api/opening-hours` | non | — | — | 200 liste (7 jours) |
| PUT | `/api/opening-hours/:id` | **oui** | `{ openTime, closeTime }` | les deux vides = jour fermé (accepté) ; sinon format `HH:MM` les deux, et fermeture > ouverture | 200 `{ message }` · 400 |

## Photos événements (`/api/event-photos`) — `back/src/routes/eventPhotos.js`

Limite stricte de **5 photos** (`LIMITE_PHOTOS`), appliquée en transaction SQL atomique (`createEventPhotoAvecLimite`).

| Méthode | URL | Auth | Corps attendu | Validations | Codes |
|---|---|---|---|---|---|
| GET | `/api/event-photos` | non | — | — | 200 liste triée par `position` |
| POST | `/api/event-photos` | **oui** | `{ imageUrl, alt, position }` | `imageUrl` doit matcher `/uploads/<nom-sûr>.(jpe?g\|png\|webp)`, pas de `..` ; `alt` ≤ 150 car. ; limite de 5 atteinte → refus | 201 `{ id }` · 400 |
| PUT | `/api/event-photos/:id` | **oui** | `{ alt }` | `id` entier, photo existante, `alt` ≤ 150 car. | 200 `{ message }` · 400 · 404 |
| PUT | `/api/event-photos/:id/position` | **oui** | `{ position }` | `id` entier, photo existante, `position` entier | 200 `{ message }` · 400 · 404 |
| DELETE | `/api/event-photos/:id` | **oui** | — | `id` entier, photo existante | 200 `{ message }` · 400 · 404 |

## Upload (`/api/upload`) — `back/src/routes/upload.js`

| Méthode | URL | Auth | Corps attendu | Validations | Codes |
|---|---|---|---|---|---|
| POST | `/api/upload` | **oui** | `multipart/form-data`, champ `photo` | Content-Type déclaré ∈ {jpeg, png, webp} ; taille ≤ 5 Mo (`multer`) ; signature binaire réelle (magic bytes) confirmée JPEG/PNG/WebP ; décompression ≤ 40 Mpx | 200 `{ url }` · 400 (type/signature/taille/pixels invalides) · 401 · 500 |

Traitement appliqué avant écriture (détail complet : `docs/ARCHITECTURE.md`) : rotation EXIF, suppression de toutes les métadonnées, largeur max 1600px sans agrandissement, recompression. Le fichier est écrit sous un nom généré côté serveur, avec l'extension du type réellement détecté — jamais le nom ou l'extension fournis par le client.

## Fichiers statiques (`/uploads/*`)

Pas une route API à proprement parler : `express.static` sert directement `back/public/uploads`, sans authentification (photos publiques), avec `Cache-Control: public, max-age=604800` (7 jours).

## Tableau d'autorisation — synthèse

| Route | Méthode | Protégée (`requireAuth`) |
|---|---|---|
| `/api/auth/login` | POST | non (débit limité) |
| `/api/auth/logout` | POST | non |
| `/api/auth/me` | GET | non |
| `/api/auth/password` | PUT | **oui** |
| `/api/categories` | GET | non |
| `/api/categories` | POST | **oui** |
| `/api/announcements` | GET | non |
| `/api/announcements/admin` | GET | **oui** |
| `/api/announcements` | PUT | **oui** |
| `/api/opening-hours` | GET | non |
| `/api/opening-hours/:id` | PUT | **oui** |
| `/api/event-photos` | GET | non |
| `/api/event-photos` | POST | **oui** |
| `/api/event-photos/:id` | PUT | **oui** |
| `/api/event-photos/:id/position` | PUT | **oui** |
| `/api/event-photos/:id` | DELETE | **oui** |
| `/api/pages` | GET | non |
| `/api/pages/:slug` | GET | non |
| `/api/pages/sections/:id/content` | PUT | **oui** |
| `/api/pages/sections/:id` | GET | **oui** |
| `/api/products` | GET | non |
| `/api/products/:id` | GET | non |
| `/api/products` | POST | **oui** |
| `/api/products/:id` | PUT | **oui** |
| `/api/products/:id/position` | PUT | **oui** |
| `/api/products/:id` | DELETE | **oui** |
| `/api/settings/:key` | GET | non |
| `/api/settings/:key` | PUT | **oui** |
| `/api/upload` | POST | **oui** |

Toutes les routes d'écriture sont protégées. Les seules lectures protégées sont `GET /api/pages/sections/:id` (contenu brut d'un bloc, pas destiné au public) et `GET /api/announcements/admin` (vue non filtrée par la fenêtre de visibilité).

## Erreurs génériques

- Route inexistante → 404 `{ "error": "Route introuvable" }` (gestionnaire catch-all, `server.js`).
- Erreur non gérée → 500 `{ "error": "Une erreur est survenue sur le serveur" }` (gestionnaire d'erreur générique, aucune stack trace renvoyée au client).
