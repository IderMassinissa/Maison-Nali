# Setup du projet sur une nouvelle machine

Ordre exact à suivre, une seule fois. Les scripts `seed-*` sont rejouables sans risque (idempotents), sauf indication contraire — mais inutile de les relancer si déjà fait.

## 0. Piège Node.js / Windows (à lire avant tout)

`better-sqlite3` compile un module natif en C++ à l'installation. Deux prérequis obligatoires sur Windows, sinon `npm install` plante dans `back` :

- **Node ≥ 22** (LTS "Jod"), déclaré dans `back/package.json`/`front/package.json` (`engines.node`) et `.nvmrc`. Choisi comme le plus petit major LTS sur lequel la suite de tests back (129 tests lors de cette vérification ; 134 aujourd'hui, revérifiés sous Node 22 le 26/10/2026), le lint et le build front passent intégralement — vérifié aussi sous Node 24 (LTS "Krypton"), qui passe également. Développé à l'origine sous Node 23.7.0 (non-LTS, jamais la bonne cible pour `engines`) ; re-testé et abaissé à 22 pour ne pas imposer une version plus récente que nécessaire.
- **Outils de compilation C++** (Visual Studio Build Tools avec le workload "Desktop development with C++", ou `npm install --global windows-build-tools` selon la config)

Vérifier avant de commencer (`nvm use` si `nvm`/`nvm-windows` est installé, applique directement la version du `.nvmrc`) :

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

## 4. Compte admin puis contenu

Toujours depuis `back/` :

```
node src/db/init-admin.js <email> <mot-de-passe>
npm run content:import
```

- `init-admin.js` : crée le compte admin. **Pas idempotent** — relancer avec le même email échoue proprement (contrainte `UNIQUE` sur `users.email`), aucun doublon possible. À lancer **avant** `content:import` (il faut un utilisateur en base pour rattacher les pages).
- `npm run content:import` : importe le contenu éditorial complet (pages, sections, réglages, horaires, catégories, produits, photos événements, annonces) depuis `back/seed/contenu.json`, versionné dans le dépôt — reproduit l'état actuel du site. Refuse de tourner sur une base déjà peuplée (sécurité anti-écrasement) ; voir `docs/DEPLOY.md` pour `--force`. Les photos elles-mêmes ne sont pas incluses : les chemins référencés mais absents de `back/public/uploads` sont listés en fin d'exécution.

Les scripts de première installation historique (dépréciés par `content:import` qui couvrait tout ce qu'ils faisaient et plus : horaires, téléphone, annonces inclus) ont été supprimés du dépôt lors du nettoyage `chore/menage` — historique git, tag `v1.0.0-rc1`.

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
