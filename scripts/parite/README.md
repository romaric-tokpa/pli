# Audit de parité visuelle

Script Playwright qui capture la même série de routes :

- du **wireframe d'origine** (`_wireframe/index.html`, hash routing) →
  `docs/wireframe/screenshots-public/<slug>-<viewport>.png`. Ces PNG sont
  committées dans le repo, elles servent de référence pour les phases futures.
- du **build de référence** (`apps/web` en dev sur :5173, path routing) →
  `scripts/parite/build-captures/<slug>-<viewport>.png`. Non committées (gitignorées,
  artefacts d'audit).

## Usage

```bash
npm run parite:public
```

Le script :

1. Démarre `http-server` sur `_wireframe/` (port 8080) et `vite dev` sur
   `apps/web/` (port 5173).
2. Lance Chromium headless, capture chaque route en desktop 1920×1080 et
   mobile 390×844.
3. Désactive les animations CSS pour réduire le bruit non significatif.
4. Arrête les serveurs.

## Routes couvertes

Surface publique étape 8 — 15 routes :

`/`, `/connexion`, `/inscription`, `/devenir-partenaire`, `/mot-de-passe-oublie`,
`/mentions-legales`, `/confidentialite`, `/cgu`, `/conformite-artci`,
`/cabinets`, `/salaries`, `/documentation`, `/centre-aide`, `/blog`, `/contact`.

## Étapes 9-12

Pour les surfaces internes (Pro, mobile, cabinet, admin), `_wireframe/screenshots/`
contient déjà des captures de référence. Le script sera étendu (ajouter les
hash routes correspondants à `routes.mjs`) pour couvrir ces écrans aussi.

## Comparaison

Pas d'image diff automatique pour Phase 0 : l'œil suffit pour repérer les
écarts structurels (panneaux/colonnes manquants, hiérarchie cassée). Les
micro-écarts (anti-crénelage, rgb vs hex, sous-pixel) sont attendus et
ignorés.
