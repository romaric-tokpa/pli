// @vitest-environment happy-dom
//
// Tests structurels du shell admin (sub-lot 12a).
//
// La parité visuelle est validée par Playwright (route 45-admin-vue-ensemble).
// Ces tests verrouillent les invariants STRUCTURELS de l'invariant d'accès le
// plus sensible du produit :
//
//   1. La sidebar est rendue en Encre FONCÉ (#0F1F3D) — fond visuellement
//      distinct du back-office client. Le badge cachet « CONSOLE OPÉRATEUR »
//      est présent.
//   2. Les 12 entrées de navigation du wireframe sont rendues (4 en haut, 3
//      sections d'opérations, 2 en bas), avec leurs dividers de section.
//   3. Le bandeau d'incident actif est rendu (la console doit ALERTER, jamais
//      cacher un incident en cours).
//   4. Le noindex test continue à passer (couvert par admin-noindex.test.tsx).

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../routes/admin/layout.js';
import { AdminVueEnsemble } from '../routes/admin/vue-ensemble.js';

afterEach(() => {
  cleanup();
  document.querySelector('meta[name="robots"][data-pli-admin="1"]')?.remove();
});

function rendreShell() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminVueEnsemble />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Console opérateur — shell (sub-lot 12a)', () => {
  it('rend le badge cachet « CONSOLE OPÉRATEUR » dans la sidebar', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('CONSOLE OPÉRATEUR');
    });
  });

  it('rend la sidebar avec le fond Encre foncé #0F1F3D (distinction visuelle)', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('CONSOLE OPÉRATEUR');
    });
    const sidebar = container.querySelector<HTMLElement>('[data-testid="admin-sidebar"]');
    expect(sidebar).toBeTruthy();
    // happy-dom préserve le format hex original ; jsdom convertit en rgb().
    // Le test accepte les deux pour rester portable.
    const bg = sidebar!.style.backgroundColor.replace(/\s/g, '').toLowerCase();
    expect(['#0f1f3d', 'rgb(15,31,61)']).toContain(bg);
  });

  it('rend les 12 entrées de navigation dans le bon ordre', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('CONSOLE OPÉRATEUR');
    });
    const liens = Array.from(container.querySelectorAll('aside nav a'));
    // On extrait le label en lisant le premier <span> de chaque lien
    // (les badges sont dans un autre span). Plus robuste qu'une regex sur
    // tout le textContent.
    const labels = liens.map((a) => a.querySelector('span')?.textContent?.trim());
    expect(labels).toEqual([
      "Vue d'ensemble",
      'Entreprises',
      'Cabinets',
      'Utilisateurs',
      'Revenus',
      'Plans & tarifs',
      'Modules',
      'Support',
      'Conformité',
      'Santé système',
      'Communications',
      'Paramètres',
      "Journal d'audit",
    ]);
    // Badges visibles aux bons endroits :
    expect(liens[7]!.textContent).toContain('4'); // Support : 4 tickets
    expect(liens[9]!.textContent).toContain('!'); // Santé : incident actif
  });

  it('rend les 3 dividers de section (Activité commerciale, Opérations, Système)', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('CONSOLE OPÉRATEUR');
    });
    const txt = container.textContent ?? '';
    expect(txt).toContain('Activité commerciale');
    expect(txt).toContain('Opérations');
    expect(txt).toContain('Système');
  });

  it('rend le bandeau d\'incident en cours (la console doit ALERTER)', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.querySelector('[data-testid="admin-incident-banner"]')).toBeTruthy();
    });
    const banner = container.querySelector('[data-testid="admin-incident-banner"]');
    expect(banner?.textContent).toContain('Notifications e-mail dégradées');
  });

  it('rend le super admin courant dans le footer de la sidebar', async () => {
    const { container } = rendreShell();
    await waitFor(() => {
      expect(container.textContent).toContain('Drissa Diomandé');
    });
    expect(container.textContent).toContain('Super Admin · Pli');
  });
});
