# Pli — le coffre-fort de paie

Plateforme SaaS de **dématérialisation, distribution et conservation** des bulletins
de paie pour l'Afrique de l'Ouest francophone (lancement Côte d'Ivoire).

> Pli **n'édite pas** la paie : il reçoit des bulletins PDF déjà produits, les
> apparie au bon salarié par matricule, les distribue, en trace la remise et
> les conserve.

Consignes projet : voir [`CLAUDE.md`](./CLAUDE.md) — charte, invariants métier,
règles de sécurité, libellés juridiques.

## Structure du monorepo

```
pli/
├─ apps/
│  ├─ web/              # Vite + React + TS + Tailwind (Pro · cabinet · landing · console)
│  └─ mobile/           # React Native — scaffold minimal en Phase 0
├─ services/
│  └─ api/              # NestJS + TS — scaffold minimal en Phase 0
├─ packages/
│  ├─ ui/               # Design-system (tokens, preset Tailwind, composants)
│  └─ types/            # Types métier partagés
├─ infra/               # IaC (à venir)
├─ docs/wireframe/      # Wireframe HTML d'origine (référence visuelle)
└─ .github/workflows/   # CI
```

## Démarrer

```bash
nvm use              # Node 24 (cf. .nvmrc — même version qu'en CI)
npm install
npm run dev          # démarre apps/web
```

Le hook `pre-commit` lance **ESLint + Prettier sur le staged uniquement**
(via `lint-staged`). Le typecheck complet du monorepo tourne en CI, pas en
local au commit, pour que chaque commit reste rapide.

## Scripts racine

| Script              | Effet                                                     |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Lance `apps/web` en mode dev                              |
| `npm run build`     | Build de tous les workspaces qui exposent `build`         |
| `npm run lint`      | Lint de tous les workspaces qui exposent `lint`           |
| `npm run typecheck` | Typecheck de tous les workspaces qui exposent `typecheck` |
| `npm run test`      | Tests de tous les workspaces qui exposent `test`          |
| `npm run format`    | Prettier write sur l'ensemble                             |

## Charte (rappel — ne pas modifier)

Encre `#15294E` · Cachet `#B85737` · Papier `#F6F2EB`. Inter. Icônes lucide
uniquement. Aucun emoji. Montants en **FCFA**, dates **JJ/MM/AAAA**,
téléphone **+225**, langue **française**.
