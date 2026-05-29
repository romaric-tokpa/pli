// @vitest-environment happy-dom
//
// StatusPill — couverture du mapping des états :
//  1. Palette de chaque tone (succes / attente / erreur / info / neutre)
//     vérifiée par la valeur de STATUS_STYLES.
//  2. Rendu DOM : le span pastille reçoit les bonnes styles inline
//     (couleur de fond, couleur de texte, couleur de bordure).
//  3. Projection EtatReconciliation → StatusTone — invariant métier
//     (apparie/introuvable/doublon/faible_confiance), conforme au LOT 1
//     du wireframe.

import type { EtatReconciliation } from '@pli/types';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  STATUS_STYLES,
  StatusPill,
  toneDepuisEtatReconciliation,
  type StatusTone,
} from '../components/status-pill.js';

describe('STATUS_STYLES — palette par tone (valeurs verbatim du wireframe)', () => {
  it.each<[StatusTone, { bg: string; fg: string; border: string }]>([
    ['succes', { bg: '#E6F2EC', fg: '#216A41', border: '#C2E0CE' }],
    ['attente', { bg: '#FBF1D8', fg: '#8C6A12', border: '#EAD79A' }],
    ['erreur', { bg: '#FBE3E1', fg: '#9D2A23', border: '#F0BFBB' }],
    ['info', { bg: '#DEEBF7', fg: '#1F5285', border: '#B9D2EC' }],
    ['neutre', { bg: '#EFF2F7', fg: '#5B6577', border: '#DCE1E9' }],
  ])('%s', (tone, attendu) => {
    const palette = STATUS_STYLES[tone];
    expect(palette.bg).toBe(attendu.bg);
    expect(palette.fg).toBe(attendu.fg);
    expect(palette.border).toBe(attendu.border);
  });
});

describe('<StatusPill /> — rendu DOM', () => {
  it.each<[StatusTone]>([['succes'], ['attente'], ['erreur'], ['info'], ['neutre']])(
    'rend une pastille avec les styles inline du tone "%s"',
    (tone) => {
      const { container } = render(<StatusPill tone={tone}>libellé</StatusPill>);
      const pastille = container.firstElementChild as HTMLElement | null;
      expect(pastille).not.toBeNull();
      expect(pastille!.tagName).toBe('SPAN');
      // Comparaison case-insensitive : React écrit les hex tels que dans le code (#15294E),
      // happy-dom ne normalise pas la case dans getAttribute('style').
      const style = (pastille!.getAttribute('style') ?? '').toLowerCase();
      const palette = STATUS_STYLES[tone];
      expect(style).toContain(palette.fg.toLowerCase());
      expect(style).toContain(palette.bg.toLowerCase());
      expect(style).toContain(palette.border.toLowerCase());
    },
  );

  it("applique le tone 'neutre' par défaut quand prop absente", () => {
    const { container } = render(<StatusPill>libellé</StatusPill>);
    const style = (container.firstElementChild?.getAttribute('style') ?? '').toLowerCase();
    expect(style).toContain(STATUS_STYLES.neutre.fg.toLowerCase());
  });

  it('affiche le libellé enfant', () => {
    const { container } = render(<StatusPill tone="succes">Apparié</StatusPill>);
    expect(container.textContent).toContain('Apparié');
  });
});

describe('toneDepuisEtatReconciliation — invariant métier (LOT 1 wireframe)', () => {
  it.each<[EtatReconciliation, StatusTone]>([
    ['apparie', 'succes'],
    ['introuvable', 'attente'],
    ['doublon', 'attente'],
    ['faible_confiance', 'erreur'],
  ])('%s → %s', (etat, expected) => {
    expect(toneDepuisEtatReconciliation(etat)).toBe(expected);
  });

  it("est exhaustif : couvre les 4 états de la spec sans 'neutre' ni 'info'", () => {
    const etats: EtatReconciliation[] = ['apparie', 'introuvable', 'doublon', 'faible_confiance'];
    const tones = new Set(etats.map((e) => toneDepuisEtatReconciliation(e)));
    expect(tones.has('succes')).toBe(true);
    expect(tones.has('attente')).toBe(true);
    expect(tones.has('erreur')).toBe(true);
    expect(tones.has('info')).toBe(false);
    expect(tones.has('neutre')).toBe(false);
  });
});
