// Test d'isolation de la console opérateur (sub-lot 12a).
//
// INVARIANT CLAUDE.md le plus sensible : « La console opérateur n'est jamais
// exposée sur le site public ni le hub ». Ce test vérifie au NIVEAU DU CODE
// SOURCE qu'aucun fichier des surfaces NON-ADMIN ne contient un lien
// hard-codé vers /admin* (href, to, etc.). Si quelqu'un ajoute un lien
// « Connexion admin » dans le footer public, le test claque avant la prod.
//
// Le test ignore :
//   - Tout ce qui est SOUS apps/web/src/routes/admin/ (le shell admin lui-même
//     contient des liens internes vers ses sous-routes — c'est normal).
//   - apps/web/src/__tests__/ (les tests qui parlent volontairement de /admin).
//   - apps/web/src/router.tsx (la route /admin doit y être déclarée).
//
// Couverture : tout le reste de l'arbre src/ (routes/public/, routes/pro/,
// routes/cabinet/, routes/app/, services/).

import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const RACINE_SRC = resolve(__dirname, '../..');
const RACINE_APPS_WEB_SRC = resolve(RACINE_SRC, 'src');

const CHEMINS_AUTORISES = [
  'routes/admin', // shell admin légitimement lié à lui-même
  '__tests__', // tests parlent de /admin volontairement
  'router.tsx', // déclaration des routes
];

function estAutorise(cheminRelatif: string): boolean {
  return CHEMINS_AUTORISES.some(
    (p) =>
      cheminRelatif === p ||
      cheminRelatif.startsWith(p + sep) ||
      cheminRelatif.startsWith(p + '/'),
  );
}

function listerFichiers(dossier: string): string[] {
  const res: string[] = [];
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    const stat = statSync(chemin);
    if (stat.isDirectory()) {
      res.push(...listerFichiers(chemin));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entree)) {
      res.push(chemin);
    }
  }
  return res;
}

const PATTERNS_LIEN_ADMIN = [
  /to=["']\/admin/i,
  /href=["']\/admin/i,
  /href=["']#\/admin/i,
  /navigate\(["']\/admin/i,
  /window\.location\.(?:href|assign|replace)\s*=\s*["']\/admin/i,
];

describe('Console opérateur — isolation au niveau code source (invariant 4)', () => {
  it('AUCUN fichier non-admin ne contient un lien hard-codé vers /admin', () => {
    const fichiers = listerFichiers(RACINE_APPS_WEB_SRC);
    const fautes: string[] = [];
    for (const fichier of fichiers) {
      const rel = relative(RACINE_APPS_WEB_SRC, fichier);
      if (estAutorise(rel)) continue;
      const contenu = readFileSync(fichier, 'utf-8');
      for (const motif of PATTERNS_LIEN_ADMIN) {
        if (motif.test(contenu)) {
          fautes.push(`${rel} — motif ${motif}`);
          break;
        }
      }
    }
    if (fautes.length > 0) {
      throw new Error(
        `Liens vers /admin trouvés hors de l'arbre admin :\n  ${fautes.join('\n  ')}\n\n` +
          `La console opérateur ne doit jamais être linkée depuis le site public, ` +
          `le hub, ni un layout tenant. Si vous voulez vraiment ce lien, ` +
          `ajouter le fichier à CHEMINS_AUTORISES dans ce test (et justifier).`,
      );
    }
    expect(fautes).toEqual([]);
  });
});
