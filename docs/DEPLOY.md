# Déploiement

Vérifié dans le code le 2026-10-10 (`back/src/server.js`, `.env.example`, `package.json`). Rien de ce document ne décrit une infrastructure déjà en place — c'est une procédure à suivre, pas un constat d'un serveur existant.

**Hébergeur retenu : À COMPLÉTER.** Aucune information sur l'hébergeur cible n'existe dans le dépôt (cf. rapport sécurité, constat K2 — mentions légales et `trust proxy` en attente du même choix).

## Prérequis

- Node.js **≥ 22** (LTS "Jod") — déclaré dans `back/package.json`/`front/package.json` (`engines.node`) et `back/.nvmrc`/`front/.nvmrc`. Choix vérifié, pas supposé : suite de tests back (129/129), `npm run lint` et `npm run build` front exécutés avec succès sous Node 22.23.3 **et** Node 24.21.0 (LTS "Krypton") ; 22 retenu car c'est le plus petit major LTS qui passe tout, sans imposer une version plus récente que nécessaire à un environnement de production.
- Outils de compilation C++ uniquement si `npm install` doit compiler `better-sqlite3`/`bcrypt` depuis les sources (pas nécessaire si des binaires précompilés correspondant à la plateforme cible sont disponibles sur le registre npm, ce qui est le cas pour les plateformes Linux x64 courantes). `sharp` embarque toujours un binaire précompilé (`@img/sharp-*`), jamais de compilation.
- Un reverse proxy HTTPS devant le process Node (nginx, exemple plus bas) — le serveur Express lui-même ne termine pas le TLS.

## Variables d'environnement

### Back (`back/.env`, depuis `back/.env.example`)

