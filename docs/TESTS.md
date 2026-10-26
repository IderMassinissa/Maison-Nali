# Tests

Vérifié en exécutant réellement la suite le 2026-10-10 (branche `feat/contenu-export`) : **134 tests, 134 passent, 0 échec**. Suite également vérifiée verte sous Node 22.23.3 et Node 24.21.0, pas seulement la version de développement (cf. `docs/DEPLOY.md`, prérequis).

## Lancer les tests

```bash
cd back
npm test
```

`npm test` exécute automatiquement `pretest` (`node src/db/init-test.js`, régénère `back/data/test.sqlite` avec un schéma neuf) puis lance `node --test` sur tous les fichiers `*.test.js` de `src/{repositories,routes,utils,db,middleware}`, en série (`--test-concurrency=1` — nécessaire car plusieurs fichiers partagent la même base de test SQLite).

Aucune suite de tests automatisés n'existe côté front (`front/package.json` ne déclare pas de script `test`) — uniquement `npm run lint` (ESLint) et `npm run build` (échoue si le code ne compile pas).

```bash
cd front
npm run lint
npm run build
```

## Ce que couvrent les 134 tests, par fichier

| Fichier | Nb tests | Couvre |
|---|---|---|
| `src/db/content-export-import.test.js` | 5 | Round-trip `content:export` → `content:import` strictement identique (hors horodatage) ; import refusé sur base non vide ; transaction annulée si une section est invalide (rien écrit, pas même les sections valides qui la suivaient) ; fichiers `/uploads/...` référencés mais absents du disque listés ; couverture des 8 tables de contenu |
| `src/db/sqliteSessionStore.test.js` | 7 | Store de session maison : set/get, session inconnue, expiration, destroy, touch (prolongation), purge périodique, persistance après fermeture/réouverture du fichier (simulation de redémarrage) |
| `src/middleware/rateLimitLogin.test.js` | 7 | Limite de connexion : 5 tentatives passent, 6e bloquée, IP indépendantes, expiration de fenêtre, réinitialisation après succès, purge des entrées expirées, arrêt propre du minuteur |
| `src/repositories/announcements.test.js` | 2 | Lecture/écriture de la bannière, `active=false` stocké correctement |
| `src/repositories/categories.test.js` | 1 | Création d'une catégorie |
| `src/repositories/eventPhotos.test.js` | 5 | Position auto (MAX+1), mise à jour alt, suppression, tri par position, limite de 5 photos appliquée atomiquement (6e insertion ne laisse aucune trace) |
| `src/repositories/openingHours.test.js` | 1 | Lecture de la liste des horaires |
| `src/repositories/products.test.js` | 3 | Création + lecture, mise à jour du nom, suppression |
| `src/repositories/settings.test.js` | 3 | Lecture/écriture d'un réglage, mise à jour (pas de doublon), clé inexistante → `null` |
| `src/routes/eventPhotos.test.js` | 3 | 401 sans authentification sur POST/PUT/DELETE |
| `src/routes/pages.test.js` | 6 | 401 sans authentification ; validations du bloc `bloc-entete` (titre manquant, libellé/titre/intro trop longs, contenu valide accepté) |
| `src/routes/security.test.js` | 4 | 401 sur route admin sans session, injection SQL sans crash, 401 sur modification de réglage, 404 propre |
| `src/routes/upload.test.js` | 4 | 401 sans authentification, faux `.jpg` (texte brut) toujours rejeté, image valide acceptée/redimensionnée/écrite, image "bombe" (>40 Mpx) refusée |
| `src/utils/bannerVisibility.test.js` | 11 | Calcul de date Paris (été/hiver, UTC+2/UTC+1), visibilité selon les dates de début/fin (bornes incluses) |
| `src/utils/detecterTypeImage.test.js` | 7 | Détection JPEG/PNG/WebP réels, HTML renommé `.jpg` non détecté, buffer vide/trop court/undefined ne plantent pas |
| `src/utils/optimiserImage.test.js` | 6 | Redimensionnement >1600px, pas d'agrandissement, rotation EXIF + suppression métadonnées (GPS inclus), rejet image bombe, conservation du format de sortie, repli sur l'original nettoyé si le résultat optimisé est plus lourd |
| `src/utils/phone.test.js` | 6 | Formats de numéro valides/invalides, longueur min/max, valeur non-string |
| `src/utils/validateBannerDates.test.js` | 7 | Dates vides/absentes acceptées, format invalide, date calendaire inexistante (31 février), fin avant début, dates cohérentes |
| `src/utils/validateBlocHistoire.test.js` | 10 | Bouton vide/absent accepté, lien interne/https accepté, http/javascript: rejetés, longueurs max, espaces retirés |
| `src/utils/validateEventPhoto.test.js` | 8 | URL externe rejetée, `..` rejeté, extension interdite rejetée, alt trop long, position non entière rejetée, formats valides acceptés |
| `src/utils/validateLienBouton.test.js` | 11 | Mêmes familles de cas que `validateBlocHistoire` + `data:` rejeté + limite de longueur personnalisable |
| `src/utils/validateOpeningHours.test.js` | 8 | Jour fermé accepté, ouverture/fermeture incomplète rejetée, format d'heure invalide, fermeture avant/égale à l'ouverture rejetée |
| `src/utils/validatePhotoInterne.test.js` | 9 | Photo vide/absente acceptée, chemins `/uploads/...` valides (jpg/webp/majuscules), URL externe rejetée, `..` rejeté, extension interdite rejetée, chemin hors `/uploads` rejeté |

