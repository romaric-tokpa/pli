import type { Config } from 'tailwindcss';
import preset from '@pli/ui/preset';

export default {
  // Inclut le source de @pli/ui — sinon les classes utilisées DANS les composants
  // (Button, Card, etc.) seraient purgées par Tailwind v3 lors du tree-shaking.
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  presets: [preset],
} satisfies Config;