| Nom | Rôle | Obligatoire ? | Exemple | Valeur par défaut |
|---|---|---|---|---|
| `SESSION_SECRET` | Clé de signature des cookies de session (`express-session`) | **Oui, toujours** — le serveur refuse de démarrer sans elle (`server.js`, contrôle explicite) | `<64 caractères hexadécimaux générés aléatoirement, propres à chaque environnement — jamais une valeur devinable ni réutilisée d'un exemple>`, à générer avec `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | aucune |
| `PORT` | Port d'écoute HTTP du back | non | `3001` | `3001` |
| `FRONT_URL` | Origine autorisée en CORS (`cors({ origin: FRONT_URL, credentials: true })`) | **Oui si `NODE_ENV=production`** — le serveur refuse de démarrer sans elle dans ce cas ; optionnelle sinon | `https://www.maison-nali.fr` | `http://localhost:5173` (dev uniquement) |
| `TRUST_PROXY` | Active `app.set("trust proxy", 1)` — nécessaire pour que `cookie.secure` fonctionne correctement derrière un reverse proxy qui termine le HTTPS | non | `true` | `false` (désactivé) |
| `NODE_ENV` | Bascule les comportements production (`cookie.secure`, store de session SQLite vs mémoire, exigence de `FRONT_URL`) et test (`NODE_ENV=test`, base SQLite de test) | **Oui en production** (sinon aucun des comportements de prod ne s'active) | `production` | non défini (mode "développement" implicite) — **absent de `.env.example`**, à positionner via l'environnement d'exécution (`systemd Environment=`, `pm2` `env`, variable shell), pas dans le fichier `.env` par convention |

### Front (`front/.env`, depuis `front/.env.example`)

| Nom | Rôle | Obligatoire ? | Exemple | Valeur par défaut |
|---|---|---|---|---|
| `VITE_API_URL` | URL de base de l'API back, préfixée devant chaque `fetch` du front (`${API_URL}/api/...`) | oui en pratique | *(vide)* — avec le montage nginx ci-dessous (front et back sur le **même domaine**, `/api` proxyfié), une valeur vide produit des requêtes relatives (`/api/...`), résolues automatiquement vers la même origine. Alternative sous-domaine dédié : `https://api.maison-nali.fr` (nécessite alors `FRONT_URL` ≠ domaine du back, cf. contrainte `sameSite` plus bas) | vide dans `.env.example` |
| `VITE_SITE_URL` | URL publique du site, utilisée pour générer `robots.txt`/`sitemap.xml` au build et les balises Open Graph/canonical/JSON-LD | **Oui pour un build de production** — `vite build` échoue explicitement (`vite.config.js`) si absente en mode production | `https://www.maison-nali.fr` | `http://localhost:5173` (dev uniquement, le build de prod n'a pas de valeur par défaut) |

Les variables `VITE_*` sont injectées **au build** (pas au runtime) — un changement de valeur impose de relancer `npm run build`.

**Test local en `NODE_ENV=production` sans TLS :** le cookie de session est posé avec `secure: true` dès que `NODE_ENV=production` (`back/src/server.js`). Testé en répétition d'installation à froid le 2026-10-11 : sur un back lancé en HTTP simple (sans reverse proxy HTTPS), `POST /api/auth/login` répond bien `200 {"message":"Connecté"}`, mais le `Set-Cookie` n'est jamais envoyé — comportement documenté d'`express-session` (une connexion non sécurisée ne reçoit pas de cookie `secure`). Vérifié : une requête `GET /api/auth/me` juste après renvoie alors `{"error":"Non authentifié"}`. Ce n'est pas un bug, mais une session admin ne peut pas être validée de bout en bout en local sans TLS — nécessite soit le reverse proxy HTTPS décrit plus bas, soit un lancement temporaire sans `NODE_ENV=production` pour ce seul test.

## Build du front

```bash
cd front
npm install
npm run build
```

Produit `front/dist/` (fichiers statiques, y compris `robots.txt`/`sitemap.xml` générés par `front/scripts/generate-seo-files.js`). À servir tel quel par le reverse proxy ou un serveur de fichiers statiques — ce n'est pas le back Express qui sert le front.

## Lancement du back en production

Le back ne doit **jamais** être exposé directement à Internet (pas de TLS natif) — toujours derrière un reverse proxy.

### Avec pm2

```bash
cd back
npm install --omit=dev
npm run init-db        # première installation uniquement
node src/db/init-admin.js admin@exemple.fr "mot-de-passe-fort"   # première installation uniquement, avant content:import
npm run content:import # contenu complet (pages, sections, reglages, horaires, produits...) depuis back/seed/contenu.json

NODE_ENV=production PORT=3001 FRONT_URL=https://www.maison-nali.fr SESSION_SECRET=<secret> \
  pm2 start src/server.js --name maison-nali-api
pm2 save
```

Les variables d'environnement peuvent aussi être posées dans `back/.env` plutôt qu'en ligne de commande (`dotenv` les charge automatiquement) — `NODE_ENV` reste l'exception à définir via l'environnement d'exécution (cf. tableau ci-dessus), pas dans `.env`.

### Avec systemd (exemple)

```ini
# /etc/systemd/system/maison-nali-api.service
[Unit]
Description=Maison Nali API
After=network.target

[Service]
Type=simple
User=maison-nali
WorkingDirectory=/opt/maison-nali/back
Environment=NODE_ENV=production
EnvironmentFile=/opt/maison-nali/back/.env
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now maison-nali-api
```

`EnvironmentFile` pointe vers `back/.env` (contenant `SESSION_SECRET`, `PORT`, `FRONT_URL`, `TRUST_PROXY`) — `NODE_ENV=production` est posé séparément dans l'unité systemd, cohérent avec la convention ci-dessus.

## Reverse proxy nginx (exemple, HTTPS)

```nginx
server {
    listen 443 ssl http2;
    server_name www.maison-nali.fr;

    ssl_certificate     /etc/letsencrypt/live/www.maison-nali.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.maison-nali.fr/privkey.pem;

    # Front : fichiers statiques buildés
    root /opt/maison-nali/front/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;   # fallback SPA (React Router)
    }

    # Back : API proxy vers le process Node
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name www.maison-nali.fr;
    return 301 https://$host$request_uri;
}
```

Avec ce montage (front et back sur le **même nom de domaine**, `/api` et `/uploads` proxyfiés vers le back), poser `TRUST_PROXY=true` côté back est nécessaire pour que `X-Forwarded-Proto` soit pris en compte et que `cookie.secure` fonctionne correctement. Côté front, `VITE_API_URL` reste **vide** dans ce montage (requêtes relatives `/api/...`, déjà sur la bonne origine). `FRONT_URL` côté back = `https://www.maison-nali.fr` (celui du tableau ci-dessus).

**Variante sous-domaine dédié** (`api.maison-nali.fr` séparé de `www.maison-nali.fr`) : remplacer le bloc `location /api/`/`location /uploads/` ci-dessus par un `server {}` nginx distinct sur `api.maison-nali.fr`, pointer `VITE_API_URL=https://api.maison-nali.fr` côté front et `FRONT_URL=https://www.maison-nali.fr` côté back. Les deux domaines restent "same-site" au sens de `sameSite: "lax"` (même domaine racine) — voir la contrainte ci-dessous, qui elle devient bloquante seulement avec deux domaines racines complètement différents.

### Contrainte `sameSite: "lax"` à connaître

Le cookie de session est posé avec `sameSite: "lax"` (`back/src/server.js`), en dur, pas configurable par variable d'environnement. Conséquence directe : **front et back doivent être vus comme le même site par le navigateur** (même domaine racine — un sous-domaine `api.maison-nali.fr` pour le back et `www.maison-nali.fr` pour le front restent "same-site" au sens de la spec, ce n'est que les domaines complètement différents, ex. `maison-nali-api.un-hebergeur.com`, qui posent problème). Si le choix d'hébergement final sépare front et back sur des domaines racine différents, le cookie `lax` ne sera pas envoyé sur les requêtes cross-site en `fetch` et l'admin cessera de fonctionner — il faudrait alors passer à `sameSite: "none"` (et donc obligatoirement `secure: true`, déjà le cas en production).

## Scripts de migration et correctifs de données (`back/src/db`)

12 scripts hors `init.js`/`init-admin.js`/`init-pages.js`/`seed-*.js` (installation initiale historique, **dépréciée**, cf. plus haut et `docs/TESTS.md`) et hors `backup.js`/`optimize-uploads.js`/`init-test.js`/`content-export.js`/`content-import.js` (maintenance courante, déjà documentés ailleurs). Aucun mécanisme de migration automatique au démarrage — tous s'exécutent à la main, un par un, `node src/db/<fichier>.js` depuis `back/`. Ordre ci-dessous = ordre chronologique réel de création (vérifié via `git log --diff-filter=A`), qui correspond aussi à l'ordre de dépendance là où il y en a une. Pour une base neuve, ces 12 scripts n'ont normalement **plus besoin d'être rejoués un par un** : `content:import` (cf. plus haut) reproduit en un seul import le contenu réel actuel, déjà passé par toute cette histoire de migrations. Ils restent documentés ici pour la maintenance d'une base existante plus ancienne, ou si `back/seed/contenu.json` venait à manquer.

| # | Script | Rôle | Idempotent ? |
|---|---|---|---|
| 1 | `migrate-rename-grille-patisseries.js` | Renomme le type de section `grille-patisseries` → `bloc-patisseries` | **Oui** — `UPDATE ... WHERE type = 'grille-patisseries'`, no-op dès que plus aucune ligne ne porte l'ancien nom |
| 2 | `migrate-relative-photo-urls.js` | Retire le préfixe `http://localhost:3001` en dur des `photo_url`/`content` existants (passage en chemins relatifs) | **Oui** — ne touche que les lignes contenant encore le préfixe, no-op sinon |
| 3 | `migrate-add-banner-dates.js` | Ajoute les colonnes `announcements.start_date`/`end_date` (`ALTER TABLE`) | **Oui** — vérifie `PRAGMA table_info` avant d'ajouter chaque colonne |
| 4 | `migrate-add-event-photos.js` | Crée la table `event_photos` | **Oui** — `CREATE TABLE IF NOT EXISTS` |
| 5 | `migrate-drop-event-services.js` | Supprime l'ancienne table `event_services` (remplacée par `event_photos`) | **Oui** — `DROP TABLE IF EXISTS` |
| 6 | `migrate-add-bloc-entete.js` | Ajoute un bloc `bloc-entete` en tête de chaque page connue, corrige le titre de test du Hero Accueil, allège le contenu de `bloc-evenements` (titre/intro migrés vers le nouveau bloc-entête) | **Oui** — vérifie l'absence de `bloc-entete` avant d'en créer un ; corrections de contenu conditionnées à la valeur exacte attendue |
| 7 | `add-hero-3-pages.js` | Ajoute une section `hero` aux pages `patisseries`, `a-propos`, `evenements` (absente à l'origine) ; normalise les positions `hero`/`bloc-entete` sur Accueil | **Oui** — vérifie l'absence de `hero` avant d'en créer un ; normalisation conditionnée à une position incorrecte constatée. **Dépend de #6** (lit `bloc-entete` pour la normalisation des positions) |
| 8 | `add-bloc-histoire-2-apropos.js` | Ajoute un 2e bloc `bloc-histoire` à la page `a-propos` | **Oui** — n'agit que si moins de 2 `bloc-histoire` existent déjà sur la page |
| 9 | `add-bouton-hero.js` | Pose un texte/lien de bouton par défaut sur le Hero d'Accueil et d'Événements | **Partiellement.** Vérifie `texteBouton \|\| lienBouton` avant d'écrire — mais un bouton explicitement *vidé* depuis l'admin (chaîne vide des deux côtés) redeviendrait indiscernable d'un bouton jamais configuré, et serait réécrasé par une relance. Sans risque sur une base qui n'a jamais eu ce bouton touché manuellement. |
| 10 | `TEMP-photo-boutique-accueil-bouche-trou.js` | Pose une photo provisoire (enseigne en contre-plongée) + point focal sur le bloc-localisation d'Accueil, en attendant une vraie photo de façade | **Non.** Écrit `photo`/`focusX`/`focusY` **sans aucune vérification préalable** — une relance écraserait une vraie photo uploadée depuis via l'admin. Explicitement marqué "DETTE TECHNIQUE" dans le code, avec instruction d'être supprimé une fois une vraie photo livrée. **Ne pas relancer** sans avoir vérifié l'état actuel du bloc-localisation Accueil. |
| 11 | `fix-boutons-blocs-histoire-apropos.js` | Pose un texte/lien de bouton sur les 2 `bloc-histoire` d'À propos (sections identifiées par **ID en dur : 12 et 46**) | **Oui** — vérifie l'absence de bouton existant avant d'écrire. Porte en tête de fichier la mention explicite "à relire avant exécution — ne pas lancer sans validation" : les ID en dur ne correspondent qu'à **cette base précise**, pas transposables tels quels ailleurs. **Dépend de #8** (la section 46 n'existe qu'après l'ajout du 2e bloc-histoire) |
| 12 | `fix-photo-manquante-atelier-apropos.js` | Vide `photo`/`photoAlt` sur la section 46 (À propos) si elle vaut encore `/images/atelier-2.jpg` (fichier jamais livré, image cassée) | **Oui** — compare la valeur exacte avant d'agir. Même mention "à relire avant exécution". **Constat vérifié en rédigeant cette doc** : la version actuelle de `add-bloc-histoire-2-apropos.js` (script #8) initialise `photo` à vide (`""`), pas à `/images/atelier-2.jpg` — ce script ne trouvera donc plus rien à corriger si #8 est rejoué tel qu'il est aujourd'hui. Il documente une anomalie historique déjà corrigée dans le script source, conservé pour mémoire et parce qu'il reste sans danger (gardé par la comparaison de valeur). |

### `init-pages.js` déprécié — écart avec le contenu réel (résolu par `content:import`)

**Vérifié en lisant `back/src/db/init-pages.js`** : il ne crée **pas** de section `hero` pour `patisseries`/`a-propos`/`evenements`, **pas** de 2e `bloc-histoire` pour `a-propos`, et **pas** de bouton par défaut sur les Hero — l'équivalent des scripts #7, #8 et #9 ci-dessus manque. Une base installée via `init-pages.js` seul a donc un contenu éditorial différent de la production réelle. C'est précisément ce qui a motivé `content:export`/`content:import` : `init-pages.js` est maintenant **déprécié** (commentaire en tête du fichier, non supprimé) et remplacé dans `SETUP.md`/ci-dessus par `content:import`, qui importe le contenu réel exporté (`back/seed/contenu.json`), sans cet écart.

`init-pages.js` reste dans le dépôt comme filet de secours si `back/seed/contenu.json` venait à manquer (génère alors un jeu de pages minimal, avec l'écart décrit ci-dessus) — à compléter dans ce cas avec `add-hero-3-pages.js`, `add-bloc-histoire-2-apropos.js`, `add-bouton-hero.js` (scripts #7-#9, idempotents) si on veut s'approcher du contenu réel sans le fichier d'export.

## Persistance : `data/` et `public/uploads/`

Deux dossiers contiennent l'état réel du site, **gitignorés**, à sauvegarder et à faire persister entre deux déploiements :

- `back/data/*.sqlite` (+ `-wal`/`-shm`) : base applicative et base de sessions.
- `back/public/uploads/*` (tout sauf `.gitkeep`) : photos uploadées.

Sur un déploiement qui recrée le filesystem à chaque mise à jour (conteneur, etc.), ces deux chemins doivent être montés depuis un volume persistant externe au code applicatif — sans quoi chaque déploiement repart d'une base vide et sans photo.

## Création du premier compte admin

```bash
cd back
node src/db/init-admin.js <email> <mot-de-passe>
```

Pas idempotent (contrainte `UNIQUE` sur `users.email`) — à lancer une seule fois. Pas de compte par défaut, pas de mot de passe en dur dans le code (vérifié, cf. `docs/SECURITE.md`, H3).

## Contenu éditorial : `content:export` / `content:import`

Remplace `init-pages.js` + les `seed-*.js` (dépréciés, cf. plus haut) pour amener une base neuve au contenu réel du site. Source de vérité : `back/seed/contenu.json`, versionné dans le dépôt — pages, sections (content JSON), réglages, horaires, catégories, produits, photos événements, annonces. Jamais d'utilisateur, jamais de session, jamais de mot de passe dans ce fichier.

**Importer** (après `npm run init-db` + `init-admin.js`, cf. ci-dessus) :

```bash
cd back
npm run content:import
```

Refuse de tourner si la base contient déjà des pages/sections/réglages/... (sécurité anti-écrasement) :

```
Échec : la base contient déjà du contenu : pages (5), sections (13). Relance sur une base vide
(après npm run init-db), ou avec --force si tu sais ce que tu fais.
```

Pour écraser un contenu existant volontairement (ex. resynchroniser un environnement de test avec la production) :

```bash
npm run backup                          # obligatoire, < 1h
node src/db/content-import.js --force
```

Même garde que `optimize-uploads.js --apply` : `--force` est refusé sans sauvegarde de `back/data/*.sqlite` datant de moins d'1h dans `Code/Sauvegardes`. Transaction unique (tout ou rien) : si une seule section/réglage/produit/etc. échoue sa validation (mêmes règles que les routes `PUT` correspondantes), rien n'est écrit.

En fin d'import, les chemins `/uploads/...` référencés mais absents de `back/public/uploads` sont listés ("fichiers référencés manquants") — les photos elles-mêmes ne font pas partie de l'export, à ré-uploader manuellement via l'admin.

**Régénérer `back/seed/contenu.json`** depuis une base qui a du contenu réel (lecture seule, n'écrit que le fichier JSON, jamais la base) :

```bash
cd back
npm run content:export
```

À relancer et recommiter après toute modification de contenu qu'on veut figer comme "état de référence" (ex. avant une démonstration, ou pour republier le même contenu sur un environnement de recette).

## Sauvegarde et restauration

### Sauvegarde

```bash
cd back
npm run backup
```

Copie `back/data/*.sqlite` (sessions exclues, cf. `back/src/db/backup.js`) et `back/public/uploads/` dans un dossier horodaté (`Sauvegardes/AAAA-MM-JJ_HHhMM/`, au même niveau que le dépôt par défaut, ou `BACKUP_DIR` si défini).

### Restauration

Aucun script de restauration automatisé n'existe dans le dépôt — procédure manuelle vérifiée possible avec les outils standards :

```bash
# Serveur arrêté
cp Sauvegardes/<horodatage>/data/maison-nali.sqlite back/data/maison-nali.sqlite
cp -r Sauvegardes/<horodatage>/uploads/* back/public/uploads/
# Redémarrer le serveur
```

## Mise à jour et retour arrière

Pas de script de déploiement automatisé (CI/CD) trouvé dans le dépôt. Procédure manuelle déduite de la structure du projet :

**Mise à jour :**
1. `npm run backup` (sauvegarde de l'état avant mise à jour).
2. `git pull` sur la branche de production.
3. `cd back && npm install && cd ../front && npm install` (dépendances).
4. `cd front && npm run build` (nouveau build statique).
5. Redémarrer le process back (`pm2 restart maison-nali-api` ou `systemctl restart maison-nali-api`).
6. Vérifier qu'aucune nouvelle migration de schéma ou de contenu n'est nécessaire (`back/src/db/migrate-*.js`, `add-*.js`, `fix-*.js` — liste et ordre détaillés dans la section "Scripts de migration et correctifs de données" ci-dessus ; à exécuter manuellement si la mise à jour en introduit une nouvelle, aucun mécanisme de migration automatique au démarrage n'existe dans le code).

**Retour arrière :**
1. Arrêter le process back.
2. `git checkout <commit-ou-tag-precedent>`, réinstaller les dépendances si `package.json` a changé, reconstruire le front.
3. Si la mise à jour annulée avait altéré le schéma, restaurer `back/data/maison-nali.sqlite` depuis la sauvegarde prise avant la mise à jour (étape 1 ci-dessus) — il n'existe pas de migration "down" automatique.
4. Redémarrer le process back.