Toutes les suites `repositories`/`routes` s'exécutent contre une vraie base SQLite de test (`back/data/test.sqlite`, régénérée à chaque run), jamais contre la base réelle. `src/routes/upload.test.js` écrit réellement dans `back/public/uploads` le temps du test puis nettoie les fichiers créés (pas de branchement de dossier dédié au test pour cette route — limite connue, déjà notée dans le rapport sécurité).

## Ce qui n'est testé qu'à la main

Aucun test automatisé de bout en bout (navigateur) n'est versionné dans le dépôt. Ont été vérifiés manuellement, au fil des passes successives (audit sécurité, audit accessibilité/performance, optimisation des images), via des sessions Playwright ponctuelles non conservées dans le dépôt :

- Rendu visuel des pages publiques (6 pages, desktop + mobile).
- Navigation clavier (menu mobile : piège de focus, Échap, retour de focus).
- Connexion/déconnexion admin, expiration de session.
- Édition de chacun des 6 types de bloc depuis l'interface admin.
- Upload réel d'image (acceptée, rejetée, message d'erreur affiché).
- Comparaison avant/après du traitement d'image sur les photos réelles du site (captures d'écran).
- En-têtes HTTP réels (CORS, cookies, CSP) via `curl`/outils navigateur.

Ce qui suit formalise un sous-ensemble de ces vérifications en cahier de recettes, à republier à chaque recette manuelle.

## Cahier de recettes

Tableau à remplir lors d'une recette manuelle (colonne "Résultat obtenu" vide par défaut). 32 scénarios, public et admin.

