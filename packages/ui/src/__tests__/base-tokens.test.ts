// Garde-fou de synchronisation : base.css ne doit JAMAIS dériver de tokens.ts.
//
// Le bloc `:root` de base.css expose les couleurs charte sous forme de CSS
// custom properties --pli-*. Ce test vérifie qu'elles correspondent EXACTEMENT
// aux valeurs déclarées dans tokens.ts. Toute divergence (un hex modifié dans
// l'un sans l'autre) fait échouer ce test avant d'arriver en production.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { couleurs } from '../tokens.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseCss = readFileSync(resolve(__dirname, '../styles/base.css'), 'utf-8').toLowerCase();

/** Aplatit tokens.couleurs en pairs [nom-CSS, hex]. Gère le cas `texte.{DEFAULT,secondaire}`. */
function applatirCouleurs(): Array<[nomCssVar: string, hex: string]> {
  const pairs: Array<[string, string]> = [];
  for (const [nom, valeur] of Object.entries(couleurs)) {
    if (typeof valeur === 'string') {
      pairs.push([nom, valeur]);
    } else {
      for (const [variante, hex] of Object.entries(valeur)) {
        pairs.push([variante === 'DEFAULT' ? nom : `${nom}-${variante}`, hex]);
      }
    }
  }
  return pairs;
}

describe('base.css ↔ tokens.ts synchronisation', () => {
  it.each(applatirCouleurs())('--pli-%s correspond à la valeur de tokens.ts (%s)', (nom, hex) => {
    const declaration = `--pli-${nom}: ${hex.toLowerCase()};`;
    expect(baseCss).toContain(declaration);
  });

  it('ne contient aucune couleur charte en dur hors du bloc :root', () => {
    // Le bloc :root est l'unique lieu où les hex de la charte apparaissent.
    // Tout le reste du fichier doit passer par var(--pli-*) ou rgb(from ...).
    const fin = baseCss.indexOf('}', baseCss.indexOf(':root'));
    const apresRoot = baseCss.slice(fin + 1);

    const hexCharte = applatirCouleurs().map(([, hex]) => hex.toLowerCase());
    for (const hex of hexCharte) {
      expect(apresRoot, `${hex} ne doit pas apparaître hors :root`).not.toContain(hex);
    }
    // Et aucune référence rgba(R,G,B,...) aux triplets charte.
    expect(apresRoot, 'aucun rgba(21, 41, 78, ...) hors :root').not.toMatch(/rgba\(\s*21\s*,/);
    expect(apresRoot, 'aucun rgba(184, 87, 55, ...) hors :root').not.toMatch(/rgba\(\s*184\s*,/);
  });
});
