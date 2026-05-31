// @vitest-environment happy-dom
//
// Tests du shell cabinet (sub-lot 11a).
//
// La parité visuelle du shell est validée par Playwright (script de parité,
// route 38-cabinet-portefeuille). Ces tests-ci verrouillent les invariants
// STRUCTURELS qui ne doivent jamais régresser :
//
//  1. Le badge cachet « CABINET » est présent dans la sidebar.
//  2. Les 6 entrées de navigation du wireframe sont rendues, dans le bon ordre.
//  3. La topbar (mode portefeuille) est rendue par défaut ; la contextbar
//     (mode entreprise scellée) n'est PAS rendue tant qu'aucune route enfant
//     n'a posé `setEntrepriseActive`.
//  4. Le cabinet courant (« Cabinet Comptable Ébrié ») et le gestionnaire
//     courant (« Edmond Kouassi, Responsable ») sont rendus respectivement
//     dans la carte cabinet et le footer de la sidebar.
//  5. Quand une route enfant appelle `setEntrepriseActive(e)`, la topbar
//     disparaît et la contextbar « Vous gérez : … » apparaît.

import { useEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';
import { CabinetLayout, useCabinetOutletContext } from '../routes/cabinet/_layout.js';
import { CabinetPortefeuille } from '../routes/cabinet/portefeuille.js';

afterEach(() => cleanup());

function EnfantQuiActive({ nom }: { nom: string }) {
  const { setEntrepriseActive } = useCabinetOutletContext();
  useEffect(() => {
    setEntrepriseActive({
      id: 'e-test',
      nom,
      raisonSociale: nom,
      adresse: 'Abidjan',
      telephone: '+225 27 00 00 00 00',
      email: 'contact@test.ci',
      rccm: 'CI-TEST',
      ncc: '000',
      secteur: 'Test',
      effectif: 10,
      type: 'directe',
      statut: 'active',
      modeGestion: 'directe',
      cabinetId: null,
    });
    return () => setEntrepriseActive(null);
  }, [nom, setEntrepriseActive]);
  return <div>Enfant scellé</div>;
}

function rendreShell(initial = '/cabinet') {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/cabinet" element={<CabinetLayout />}>
            <Route index element={<CabinetPortefeuille />} />
            <Route path="entreprises/:id" element={<EnfantQuiActive nom="Cacao Plus SARL" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('Cabinet shell — invariants structurels (sub-lot 11a)', () => {
  it('rend le badge cachet « CABINET » dans la sidebar', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('CABINET');
    });
  });

  it('rend les 6 entrées de navigation, dans le bon ordre', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('Portefeuille');
    });
    const liens = Array.from(container.querySelectorAll('aside nav a'));
    const labels = liens.map((a) => a.textContent?.trim());
    expect(labels).toEqual([
      'Portefeuille',
      'Suivi',
      'Statistiques',
      'Gestionnaires',
      'Facturation',
      'Paramètres',
    ]);
  });

  it('rend le cabinet courant (« Cabinet Comptable Ébrié ») dans la carte de la sidebar', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('Cabinet Comptable Ébrié');
    });
  });

  it('rend le gestionnaire courant (« Edmond Kouassi · Responsable ») dans le footer de la sidebar', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('Edmond Kouassi');
    });
    expect(container.textContent).toContain('Responsable');
  });

  it('affiche la topbar par défaut (mode portefeuille), pas la contextbar', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('Cabinet Comptable Ébrié');
    });
    expect(container.querySelector('[data-testid="cabinet-topbar"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="cabinet-contextbar"]')).toBeNull();
  });

  it('bascule en contextbar « Vous gérez : … » quand une route enfant appelle setEntrepriseActive', async () => {
    const { container } = rendreShell('/cabinet/entreprises/e-test');
    await waitFor(() => {
      expect(container.querySelector('[data-testid="cabinet-contextbar"]')).toBeTruthy();
    });
    const contextbar = container.querySelector('[data-testid="cabinet-contextbar"]');
    expect(contextbar?.textContent).toContain('Revenir au portefeuille');
    expect(contextbar?.textContent).toContain('Vous gérez :');
    expect(contextbar?.textContent).toContain('Cacao Plus SARL');
    // La topbar standard est masquée pendant l'entreprise scellée.
    expect(container.querySelector('[data-testid="cabinet-topbar"]')).toBeNull();
  });
});
