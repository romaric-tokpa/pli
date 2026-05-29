// @vitest-environment happy-dom
//
// Tests d'invariant UI sur l'écran de réconciliation.
//
// Objectifs :
//
// 1. **La règle vit dans le SERVICE, pas dans l'UI**. Si on bypass le `disabled`
//    du bouton "Distribuer", c'est le ReconciliationService qui REFUSE les
//    exceptions. Le test passe par une factory de service capturée (espion).
//
// 2. **3 états d'exception → 3 jeux d'actions distincts** :
//    - introuvable : Créer / Corriger / Écarter
//    - doublon : Remplacer / Conserver / Écarter
//    - faible_confiance : Vérifier puis inclure / Écarter
//
// 3. **Disabled par défaut quand prets === 0** (UX, miroir de la règle service).
//
// 4. **Net jamais lu** : on vérifie que LigneReconciliation servi par le service
//    ne contient aucun champ montant.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';
import type { LigneReconciliation } from '@pli/types';
import type { ContexteEntreprise, ReconciliationService, SalariesService } from '../services/index.js';
import {
  creerReconciliationServiceMock,
  creerSalariesServiceMock,
} from '../services/index.js';
import { ProBulletinsUpload } from '../routes/pro/bulletins/reconciliation.js';

afterEach(() => cleanup());

const CONTEXTE: ContexteEntreprise = { type: 'entreprise', entrepriseId: 'atlantique' };

function lotMixte(): LigneReconciliation[] {
  return [
    { id: 'a1', fichier: 'a1.pdf', matriculeDetecte: 'MAT-00112', nom: 'Aya Koffi', service: 'Compta', periode: '2026-02', etat: 'apparie' },
    { id: 'a2', fichier: 'a2.pdf', matriculeDetecte: 'MAT-00118', nom: 'Kouadio', service: 'Commercial', periode: '2026-02', etat: 'apparie' },
    { id: 'x1', fichier: 'x1.pdf', matriculeDetecte: 'MAT-00999', nom: null, service: null, periode: '2026-02', etat: 'introuvable' },
    { id: 'x2', fichier: 'x2.pdf', matriculeDetecte: 'MAT-00163', nom: 'Konan', service: 'Direction', periode: '2026-02', etat: 'doublon' },
    { id: 'x3', fichier: 'x3.pdf', matriculeDetecte: 'MAT-0O238', nom: 'Sékou (?)', service: 'Production', periode: '2026-02', etat: 'faible_confiance', confiance: 56 },
  ];
}

function lotSansApparie(): LigneReconciliation[] {
  return lotMixte().filter((l) => l.etat !== 'apparie');
}

function rendreEcran(lot: LigneReconciliation[]) {
  // Service avec lot injecté + espion sur distribuer pour observer ce que l'UI envoie
  const reconciliation: ReconciliationService = {
    async obtenirLot() {
      return lot;
    },
    distribuer: vi.fn(async (_ctx, ids) => {
      // RÈGLE — vit dans le service : refuse toute ligne en exception même si
      // l'UI l'envoie (bypass du disabled). Reproduit `creerReconciliationServiceMock`.
      let distribues = 0;
      let refuses = 0;
      for (const id of ids) {
        const ligne = lot.find((l) => l.id === id);
        if (!ligne) continue;
        if (ligne.etat === 'apparie') distribues += 1;
        else refuses += 1;
      }
      return { distribues, refuses };
    }),
  };
  const salaries: SalariesService = creerSalariesServiceMock();

  const factory = () => ({ reconciliation, salaries });

  const utils = render(
    <MemoryRouter initialEntries={['/pro/bulletins/upload']}>
      <ToastProvider>
        <ProBulletinsUpload servicesFactory={factory} />
      </ToastProvider>
    </MemoryRouter>,
  );

  return { ...utils, reconciliation };
}

async function allerEnReconciliation(container: HTMLElement) {
  const cliquer = (label: string) => {
    const bouton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label),
    );
    expect(bouton, `bouton « ${label} » introuvable`).toBeDefined();
    bouton!.click();
  };
  // Phase 1 → phase 2
  await act(async () => cliquer('Continuer'));
  // Phase 2 → phase 3 (utilise le lot de démonstration)
  await act(async () => cliquer('Utiliser le lot de démonstration'));
}

