// @vitest-environment happy-dom
//
// Invariant 1 CLAUDE.md — adapté à la console opérateur (sub-lot 12b).
//
// La console est la SEULE surface où des montants FCFA agrégés sont
// LÉGITIMEMENT rendus en LISTE (MRR, ARR, impayés — revenus Pli). Le test
// `\d\s\d{3}` ne peut donc pas s'appliquer tel quel sans faux positif. Il
// est ADAPTÉ ainsi :
//
//   1. AUCUN salaire net individuel ne doit apparaître. On vérifie l'absence
//      des valeurs nettes spécifiques portées par BULLETINS_PAR_ENTREPRISE
//      (473 000, 615 000, 480 000, 247 000, 295 000, 284 000, 326 000,
//      245 000, 234 000 pour atlantique ; 335 000, 1 250 000 pour comoe).
//   2. Aucun label trahissant un salaire (« Net à payer », « Salaire net »,
//      « Masse salariale ») n'apparaît dans la console.
//
// Ce test claque si jamais un mock admin laissait fuir un montant de
// BulletinsService dans ses agrégats, OU si un écran admin réutilisait
// par erreur un composant de l'espace tenant.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../routes/admin/layout.js';
import { AdminVueEnsemble } from '../routes/admin/vue-ensemble.js';
import { AdminEntreprises } from '../routes/admin/entreprises.js';
import { AdminCabinets } from '../routes/admin/cabinets.js';
import { AdminRevenus } from '../routes/admin/revenus.js';
import { AdminPlans } from '../routes/admin/plans.js';
import { AdminSante } from '../routes/admin/sante.js';
import { AdminAudit } from '../routes/admin/audit.js';

afterEach(() => {
  cleanup();
  document.querySelector('meta[name="robots"][data-pli-admin="1"]')?.remove();
});

function rendreAdmin(initial = '/admin') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminVueEnsemble />} />
          <Route path="entreprises" element={<AdminEntreprises />} />
          <Route path="cabinets" element={<AdminCabinets />} />
          <Route path="revenus" element={<AdminRevenus />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="sante" element={<AdminSante />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

/** Nets salariaux spécifiques portés par BULLETINS_PAR_ENTREPRISE (data-entreprises.ts). */
const NETS_INDIVIDUELS_INTERDITS = [
  473_000, 615_000, 480_000, 247_000, 295_000, 284_000, 326_000, 245_000, 234_000,
  335_000, 1_250_000,
];

/**
 * Fabrique les motifs textuels possibles pour un montant — avec espace
 * normale U+0020 OU espace fine insécable U+202F (formatage fr-FR).
 */
function motifsMontant(n: number): RegExp[] {
  const localise = n.toLocaleString('fr-FR');
  // localise utilise typiquement U+202F. On crée aussi la version espace normale.
  const espaceNormale = localise.replace(/\s/g, ' ');
  return [new RegExp(`\\b${localise.replace(/\s/g, '\\s')}\\b`), new RegExp(`\\b${espaceNormale}\\b`)];
}

describe('Console opérateur — Net individuel jamais affiché (invariant 1 adapté)', () => {
  for (const route of [
    '/admin',
    '/admin/entreprises',
    '/admin/cabinets',
    '/admin/revenus',
    '/admin/plans',
    '/admin/sante',
    '/admin/audit',
  ]) {
    it(`${route} — aucun salaire net individuel (473 000, 615 000, etc.) n'apparaît`, async () => {
      const { container } = rendreAdmin(route);
      await waitFor(() => {
        // Charge complète : présence du badge sidebar (rendu une fois le
        // layout monté + les async useEffects résolus).
        expect(container.textContent ?? '').toContain('CONSOLE OPÉRATEUR');
      });
      const txt = container.textContent ?? '';
      for (const net of NETS_INDIVIDUELS_INTERDITS) {
        for (const motif of motifsMontant(net)) {
          if (motif.test(txt)) {
            throw new Error(
              `Montant net individuel ${net} détecté sur ${route} via le motif ${motif}. ` +
                `La console ne doit jamais exposer un net salarial — uniquement des agrégats Pli.`,
            );
          }
        }
      }
    });

    it(`${route} — aucun label « Net à payer » / « Salaire net » / « Masse salariale »`, async () => {
      const { container } = rendreAdmin(route);
      await waitFor(() => {
        expect(container.textContent ?? '').toMatch(/FCFA/);
      });
      const txt = (container.textContent ?? '').toLowerCase();
      expect(txt).not.toContain('net à payer');
      expect(txt).not.toContain('salaire net');
      expect(txt).not.toContain('masse salariale');
    });
  }

  it('Vue d\'ensemble — les KPIs LÉGITIMES (MRR, ARR, salariés, bulletins) sont rendus', async () => {
    // Test anti-trivial : sinon les tests ci-dessus passeraient sur page vide.
    const { container } = rendreAdmin('/admin');
    await waitFor(() => {
      expect(container.textContent).toContain('MRR total');
    });
    const txt = container.textContent ?? '';
    expect(txt).toContain('ARR projeté');
    expect(txt).toContain('Entreprises actives');
    expect(txt).toContain('Salariés cumulés');
    expect(txt).toMatch(/FCFA/); // au moins un montant agrégé légitime
  });
});
