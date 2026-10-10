# Sécurité

Synthèse des mesures effectivement en place dans le code, rattachées à l'OWASP Top 10:2021. Source de vérité détaillée : `Documentation/Securite_Passe1_2026-10-09.md` (audit + correctifs complets, branche `security/audit-1`, 23/25 constats corrigés) — ce document en est un résumé organisé par catégorie OWASP, avec renvoi vers les commits réels. Vérifié contre le code le 2026-10-10.

## Règle — aucune valeur réelle de secret, nulle part

**Aucune valeur réelle de secret** (clé de session, mot de passe, jeton, identifiant de session actif) **ne doit jamais apparaître dans le dépôt, dans cette documentation, ni dans un log de session/commande conservé.** Exemples toujours fictifs (`<64 caractères hexadécimaux générés par ...>`, `admin@exemple.fr`, `mot-de-passe-fort`), jamais une valeur réellement générée ou utilisée, même désactivée ou expirée. Rappel direct : un `SESSION_SECRET` réel a été commis par erreur comme "exemple" dans `docs/DEPLOY.md` (commit initial `9a38047`, branche `docs/v1`, jamais poussée) — corrigé avant merge par réécriture du commit (`git commit --amend`), remplacé par un placeholder explicite. `.env` est gitignoré (vérifié, cf. H1 ci-dessous) — cette règle couvre ce que `.gitignore` ne peut pas couvrir : la documentation et les exemples écrits à la main.

## A01:2021 — Broken Access Control

Toutes les routes d'écriture (`POST`/`PUT`/`DELETE`) sont protégées par le middleware `requireAuth` (vérification de `req.session.userId`), sauf `POST /api/auth/login` lui-même (public par nature, mais limité en débit). Tableau complet vérifié route par route : `docs/API.md`.

- `GET /api/pages/sections/:id` (contenu brut d'un bloc, pas destiné au public) protégé — commit `6a7d56b`.
- Un seul rôle existe (`users`), pas de granularité de permission — n'est pas un problème dans le contexte (un seul compte admin).

## A02:2021 — Cryptographic Failures

- Mots de passe hashés avec `bcrypt`, coût **12** (`back/src/repositories/auth.js`) — commit `6a7d56b` (passé de 10 à 12).
- `SESSION_SECRET` obligatoire au démarrage, jamais de valeur par défaut — commit `3c710ee`.
- Cookie de session : `secure: true` en production (`NODE_ENV=production`), `httpOnly: true` — commit `3c710ee`.
- `Strict-Transport-Security` envoyé par `helmet()` (`max-age=31536000; includeSubDomains`) — commit `a55b945`. Sans effet tant que le site n'est pas servi en HTTPS.
- `.env` jamais commis (vérifié par l'historique git lors de l'audit) — conforme, aucune action.

## A03:2021 — Injection

- **SQL** : 100% des requêtes passent par `better-sqlite3` en requêtes préparées paramétrées, aucune concaténation de valeur dans une chaîne SQL — vérifié sur tous les fichiers `back/src/repositories/*.js` lors de l'audit et revérifié pour cette documentation. Testé explicitement : `src/routes/security.test.js` (injection dans un paramètre d'URL, ne casse pas la requête).
- **XSS** : aucun `dangerouslySetInnerHTML`/`innerHTML` dans le front — conforme, aucune action.
- Liens utilisateur (`lienBouton` du Hero et de bloc-histoire, `videoUrl` produit) : validés côté back (`validateLienBouton.js`), seuls un chemin interne (`/...`) ou une URL `https://` explicite sont acceptés — rejette `javascript:`, `data:`, `http://` non chiffré. Commit `2182279`.
- Chemins de photo (`photoUrl`, `content.photo` des sections, `event_photos.image_url`) : validés (`validatePhotoInterne.js`/`validateEventPhoto.js`), uniquement `/uploads/<nom-sûr>.(jpg|jpeg|png|webp)`. Commit `2261671`.

## A04:2021 — Insecure Design