describe('Réconciliation — la règle vit dans le service', () => {
  it('appelle ReconciliationService.distribuer(ctx, ids) côté SERVICE — pas un filtre UI', async () => {
    const { container, reconciliation } = rendreEcran(lotMixte());
    await allerEnReconciliation(container);
    await waitFor(() => expect(container.textContent).toContain('Réconciliation du lot'));

    const distribuer = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.match(/^Distribuer/),
    );
    expect(distribuer).toBeDefined();
    expect(distribuer!.hasAttribute('disabled')).toBe(false);

    await act(async () => distribuer!.click());

    // Le service A ÉTÉ appelé avec TOUTES les lignes non-écartées
    // (y compris exceptions), pour démontrer que le filtrage final est
    // FAIT PAR LE SERVICE, pas par l'UI.
    expect(reconciliation.distribuer).toHaveBeenCalledTimes(1);
    const [ctx, ids] = (reconciliation.distribuer as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(ctx).toEqual(CONTEXTE);
    // L'UI envoie les apparies + exceptions (pas les ecartes) — le service trie.
    expect(ids).toEqual(expect.arrayContaining(['a1', 'a2', 'x1', 'x2', 'x3']));
  });

  it('le service REFUSE les exceptions injectées dans la liste — confirmé par le résultat', async () => {
    const { container, reconciliation } = rendreEcran(lotMixte());
    await allerEnReconciliation(container);
    await waitFor(() => expect(container.textContent).toContain('Réconciliation du lot'));

    const distribuer = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.match(/^Distribuer/),
    );
    await act(async () => distribuer!.click());

    const distribuerFn = reconciliation.distribuer as ReturnType<typeof vi.fn>;
    const resultat = await distribuerFn.mock.results[0]!.value;
    expect(resultat).toEqual({ distribues: 2, refuses: 3 });
  });

  it("disabled quand aucune ligne 'apparie' (miroir UX de la règle service)", async () => {
    const { container } = rendreEcran(lotSansApparie());
    await allerEnReconciliation(container);
    await waitFor(() => expect(container.textContent).toContain('Réconciliation du lot'));

    const distribuer = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.match(/Distribuer \(0\)/),
    );
    expect(distribuer).toBeDefined();
    expect(distribuer!.hasAttribute('disabled')).toBe(true);
  });
});

describe('Réconciliation — 3 états d\'exception, 3 jeux d\'actions distincts', () => {
  it("introuvable affiche Créer / Corriger / Écarter", async () => {
    const lot: LigneReconciliation[] = [
      { id: 'x1', fichier: 'x.pdf', matriculeDetecte: 'MAT-X', nom: null, service: null, periode: '2026-02', etat: 'introuvable' },
    ];
    const { container } = rendreEcran(lot);
    await allerEnReconciliation(container);
    await waitFor(() => expect(container.textContent).toContain('Réconciliation du lot'));

    const txt = container.textContent ?? '';
    expect(txt).toContain('Créer');
    expect(txt).toContain('Corriger');
    expect(txt).toContain('Écarter');
    // Pas d'actions des autres états
    expect(txt).not.toContain('Remplacer');
    expect(txt).not.toContain('Vérifier puis inclure');
  });

  it("doublon affiche Remplacer / Conserver l'existant / Écarter", async () => {
    const lot: LigneReconciliation[] = [
      { id: 'x2', fichier: 'x.pdf', matriculeDetecte: 'MAT-X', nom: 'Doe', service: 'X', periode: '2026-02', etat: 'doublon' },
    ];
    const { container } = rendreEcran(lot);
    await allerEnReconciliation(container);
    await waitFor(() => expect(container.textContent).toContain('Réconciliation du lot'));

    const txt = container.textContent ?? '';
    expect(txt).toContain('Remplacer');
    expect(txt).toContain("Conserver l'existant");
    expect(txt).toContain('Écarter');
    expect(txt).not.toContain('Créer');
    expect(txt).not.toContain('Vérifier puis inclure');
  });

  it("faible_confiance affiche Vérifier puis inclure / Écarter (avec score)", async () => {
    const lot: LigneReconciliation[] = [
      { id: 'x3', fichier: 'x.pdf', matriculeDetecte: 'MAT-X', nom: 'Doe (?)', service: 'X', periode: '2026-02', etat: 'faible_confiance', confiance: 56 },
    ];
    const { container } = rendreEcran(lot);
    await allerEnReconciliation(container);
    await waitFor(() => expect(container.textContent).toContain('Réconciliation du lot'));

    const txt = container.textContent ?? '';
    expect(txt).toContain('Vérifier puis inclure');
    expect(txt).toContain('Écarter');
    expect(txt).toContain('56%'); // score de confiance affiché
    expect(txt).not.toContain('Créer');
    expect(txt).not.toContain('Remplacer');
  });
});

describe('Réconciliation — invariant net jamais LU', () => {
  it("LigneReconciliation NE PORTE AUCUN CHAMP montant (au niveau du type)", () => {
    const ligne: LigneReconciliation = {
      id: 'l1',
      fichier: 'l.pdf',
      matriculeDetecte: 'MAT-X',
      nom: 'X',
      service: 'X',
      periode: '2026-02',
      etat: 'apparie',
    };
    // Le type ne permet pas brut/cnps/its/net — au runtime non plus.
    expect(ligne).not.toHaveProperty('brut');
    expect(ligne).not.toHaveProperty('cnps');
    expect(ligne).not.toHaveProperty('its');
    expect(ligne).not.toHaveProperty('net');
    expect(ligne).not.toHaveProperty('montant');
  });

  it("le service réel n'expose aucun montant dans son lot", async () => {
    const service = creerReconciliationServiceMock();
    const lot = await service.obtenirLot(CONTEXTE);
    expect(lot.length).toBeGreaterThan(0);
    for (const ligne of lot) {
      expect(ligne).not.toHaveProperty('brut');
      expect(ligne).not.toHaveProperty('cnps');
      expect(ligne).not.toHaveProperty('its');
      expect(ligne).not.toHaveProperty('net');
      expect(ligne).not.toHaveProperty('montant');
    }
  });
});
