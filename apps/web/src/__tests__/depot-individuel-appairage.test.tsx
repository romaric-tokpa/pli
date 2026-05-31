// @vitest-environment happy-dom
//
// Test du dépôt individuel (A.1) — invariant CLAUDE.md « L'appairage du
// matricule est borné au registre de l'entreprise du contexte ».
//
// Ce test vérifie qu'à l'écran :
//   1. La saisie d'un matricule valide du tenant courant (atlantique) →
//      affichage du salarié résolu (Aya Koffi pour MAT-00112).
//   2. La saisie d'un matricule présent UNIQUEMENT dans un autre tenant
//      (Comoé) → « Matricule introuvable » (le service ne traverse pas
//      le tenant — vérifié par `suiteContratAppairageBorneTenant`).
//   3. La saisie d'un matricule en COLLISION (MAT-00112 existe dans
//      Atlantique ET Comoé) → résolution renvoie le salarié d'Atlantique
//      uniquement (Aya Koffi), pas celui de Comoé (Karim Bah).
//
// La règle vit dans le SERVICE — l'écran ne fait que la rendre visible.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';
import { ProBulletinDepotIndividuel } from '../routes/pro/bulletins/depot-individuel.js';

afterEach(() => cleanup());

function rendreDepot() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/pro/bulletins/depot-individuel']}>
        <Routes>
          <Route
            path="/pro/bulletins/depot-individuel"
            element={<ProBulletinDepotIndividuel />}
          />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

function passerEnEtape2(container: HTMLElement) {
  // Simule la sélection d'un fichier via l'input file caché de l'Uploader.
  const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
  expect(fileInput).toBeTruthy();
  const file = new File(['contenu pdf'], 'bulletin_demo.pdf', {
    type: 'application/pdf',
  });
  Object.defineProperty(fileInput!, 'files', { value: [file] });
  fireEvent.change(fileInput!);
}

describe('Dépôt individuel — appairage borné au tenant', () => {
  it("matricule MAT-00112 (présent dans Atlantique) → salarié Aya Koffi résolu", async () => {
    const { container } = rendreDepot();
    await waitFor(() => {
      expect(container.textContent).toContain('Glissez le bulletin PDF');
    });
    passerEnEtape2(container);

    // Bouton « Suivant » est maintenant activé (file présent).
    const suivant = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[type="submit"]'),
    ).find((b) => b.textContent?.includes('Suivant'));
    expect(suivant).toBeTruthy();
    fireEvent.click(suivant!);

    // Étape 2 : on saisit le matricule.
    await waitFor(() => {
      expect(container.textContent).toContain('Appairer au salarié');
    });
    const matriculeInput = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="text"]'),
    ).find((i) => i.placeholder.includes('MAT-'));
    expect(matriculeInput).toBeTruthy();
    fireEvent.change(matriculeInput!, { target: { value: 'MAT-00112' } });

    // Le service résout dans le tenant atlantique → Aya Koffi.
    await waitFor(() => {
      expect(container.querySelector('[data-testid="salarie-resolu"]')).toBeTruthy();
    });
    expect(container.textContent).toContain('Aya Koffi');
    // Test négatif : Karim Bah (collision dans Comoé) n'apparaît JAMAIS.
    expect(container.textContent).not.toContain('Karim Bah');
  });

  it("matricule MAT-00301 (présent UNIQUEMENT chez Comoé) → « Matricule introuvable » côté Atlantique", async () => {
    const { container } = rendreDepot();
    await waitFor(() => {
      expect(container.textContent).toContain('Glissez le bulletin PDF');
    });
    passerEnEtape2(container);
    const suivant = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[type="submit"]'),
    ).find((b) => b.textContent?.includes('Suivant'));
    fireEvent.click(suivant!);

    await waitFor(() => {
      expect(container.textContent).toContain('Appairer au salarié');
    });
    const matriculeInput = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="text"]'),
    ).find((i) => i.placeholder.includes('MAT-'));
    fireEvent.change(matriculeInput!, { target: { value: 'MAT-00301' } });

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="matricule-introuvable"]'),
      ).toBeTruthy();
    });
    // Naomi Kouakou (le vrai porteur de MAT-00301 chez Comoé) ne fuit pas.
    expect(container.textContent).not.toContain('Naomi Kouakou');
  });
});
