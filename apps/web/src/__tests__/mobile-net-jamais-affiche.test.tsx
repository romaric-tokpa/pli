// @vitest-environment happy-dom
//
// Tests d'invariant UI mobile salarié — sub-lot 10b.
//
// CLAUDE.md : « Le salaire net n'apparaît JAMAIS dans une liste, carte,
// prévisualisation ou résumé. Il n'est jamais lu ni stocké hors du document. »
//
// L'invariant est porté par le TYPE (`BulletinCoffreResume = Omit<...>`), mais
// le wireframe a historiquement affiché « Net à payer » sur l'accueil. Ces
// tests verrouillent que la régression ne revient PAS — ni par numéro nu,
// ni par libellé « Net », ni par n'importe quel champ montant récupéré par
// erreur via une projection complète.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileAccueil } from '../routes/app/accueil.js';
import { MobileCoffre } from '../routes/app/coffre.js';

afterEach(() => cleanup());

/**
 * Liste des montants des 3 bulletins mock du compte d'Aya — voir
 * `services/_mocks/data-coffre.ts`. Si l'écran lit accidentellement le détail
 * complet, AU MOINS l'un de ces nombres apparaîtra dans le rendu.
 */
const MONTANTS_MOCK_AYA = [
  596_000, 37_548, 85_452, 473_000, // b-atlantique-2026-{02,01}
  425_000, 26_775, 30_225, 368_000, // b-comoe-2024-12
];

function montantApparait(html: string, n: number): boolean {
  const nu = `${n}`;
  // toLocaleString fr-FR utilise NARROW NO-BREAK SPACE (U+202F) comme séparateur
  // de milliers. On teste avec ce séparateur ET avec un espace normal.
  const localise = n.toLocaleString('fr-FR');
  const espaceNormal = localise.replace(/\D/g, ' ');
  return html.includes(nu) || html.includes(localise) || html.includes(espaceNormal);
}

function rendreAccueil() {
  return render(
    <MemoryRouter initialEntries={['/app']}>
      <MobileAccueil />
    </MemoryRouter>,
  );
}

function rendreCoffre() {
  return render(
    <MemoryRouter initialEntries={['/app/coffre']}>
      <MobileCoffre />
    </MemoryRouter>,
  );
}

describe('Mobile salarié — invariant « net jamais visible »', () => {
  it("Accueil : aucun montant des bulletins (brut/cnps/its/net) n'apparaît dans le HTML", async () => {
    const { container } = rendreAccueil();
    await waitFor(() => {
      expect(container.textContent).toContain('Février 2026');
    });
    const html = container.innerHTML;
    for (const n of MONTANTS_MOCK_AYA) {
      expect(
        montantApparait(html, n),
        `${n} ne doit jamais apparaître sur l'accueil`,
      ).toBe(false);
    }
  });

  it("Accueil : ne contient pas le libellé « Net » (carte bulletin du wireframe historique)", async () => {
    const { container } = rendreAccueil();
    await waitFor(() => {
      expect(container.textContent).toContain('Février 2026');
    });
    expect(container.textContent).not.toMatch(/Net à payer/i);
    expect(container.textContent).not.toMatch(/\bNet\s*[:·]/i);
  });

  it("Coffre : aucun montant des bulletins n'apparaît dans le HTML", async () => {
    const { container } = rendreCoffre();
    await waitFor(() => {
      expect(container.textContent).toContain('Mon coffre-fort');
    });
    await waitFor(() => {
      expect(container.textContent).toMatch(/Février 2026|Janvier 2026/);
    });
    const html = container.innerHTML;
    for (const n of MONTANTS_MOCK_AYA) {
      expect(
        montantApparait(html, n),
        `${n} ne doit jamais apparaître dans le coffre`,
      ).toBe(false);
    }
  });

  it("Coffre : ne contient pas le libellé « Net »", async () => {
    const { container } = rendreCoffre();
    await waitFor(() => {
      expect(container.textContent).toContain('Mon coffre-fort');
    });
    expect(container.textContent).not.toMatch(/Net à payer/i);
    expect(container.textContent).not.toMatch(/\bNet\s*[:·]/i);
  });

  it('Coffre : agrège bien les rattachements multi-employeurs (Atlantique + Comoé)', async () => {
    const { container, getByText } = rendreCoffre();
    await waitFor(() => {
      expect(container.textContent).toContain('Groupe Atlantique CI');
    });
    getByText('Anciens employeurs').click();
    await waitFor(() => {
      expect(container.textContent).toContain('Comoé Industries');
    });
  });
});