- Rate limiting sur `/api/auth/login` : 5 tentatives / 15 min / IP, middleware maison (`back/src/middleware/rateLimitLogin.js`), compteur réinitialisé à la connexion réussie. Commit `3c710ee`.
- Régénération de session à la connexion (`req.session.regenerate()`) — empêche la fixation de session. Commit `3c710ee`.
- Upload d'image : conçu dès le départ pour ne jamais faire confiance aux métadonnées fournies par le client (voir A08 ci-dessous) — pas un correctif ajouté après coup, c'est l'architecture de `upload.js`.
- Limite de pixels décompressés (40 Mpx) sur le pipeline d'optimisation d'image, contre une image "bombe" (petit fichier qui décompresse en image énorme) — `back/src/utils/optimiserImage.js`, lot performance images (hors périmètre de l'audit sécurité initial, ajouté ensuite).

## A05:2021 — Security Misconfiguration

- `helmet()` posé globalement (CSP, `X-Frame-Options`, `X-Content-Type-Options`, retrait de `X-Powered-By`...) — commit `a55b945`.
- Origine CORS lue depuis `FRONT_URL` (plus de valeur en dur) — commit `3c710ee`.
- Variables obligatoires vérifiées au démarrage (`SESSION_SECRET` toujours, `FRONT_URL` en production), arrêt explicite sinon — commit `3c710ee`.
- Aucune stack trace renvoyée au client (gestionnaire d'erreur générique dans `server.js`, message fixe) — conforme, aucune action.
- `trust proxy` : mécanisme présent (`TRUST_PROXY=true`), **désactivé par défaut** — à activer avec la configuration réelle une fois l'hébergeur choisi (cf. Limites connues).

## A06:2021 — Vulnerable and Outdated Components

- Vulnérabilité **critique** `proxy-addr` (transitif via `express`, CVSS 9.1) corrigée par `npm audit fix` sans montée de version majeure — commit `c2e6fac`. `npm audit` : 0 vulnérabilité après correctif (back et front).
- Chaque nouvelle dépendance ajoutée depuis (`helmet`, `compression`, `sharp`) a fait l'objet d'une vérification de licence et de maintenance active avant ajout (licence, dernière publication, mainteneur) — démarche documentée dans `Documentation/A11y_Perf_Passe1_2026-10-09.md`.
- Le store de session maison (`sqliteSessionStore.js`) a été écrit à la main plutôt que d'ajouter une dépendance tierce, après constat que les paquets npm existants pour ce besoin étaient soit abandonnés (dernière publication 2022) soit sous licence GPL-3.0 (incompatible avec un livrable client réutilisable).

## A07:2021 — Identification and Authentication Failures

- Message d'erreur identique (`"Identifiants incorrects"`, 401) que l'email soit inconnu ou le mot de passe faux — pas d'énumération de comptes possible. Déjà conforme.
- Rate limiting + régénération de session : voir A04.
- Cookie `sameSite: "lax"` — commit `3c710ee`. Contrainte d'hébergement associée : `docs/DEPLOY.md`.
- Pas de mot de passe par défaut, pas de compte admin en dur dans le code — déjà conforme.

## A08:2021 — Software and Data Integrity Failures

- Upload d'image : le `Content-Type` déclaré par le client est **ignoré pour la décision finale** — seuls les octets de signature réels du fichier reçu (magic bytes JPEG/PNG/WebP) déterminent le type accepté (`back/src/utils/detecterTypeImage.js`). Un fichier HTML renommé `.jpg` avec un `Content-Type: image/jpeg` falsifié est rejeté (testé : `src/routes/upload.test.js`). Commit `e4ace9b`.
- L'extension du fichier écrit sur disque est dérivée du type réellement détecté, jamais du nom fourni par le client — empêche l'écriture d'un fichier exécutable sous une extension trompeuse. Commit `e4ace9b`.
- Nom de fichier généré côté serveur (`Date.now()-random.ext`) — pas de "path traversal" possible via le nom client. Déjà conforme.

## A09:2021 — Security Logging and Monitoring Failures

**Non couvert.** Aucun système de journalisation structurée ni de supervision (alerting, détection d'anomalie) n'existe dans le code — uniquement des `console.error()` ponctuels sur les erreurs serveur (back/src/routes/*.js, visibles dans les logs du process si redirigés vers un fichier par l'environnement d'exécution). Pas de traçabilité des connexions échouées au-delà du compteur de rate limiting en mémoire (perdu au redémarrage). À considérer avant une mise en production avec enjeu de disponibilité/traçabilité réel.

## A10:2021 — Server-Side Request Forgery (SSRF)

Non applicable en l'état : le back ne fait aucune requête HTTP sortante vers une URL fournie par un utilisateur (les liens/URL de vidéo saisis en admin — `videoUrl`, `lienBouton` — sont stockés et renvoyés tels quels au front, jamais récupérés côté serveur).

## RGPD (hors OWASP, propre au contexte site vitrine)

- Polices auto-hébergées, plus aucune requête vers les serveurs Google Fonts — commit `02b4c84`.
- Pas de cookie non essentiel, pas de bannière de consentement nécessaire — déjà conforme.
- Mention sur l'absence de collecte de données ajoutée aux mentions légales — commit `17db218`.

## Limites connues et reportées

- **K2 — Mentions légales incomplètes** : en attente du choix d'hébergeur (raison sociale/adresse de l'hébergeur à renseigner), volontairement non touché sur instruction explicite. `front/src/pages/MentionsLegales.jsx`.
- **CSRF — pas de token CSRF complet** : protection actuelle = CORS restrictif (origine unique autorisée) + `sameSite: "lax"` + API strictement JSON (pas de formulaire HTML natif soumis en POST vers les routes d'écriture, donc pas de vecteur CSRF classique exploitable aujourd'hui). Jugé suffisant en l'état ; un token CSRF complet (effort estimé ~2h lors de l'audit) serait à ajouter seulement si l'architecture évolue vers des formulaires HTML natifs ciblant les routes d'écriture.
- **`trust proxy`** : mécanisme en place (variable `TRUST_PROXY`), désactivé par défaut — valeur et activation réelle à définir une fois l'hébergeur choisi (lié à K2).
- **A09 (logging/monitoring)** : absent, voir ci-dessus — pas un correctif reporté avec un plan précis, juste un angle non couvert à ce jour.
- **`categories`** : table et route existent en base/API mais sans aucun contrôle d'accès métier au-delà de `requireAuth` — sans conséquence tant que la fonctionnalité (prévue pour une V2) n'est pas exposée côté front.

## Dépendances de sécurité directes

| Paquet | Rôle | Version (`back/package.json`) |
|---|---|---|
| `bcrypt` | Hash des mots de passe | `^6.0.0` |
| `helmet` | En-têtes HTTP de sécurité | `^8.3.0` |
| `cors` | Contrôle CORS | `^2.8.6` |
| `express-session` | Sessions (store maison, cf. `docs/ARCHITECTURE.md`) | `^1.19.0` |
| `multer` | Réception des uploads (stockage mémoire uniquement) | `^2.3.0` |
| `sharp` | Nettoyage/recompression des images uploadées | `^0.35.5` |

## Tests liés à la sécurité

`back/src/routes/security.test.js` (4 tests) + tests dédiés par fonctionnalité (`detecterTypeImage.test.js`, `optimiserImage.test.js`, `upload.test.js`, `rateLimitLogin.test.js`, `sqliteSessionStore.test.js`, et tous les `validate*.test.js`). Détail complet : `docs/TESTS.md`.
