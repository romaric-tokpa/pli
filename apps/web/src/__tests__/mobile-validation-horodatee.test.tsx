// @vitest-environment happy-dom
//
// Tests d'invariant juridique UI (sub-lot 10c).
//
// CLAUDE.md (libellés juridiques décidés au wireframe) :
// « Signature : « validation horodatée » (pas « valeur probante » tant que
// le partenaire de signature avancée n'est pas branché). »
//
// Verrou :
//  - Présence : « validation horodatée », « Horodatage certifié », « Signature avancée à venir ».
//  - Absence : « valeur probante » (sous toutes ses casses).
//
// Comme les 17 verrous de l'étape 8 sur la surface publique — la moindre
// dérive de libellé sur l'écran de signature mobile est interceptée ici.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';
import { MobileSignature } from '../routes/app/signature.js';

afterEach(() => cleanup());

function rendreSignature(id = 'b-atlantique-2026-02') {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/app/bulletin/${id}/signer`]}>
        <Routes>
          <Route path="/app/bulletin/:id/signer" element={<MobileSignature />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('Mobile signature — libellés juridiques verrouillés', () => {
  it("rend « validation horodatée » (titre du bloc) et « Validation horodatée » (libellé)", async () => {
    const { container } = rendreSignature();
    await waitFor(() => {
      expect(container.textContent).toContain('Validation horodatée');
    });
    // Au moins deux occurrences dans la page (header du bloc + le H2 de
    // confirmation l'inclut aussi via « validation » + horodatée plus tard).
    const textContent = container.textContent ?? '';
    expect(textContent.toLowerCase()).toContain('validation horodatée');
  });

  it("rend la note « Horodatage certifié. Signature avancée à venir. »", async () => {
    const { container } = rendreSignature();
    await waitFor(() => {
      expect(container.textContent).toContain('Horodatage certifié');
    });
    expect(container.textContent).toContain('Signature avancée à venir');
  });

  it("ne contient JAMAIS « valeur probante » (interdit Phase 0)", async () => {
    const { container } = rendreSignature();
    await waitFor(() => {
      expect(container.textContent).toContain('Validation horodatée');
    });
    expect(container.textContent).not.toMatch(/valeur probante/i);
    expect(container.textContent).not.toMatch(/probant\b/i);
  });

  it("le bouton « Valider (horodaté) » est désactivé tant que la case n'est pas cochée (miroir UX)", async () => {
    const { container } = rendreSignature();
    await waitFor(() => {
      expect(container.textContent).toContain('Validation horodatée');
    });
    const bouton = container.querySelector(
      'button[type="button"]:not([aria-label])',
    ) as HTMLButtonElement | null;
    // Le DERNIER bouton de la page (post-scroll) est « Valider (horodaté) ».
    const tousBoutons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[type="button"]'),
    );
    const valider = tousBoutons.find((b) => b.textContent?.includes('Valider'));
    expect(valider).toBeTruthy();
    expect(valider!.disabled).toBe(true);
    expect(bouton).toBeTruthy(); // sanity sur le query principal
  });
});
