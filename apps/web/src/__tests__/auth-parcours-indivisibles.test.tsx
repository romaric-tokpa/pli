// @vitest-environment happy-dom
//
// Parcours d'auth indivisibles (A.1 — bloquant clôture Phase 0).
//
// Les routes `/verification` et `/reinitialiser-mot-de-passe` doivent
// répondre — pas de 404. Sans elles :
//   - le lien de l'e-mail « code 2FA reçu, vérifier » tombe en blanc
//   - le lien de l'e-mail « réinitialisation mot de passe » tombe en blanc
// Le test monte chaque route et vérifie que le shell auth (titre, sous-titre,
// bouton primaire) est rendu — comme la garde anti-régression sidebar de
// l'étape 12, on vérifie que la route monte, pas qu'elle est jolie.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';
import { SiteVerification } from '../routes/public/verification.js';
import { SiteReinitialiserMotDePasse } from '../routes/public/reinitialiser-mot-de-passe.js';

afterEach(() => cleanup());

describe('Parcours auth — routes indivisibles (A.1)', () => {
  it('/verification — la page rend le titre « Saisissez votre code de sécurité »', async () => {
    const { container } = render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/verification']}>
          <Routes>
            <Route path="/verification" element={<SiteVerification />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>,
    );
    await waitFor(() => {
      expect(container.textContent).toContain('Saisissez votre code de sécurité');
    });
    // 6 cellules de saisie code
    const cells = container.querySelectorAll<HTMLInputElement>('input[inputmode="numeric"]');
    expect(cells.length).toBe(6);
    // Bouton « Vérifier » désactivé tant que le code n'est pas complet (6 chiffres).
    const verifier = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[type="submit"]'),
    ).find((b) => b.textContent?.includes('Vérifier'));
    expect(verifier).toBeTruthy();
    expect(verifier!.disabled).toBe(true);
  });

  it('/reinitialiser-mot-de-passe — la page rend « Définir un nouveau mot de passe »', async () => {
    const { container } = render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/reinitialiser-mot-de-passe']}>
          <Routes>
            <Route
              path="/reinitialiser-mot-de-passe"
              element={<SiteReinitialiserMotDePasse />}
            />
          </Routes>
        </MemoryRouter>
      </ToastProvider>,
    );
    await waitFor(() => {
      expect(container.textContent).toContain('Définir un nouveau mot de passe');
    });
    expect(container.textContent).toContain('8 caractères minimum');
    // Bouton désactivé tant que mdp != confirmation.
    const maj = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[type="submit"]'),
    ).find((b) => b.textContent?.includes('Mettre à jour'));
    expect(maj).toBeTruthy();
    expect(maj!.disabled).toBe(true);
  });
});
