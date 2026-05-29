# @pli/web

App principale Pli (Vite + React + TS + Tailwind + React Router v7).

## Scripts

| Commande            | Effet                                            |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Démarre le serveur Vite (HMR, port 5173)         |
| `npm run build`     | `tsc --noEmit` puis build de prod (dist/)        |
| `npm run preview`   | Sert dist/ localement pour validation post-build |
| `npm run typecheck` | Vérifie les types sans émission                  |
| `npm run lint`      | ESLint sur tout le workspace                     |
| `npm run test`      | Vitest run (happy-dom)                           |

## Routing

`createBrowserRouter` (react-router-dom v7) — URLs propres sans hash. Le fallback
SPA pour la production est assuré par :

- `public/_redirects` (Netlify, Cloudflare Pages, Render)
- `vercel.json` (Vercel)
- En dev, Vite gère le fallback automatiquement.

⚠️ Phase 5 : la console opérateur (`/admin/*`) sortira sur un déploiement séparé.
Le commentaire en tête de `public/_redirects` cadre la trajectoire.

## Console opérateur — invariant noindex

La balise `<meta name="robots" content="noindex, nofollow">` est injectée
DYNAMIQUEMENT par `AdminLayout` (cf. `src/routes/admin/layout.tsx`). Une balise
statique dans `index.html` s'appliquerait à TOUT le site (SPA + fallback servent
le même HTML).

Première barrière : `public/robots.txt` (Disallow `/admin/`).

Couverture : `src/__tests__/admin-noindex.test.tsx` (4 tests d'invariant).

## Optimisations bundle — état & dette

Le bundle principal `index-*.js` est à **990 kB / 209 kB gzip** (à la mi-Phase 0,
sub-lot 9b/1).

### ✅ Réglé — code-splitting par route et recharts en lazy

- Chaque route publique et chaque écran `/pro/*` est un chunk séparé via
  `lazy()` dans `router.tsx` (cf. étape 6 et 9). Les chunks de page font
  entre 1 et 19 kB / 0.5 à 6 kB gzip.
- recharts (~383 kB / ~95 kB gzip) est extrait dans
  `dist/assets/generateCategoricalChart-*.js`, chargé en lazy uniquement
  quand un graphique entre à l'écran (dashboard / suivi).
- Un utilisateur qui visite `/pro/salaries` ou `/pro/bulletins` sans passer
  par le dashboard ne télécharge JAMAIS recharts.

### ❌ Dette ouverte — lucide-react

Le bundle principal reste dominé par **lucide-react (~600 kB)**. La cause
n'est PAS dans les routes internes (qui sont splittées), mais dans l'entrée
du site : `packages/ui/src/components/icon.tsx` fait
`import { icons } from 'lucide-react'`, ce qui force le bundler à embarquer
~1500 composants d'icônes même si l'app n'en utilise qu'une cinquantaine.

**À traiter explicitement avant la sortie de Phase 0 ; ne pas considérer comme
réglé.** Deux options :

- **Recommandée** : codegen au build qui scanne le source pour collecter les
  noms PascalCase utilisés puis émet un `lucide-registry.ts` avec des imports
  nommés (tree-shakables). Le wrapper `Icon` lit ce registre. API publique
  inchangée. Gain estimé ≈ 500 kB.
- **Pragmatique** : Suspense + `dynamicIconImports` de lucide-react par
  icône. Plus simple à câbler, introduit un flash pour chaque icône au
  premier affichage.

Cible bundle principal après ce fix : **sous 300 kB / sous 100 kB gzip**.

Le marché ivoirien implique de la 3G/4G inégale — chaque kB chargé inutilement
coûte au salarié qui ouvre l'app pour consulter son bulletin.

Le marché ivoirien implique de la 3G/4G inégale — chaque kB chargé inutilement
coûte au salarié qui ouvre l'app pour consulter son bulletin.

## Structure

```
src/
├── main.tsx              StrictMode + RouterProvider
├── router.tsx            createBrowserRouter
├── index.css             Fonts Inter + base.css + Tailwind directives
├── routes/
│   ├── hub.tsx           /  — hub de bascule entre surfaces
│   ├── not-found.tsx     *  — 404
│   └── admin/
│       ├── layout.tsx    AdminLayout (injection noindex dynamique)
│       └── hub.tsx       /admin
└── __tests__/            Tests Vitest (happy-dom)
```
