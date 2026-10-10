# Setup du projet sur une nouvelle machine

Ordre exact à suivre, une seule fois. Les scripts `seed-*` sont rejouables sans risque (idempotents), sauf indication contraire — mais inutile de les relancer si déjà fait.

## 0. Piège Node.js / Windows (à lire avant tout)

`better-sqlite3` compile un module natif en C++ à l'installation. Deux prérequis obligatoires sur Windows, sinon `npm install` plante dans `back` :

- **Node 22 ou plus récent**
- **Outils de compilation C++** (Visual Studio Build Tools avec le workload "Desktop development with C++", ou `npm install --global windows-build-tools` selon la config)

Vérifier avant de commencer :

```
node --version
```

Si `npm install` échoue avec une erreur `gyp` ou `node-gyp`, c'est ce prérequis qui manque — pas un bug du projet.

`sharp` (optimisation des images à l'upload) n'est pas concerné par ce piège : il embarque un binaire précompilé pour Windows (`@img/sharp-win32-x64`), aucune compilation locale.

## 1. Installation des dépendances

```
cd back
npm install

cd ../front
npm install
```

## 2. Fichiers `.env`

Deux fichiers à créer, un par dossier, à partir des `.env.example` fournis :

- `back/.env` (depuis `back/.env.example`)
- `front/.env` (depuis `front/.env.example`)

**Important : créer/éditer ces fichiers avec un éditeur de texte normal (VS Code, Notepad++, etc.), jamais via PowerShell.** `>` ou `Set-Content` dans PowerShell écrit un fichier en UTF-8 **avec BOM**, et Node ne lit pas certaines variables correctement avec ce BOM en tête de fichier (vécu : variable d'env lue vide/corrompue à cause de ça). Ouvrir le fichier dans un éditeur de texte et le sauvegarder normalement évite le problème.

Remplir les valeurs (secret de session, port, URL de l'API) selon l'environnement local.

## 3. Initialisation de la base de données

Depuis `back/` :

```
npm run init-db
```

Crée le fichier SQLite et les tables depuis `src/db/database.sql`. **Ne pas relancer sur une base déjà initialisée** — `CREATE TABLE` échoue si les tables existent déjà (erreur normale, pas un bug).

## 4. Seeds, dans cet ordre précis

Toujours depuis `back/` :

```
node src/db/init-admin.js <email> <mot-de-passe>
node src/db/init-pages.js
node src/db/seed-opening-hours.js
node src/db/seed-phone.js
node src/db/seed-evenements.js
```

- `init-admin.js` (anciennement `seed-admin.js`, renommé car à usage unique) : crée le compte admin. **Pas idempotent** — relancer avec le même email échoue proprement (contrainte `UNIQUE` sur `users.email`), aucun doublon possible.
- `init-pages.js` (anciennement `seed-pages.js`, renommé car à usage unique) : crée les pages + sections initiales. Protégé par `pages.slug UNIQUE` — une relance échoue dès la première page, aucun doublon.
- `seed-opening-hours.js` : crée les 7 jours. Idempotent (vérifie avant insert) + protégé par un index `UNIQUE` sur `opening_hours.day` — relancer ne fait rien si déjà peuplé.
- `seed-phone.js` : idempotent (vérifie avant insert).
- `seed-evenements.js` : idempotent (vérifie avant insert).

## 5. Lancer le projet

```
cd back
node src/server.js

cd ../front
npm run dev
```

## 6. Optimiser les photos déjà en place (optionnel, une fois)

Les photos uploadées depuis le lot images (rotation EXIF, métadonnées retirées, largeur max 1600px) sont optimisées automatiquement à l'upload. Pour appliquer le même traitement aux fichiers déjà présents dans `back/public/uploads` :

```
cd back
npm run backup          # obligatoire : --apply le vérifie (sauvegarde < 1h)
node src/db/optimize-uploads.js            # dry-run, affiche poids/dimensions avant-après, n'écrit rien
node src/db/optimize-uploads.js --apply    # écrit réellement, en place (même nom, même extension)
```
