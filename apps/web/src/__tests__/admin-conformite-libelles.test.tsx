// @vitest-environment happy-dom
//
// Libellés juridiques verrouillés sur /admin/conformite (sub-lot 12d).
//
// Comme sur la surface publique (`libelles-juridiques.test.tsx`) et la
// signature mobile (`mobile-validation-horodatee.test.tsx`), la page
// Conformité de la console opérateur DOIT :
//   ✓ rendre « validation horodatée » (signature Phase 0)
//   ✓ rendre « Conformité ARTCI » (hébergeur Côte d'Ivoire)
//   ✓ rendre « tant que le compte est actif » (rétention bulletins)
//   ✗ ne JAMAIS rendre « valeur probante » (interdit Phase 0)
//   ✗ ne JAMAIS rendre « à vie » (interdit — rétention conditionnelle)

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';
import { AdminLayout } from '../routes/admin/layout.js';
import { AdminConformite } from '../routes/admin/conformite.js';

afterEach(() => {
  cleanup();
  document.querySelector('meta[name="robots"][data-pli-admin="1"]')?.remove();
});

function rendreConformite() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/admin/conformite']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="conformite" element={<AdminConformite />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('Conformité admin — libellés juridiques verrouillés', () => {
  it("rend « validation horodatée » (signature Phase 0)", async () => {
    const { container } = rendreConformite();
    await waitFor(() => {
      expect(container.textContent ?? '').toContain('Conformité');
    });
    expect((container.textContent ?? '').toLowerCase()).toContain('validation horodatée');
  });

  it("rend « Conformité ARTCI » (hébergeur Côte d'Ivoire)", async () => {
    const { container } = rendreConformite();
    await waitFor(() => {
      expect(container.textContent ?? '').toContain('Conformité');
    });
    expect(container.textContent ?? '').toContain('Conformité ARTCI');
  });

  it("rend « tant que le compte est actif » (rétention bulletins)", async () => {
    const { container } = rendreConformite();
    await waitFor(() => {
      expect(container.textContent ?? '').toContain('Conformité');
    });
    expect(container.textContent ?? '').toContain('tant que le compte est actif');
  });

  it("ne contient JAMAIS « valeur probante » (interdit Phase 0)", async () => {
    const { container } = rendreConformite();
    await waitFor(() => {
      expect(container.textContent ?? '').toContain('Conformité');
    });
    expect(container.textContent ?? '').not.toMatch(/valeur probante/i);
  });

  it("ne contient JAMAIS « à vie » (rétention conditionnelle, pas perpétuelle)", async () => {
    const { container } = rendreConformite();
    await waitFor(() => {
      expect(container.textContent ?? '').toContain('Conformité');
    });
    expect(container.textContent ?? '').not.toMatch(/\bà vie\b/i);
  });
});
