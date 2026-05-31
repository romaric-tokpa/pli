// @vitest-environment happy-dom
//
// Invariant 1 CLAUDE.md — « Le salaire net n'apparaît JAMAIS dans une liste,
// carte, prévisualisation ou résumé. »
//
// Cabinet — sub-lot 11b : vérifie qu'aucun montant FCFA (net, brut, masse
// salariale, chiffre d'affaires individualisé…) n'apparaît sur le dashboard
// portefeuille NI sur l'espace entreprise scellée. Les seules valeurs
// numériques rendues sont des COMPTEURS (effectif, bulletins, relances) et
// un POURCENTAGE de consultation.
//
// Le test cherche les patterns d'un montant FCFA :
//   - le token "FCFA" (interdit absolument côté cabinet)
//   - un nombre formaté en groupes de 3 chiffres séparés par espace, qu'elle
//     soit U+0020 (normale), U+00A0 (NBSP) ou U+202F (NNBSP) — l'invariant
//     est verrouillé par le regex `\s` qui couvre TOUS les espaces Unicode.
// Un test naif qui ne chercherait que l'espace normale laisserait passer un
// "473 000" formaté avec l'espace fine insécable de fr-FR (voir sub-lot 10b).

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';
import { CabinetLayout } from '../routes/cabinet/_layout.js';
import { CabinetPortefeuille } from '../routes/cabinet/portefeuille.js';
import { CabinetEntreprise } from '../routes/cabinet/entreprise.js';
import { CabinetSuivi } from '../routes/cabinet/suivi.js';
import { CabinetGestionnaires } from '../routes/cabinet/gestionnaires.js';
import { CabinetParametres } from '../routes/cabinet/parametres.js';

afterEach(() => cleanup());

function rendreSurface(initial = '/cabinet') {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/cabinet" element={<CabinetLayout />}>
            <Route index element={<CabinetPortefeuille />} />
            <Route path="entreprises/:id" element={<CabinetEntreprise />} />
            <Route path="suivi" element={<CabinetSuivi />} />
            <Route path="gestionnaires" element={<CabinetGestionnaires />} />
            <Route path="parametres" element={<CabinetParametres />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

// Regex factorisé : un chiffre, un caractère blanc (qui inclut U+0020, U+00A0,
// U+202F en JS), puis 3 chiffres. Ce pattern décrit la formation typique d'un
// montant FCFA (473 000 / 1 250 000…). Dans le mock cabinet, AUCUNE valeur
// rendue ne devrait correspondre.
const PATTERN_MONTANT = /\d\s\d{3}/;

describe('Cabinet — Net jamais affiché (invariant 1)', () => {
  it('Dashboard portefeuille — aucun token « FCFA » dans le rendu', async () => {
    const { container } = rendreSurface('/cabinet');
    await waitFor(() => {
      expect(container.textContent).toContain('Cacao Plus SARL');
    });
    expect(container.textContent).not.toMatch(/\bFCFA\b/);
  });

  it("Dashboard portefeuille — aucun motif de montant (3 chiffres + espace + 3 chiffres)", async () => {
    const { container } = rendreSurface('/cabinet');
    await waitFor(() => {
      expect(container.textContent).toContain('Cacao Plus SARL');
    });
    expect(container.textContent ?? '').not.toMatch(PATTERN_MONTANT);
  });

  it('Entreprise scellée — aucun token « FCFA » ni motif de montant', async () => {
    const { container } = rendreSurface('/cabinet/entreprises/ec-cacao');
    await waitFor(() => {
      expect(container.textContent).toContain('Cacao Plus SARL');
    });
    const txt = container.textContent ?? '';
    expect(txt).not.toMatch(/\bFCFA\b/);
    expect(txt).not.toMatch(PATTERN_MONTANT);
  });

  it("Suivi consolidé — aucun token « FCFA » ni motif de montant", async () => {
    const { container } = rendreSurface('/cabinet/suivi');
    await waitFor(() => {
      expect(container.textContent).toContain('Suivi du portefeuille');
    });
    const txt = container.textContent ?? '';
    expect(txt).not.toMatch(/\bFCFA\b/);
    expect(txt).not.toMatch(PATTERN_MONTANT);
    // Cloisonnement explicité dans le rendu (note au pied du tableau).
    expect(txt).toContain('Cloisonnement');
  });

  it("Gestionnaires — aucun token « FCFA » ni motif de montant", async () => {
    const { container } = rendreSurface('/cabinet/gestionnaires');
    await waitFor(() => {
      expect(container.textContent).toContain('Gestionnaires');
    });
    const txt = container.textContent ?? '';
    expect(txt).not.toMatch(/\bFCFA\b/);
    expect(txt).not.toMatch(PATTERN_MONTANT);
  });

  it("Paramètres cabinet — aucun token « FCFA » ni motif de montant", async () => {
    const { container } = rendreSurface('/cabinet/parametres');
    await waitFor(() => {
      expect(container.textContent).toContain('Informations');
    });
    const txt = container.textContent ?? '';
    expect(txt).not.toMatch(/\bFCFA\b/);
    expect(txt).not.toMatch(PATTERN_MONTANT);
  });

  it('Entreprise scellée — KPIs LÉGITIMES rendus (compteurs + pourcentage)', async () => {
    // Test inverse : on s'assure que les KPIs LÉGITIMES sont rendus — sinon
    // les tests ci-dessus pourraient passer trivialement (page vide).
    const { container } = rendreSurface('/cabinet/entreprises/ec-cacao');
    await waitFor(() => {
      expect(container.textContent).toContain('Salariés actifs');
    });
    const txt = container.textContent ?? '';
    expect(txt).toContain('Bulletins ce mois');
    expect(txt).toContain('Taux de consultation');
    expect(txt).toContain('Relances en attente');
    expect(txt).toMatch(/\d+%/);
  });
});
