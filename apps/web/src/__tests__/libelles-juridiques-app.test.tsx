// @vitest-environment happy-dom
//
// Verrou des libellés juridiques INTERNES (hors surface publique).
//
// Les garde-fous de libellés ne s'arrêtent pas à la landing/légales : partout
// où l'app parle de conservation, de signature ou des droits du salarié, la
// formulation canonique doit tenir. Toute dérive vers « à vie » ou « valeur
// probante » fait claquer ce test avant que ça arrive en prod.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';

import { ProSalarieDetail } from '../routes/pro/salaries/detail.js';

afterEach(() => cleanup());

describe('Pro / fiche salarié — modal « Marquer comme parti »', () => {
  it("contient la formulation canonique « tant que son compte reste actif » (et pas « à vie »)", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/pro/salaries/s1']}>
        <ToastProvider>
          <Routes>
            <Route path="/pro/salaries/:id" element={<ProSalarieDetail />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>,
    );

    // Attendre que la fiche soit chargée (service async)
    await waitFor(() => expect(container.textContent).toContain('Aya Koffi'));

    // Ouvre la modale « Marquer comme parti »
    const bouton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Marquer comme parti'),
    );
    expect(bouton, 'bouton « Marquer comme parti » introuvable').toBeDefined();
    bouton!.click();

    // Le contenu de la modale est dans le portail / DOM global
    await waitFor(() => {
      const tout = document.body.textContent ?? '';
      expect(tout).toContain('tant que son compte reste actif');
    });

    // Et aucune formulation interdite
    const totalTxt = (document.body.textContent ?? '').toLowerCase();
    expect(totalTxt).not.toContain('à vie');
    expect(totalTxt).not.toContain('valeur probante');
  });
});
