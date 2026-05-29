// Smoke-test du preset Tailwind partagé.
// Objectif : démontrer qu'après migration du Play CDN vers un build PostCSS,
//  1. les couleurs charte (encre/cachet/papier) sont bien injectées,
//  2. les VALEURS ARBITRAIRES utilisées par le wireframe (text-[13px],
//     bg-[#15294E], etc.) continuent de produire les règles attendues.
// Si une régression de version Tailwind ou de config casse l'un de ces deux
// points, le test échoue avant que la parité visuelle ne soit affectée.

import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { describe, expect, it } from 'vitest';
import preset from '../tailwind-preset.js';

async function compileUtilites(htmlSource: string): Promise<string> {
  const result = await postcss([
    tailwindcss({
      presets: [preset],
      content: [{ raw: htmlSource, extension: 'html' }],
      corePlugins: { preflight: false },
    }),
  ]).process('@tailwind utilities;', { from: undefined });
  return result.css;
}

describe('preset Tailwind partagé', () => {
  // Tailwind v3 émet les couleurs utilitaires en `rgb(R G B / var(--tw-*-opacity, 1))`
  // (et non en hex littéral) pour activer les opacity-modifiers comme `bg-papier/80`.
  // Les triplets RGB ci-dessous DOIVENT correspondre aux hex de tokens.ts.

  it('injecte les couleurs de la charte (encre, cachet, papier)', async () => {
    const css = await compileUtilites('<div class="text-encre bg-papier border-cachet"></div>');
    expect(css).toContain('21 41 78'); //  #15294E → encre
    expect(css).toContain('246 242 235'); //  #F6F2EB → papier
    expect(css).toContain('184 87 55'); //  #B85737 → cachet
  });

  it('expose les neutres plateforme et les états (succès / attente / erreur / info)', async () => {
    const css = await compileUtilites(
      '<div class="text-texte-secondaire bg-surface border-bordure text-succes text-attente text-erreur text-info"></div>',
    );
    expect(css).toContain('91 101 119'); //  #5B6577 → texte.secondaire
    expect(css).toContain('243 245 249'); //  #F3F5F9 → surface
    expect(css).toContain('220 225 233'); //  #DCE1E9 → bordure
    expect(css).toContain('47 143 91'); //   #2F8F5B → succès
    expect(css).toContain('217 162 39'); //  #D9A227 → attente
    expect(css).toContain('203 59 51'); //   #CB3B33 → erreur
    expect(css).toContain('44 111 179'); //  #2C6FB3 → info
  });

  it('rend la fontSize sémantique (h1, body, small) avec lineHeight et fontWeight', async () => {
    const css = await compileUtilites('<div class="text-h1 text-body text-small"></div>');
    expect(css).toMatch(/font-size:\s*28px/); // h1
    expect(css).toMatch(/font-size:\s*15px/); // body
    expect(css).toMatch(/font-size:\s*13px/); // small
    expect(css).toMatch(/line-height:\s*1\.25/);
    expect(css).toMatch(/font-weight:\s*600/);
  });

  it('supporte les VALEURS ARBITRAIRES du wireframe (text-[13px], text-[16px])', async () => {
    const css = await compileUtilites('<div class="text-[13px] text-[16px] text-[28px]"></div>');
    expect(css).toMatch(/font-size:\s*13px/);
    expect(css).toMatch(/font-size:\s*16px/);
    expect(css).toMatch(/font-size:\s*28px/);
  });

  it('supporte aussi les couleurs arbitraires bg-[#XXXXXX]', async () => {
    const css = await compileUtilites('<div class="bg-[#15294E] bg-[#B85737]"></div>');
    const lower = css.toLowerCase();
    expect(lower).toContain('#15294e');
    expect(lower).toContain('#b85737');
  });

  it('expose les ombres card et float', async () => {
    const css = await compileUtilites('<div class="shadow-card shadow-float"></div>');
    expect(css).toContain('rgba(21,41,78,0.04)');
    expect(css).toContain('rgba(21,41,78,0.08)');
  });

  it('expose les rayons de bordure sm/DEFAULT/md/lg', async () => {
    const css = await compileUtilites(
      '<div class="rounded-sm rounded rounded-md rounded-lg"></div>',
    );
    expect(css).toMatch(/border-radius:\s*6px/);
    expect(css).toMatch(/border-radius:\s*8px/);
    expect(css).toMatch(/border-radius:\s*12px/);
  });
});
