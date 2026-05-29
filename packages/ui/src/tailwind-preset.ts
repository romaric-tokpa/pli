// Preset Tailwind partagé — dérive intégralement de tokens.ts.
//
// ─── Choix de version : Tailwind v3 ────────────────────────────────────────
// La config inline du wireframe (_wireframe/index.html, lignes 14-54) est
// littéralement un objet de config Tailwind v3 (`theme.extend.{colors,
// fontFamily, borderRadius, fontSize, boxShadow}`). v3 conserve l'API
// `presets: [...]` qui rend possible la mise en commun multi-workspaces ;
// v4 impose la migration vers `@theme` en CSS et supprime cette API.
//
// La syntaxe des valeurs arbitraires (`text-[13px]`, `bg-[#15294E]`,
// `text-[16px]`, etc.) utilisée massivement par le wireframe est INCHANGÉE
// entre Play CDN v3 et build PostCSS v3 — la suite de tests
// `__tests__/preset.test.ts` le vérifie en passant ce preset au moteur
// Tailwind via PostCSS et en assertant la présence des règles attendues.
//
// Migration v4 envisageable ultérieurement, hors Phase 0.

import type { Config } from 'tailwindcss';
import { couleurs, ombres, policeFamille, rayons, taillesTexte } from './tokens.js';

const preset = {
  theme: {
    extend: {
      fontFamily: policeFamille,
      colors: couleurs,
      borderRadius: rayons,
      fontSize: taillesTexte,
      boxShadow: ombres,
    },
  },
} satisfies Partial<Config>;

export default preset;