| ID | Fonctionnalité | Scénario | Résultat attendu | Résultat obtenu |
|---|---|---|---|---|
| R01 | Pages publiques | Charger `/`, `/patisseries`, `/a-propos`, `/adresse`, `/evenements`, `/mentions-legales` | Chaque page répond 200, contenu attendu visible, pas d'erreur console | |
| R02 | Fiche produit | Cliquer sur une pâtisserie depuis `/patisseries` | Navigation vers `/patisseries/:id`, détail du produit affiché | |
| R03 | 404 | Charger une URL inexistante (`/n-importe-quoi`) | Page `NotFound` affichée, pas d'erreur serveur | |
| R04 | Menu mobile | Sous 768px, ouvrir le menu, naviguer au clavier (Tab), appuyer sur Échap | Menu plein écran s'ouvre, focus piégé dedans, Échap ferme et rend le focus au bouton hamburger | |
| R05 | Bannière d'annonce | Activer une bannière avec dates englobant aujourd'hui depuis l'admin | Bannière visible sur le site public | |
| R06 | Bannière d'annonce | Activer une bannière avec `endDate` dans le passé | Bannière invisible sur le site public (contrôlé côté back) | |
| R07 | Horaires | Modifier un horaire d'ouverture depuis l'éditeur du bloc Localisation (`/admin/pages/adresse`, bloc Localisation) | Nouvel horaire visible immédiatement sur `/adresse` | |
| R08 | Horaires | Cocher "Fermé" sur un jour | `open_time`/`close_time` passent à `null`, jour affiché "Fermé" côté public | |
| R09 | Connexion admin | Se connecter avec un email/mot de passe valides | Redirection vers `/admin/produits`, session active | |
| R10 | Connexion admin | Se connecter avec un mauvais mot de passe | 401, message "Identifiants incorrects", pas d'indice sur l'existence du compte | |
| R11 | Rate limiting | Échouer 5 connexions de suite depuis la même IP | 6e tentative bloquée avec message d'attente en minutes | |
| R12 | Déconnexion | Cliquer sur "Déconnexion" dans l'admin | Session détruite, cookie supprimé, redirection vers `/admin/connexion` | |
| R13 | Changement de mot de passe | Fournir l'ancien mot de passe correct + un nouveau ≥ 8 caractères | 200, reconnexion possible avec le nouveau mot de passe | |
| R14 | Changement de mot de passe | Fournir un ancien mot de passe incorrect | 401, mot de passe inchangé | |
| R15 | Route protégée | Accéder à `/admin/produits` sans être connecté | Redirection vers `/admin/connexion` | |
| R16 | Édition bloc Hero | Modifier le titre, l'accroche, le lien de bouton | Changements reflétés sur la page publique correspondante | |
| R17 | Édition bloc Hero | Saisir un lien de bouton `javascript:alert(1)` | 400, message d'erreur, rien n'est enregistré | |
| R18 | Édition bloc-histoire | Saisir un texte de bouton de 51 caractères | 400 (limite 50 caractères) | |
| R19 | Édition bloc-entete | Laisser le titre vide et enregistrer | 400, "Le titre est obligatoire" | |
| R20 | Upload image valide | Envoyer un JPEG réel de 3000px de large | 200, URL `/uploads/...` renvoyée, image affichée redimensionnée (≤1600px) | |
| R21 | Upload image invalide | Renommer un fichier texte en `.jpg` et l'envoyer | 400, message intégré à la page (pas d'alerte navigateur), rien n'est écrit sur disque | |
| R22 | Upload trop lourd | Envoyer un fichier > 5 Mo | 400 (limite multer) | |
| R23 | Upload "bombe" | Envoyer une image valide dépassant 40 mégapixels décompressés | 400, message clair | |
| R24 | Produits | Créer une pâtisserie avec photo et description | Apparaît dans `/admin/produits` et sur `/patisseries` | |
| R25 | Produits | Réordonner les produits par glisser-déposer | Nouvel ordre persistant après rechargement de la page | |
| R26 | Produits | Supprimer un produit | Disparaît de l'admin et du site public | |
| R27 | Point focal photo | Cliquer sur une photo de produit pour définir un nouveau point focal | `focus_x`/`focus_y` mis à jour, cadrage visuel cohérent côté public | |
| R28 | Photos événements | Ajouter une 6e photo alors que 5 sont déjà présentes | 400, "La limite de 5 photos est déjà atteinte" | |
| R29 | Photos événements | Supprimer une photo existante puis en ajouter une nouvelle | Ajout de nouveau possible (limite recalculée) | |
| R30 | Réglages | Saisir un numéro de téléphone invalide (lettres) | 400, réglage non modifié | |
| R31 | Réglages | Saisir un lien Instagram sans `http(s)://` | 400, "Lien invalide, une URL http(s) est attendue" | |
| R32 | SEO | Charger chaque page publique et inspecter `<title>`/meta description/JSON-LD `LocalBusiness` | Titre et description uniques par page, JSON-LD présent avec téléphone/adresse/horaires à jour | |

## Limite connue de l'environnement de test

`src/routes/upload.test.js` écrit dans le vrai dossier `back/public/uploads` (pas de dossier dédié aux tests pour cette route) ; les fichiers créés sont nettoyés en fin de test (`t.after`), mais une interruption brutale du run pourrait laisser un fichier orphelin. Limite connue depuis l'audit sécurité, non corrigée à ce jour.
