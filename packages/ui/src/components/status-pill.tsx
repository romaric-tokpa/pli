// StatusPill — pastille colorée d'état.
//
// `tone` accepte les 5 valeurs prévues par le wireframe : succes | attente |
// erreur | info | neutre. Chaque tone a une icône par défaut (override possible
// via prop `icon`).
//
// Pour le tableau de réconciliation (Pli Pro · #/pro/bulletins/upload), le
// helper `toneDepuisEtatReconciliation` projette les 4 EtatReconciliation
// (apparie / introuvable / doublon / faible_confiance) vers le tone qui
// correspond à leur sémantique métier — mapping documenté dans la spec :
//   apparie         → succes
//   introuvable     → attente (action RH : créer le salarié · corriger · écarter)
//   doublon         → attente (action RH : remplacer · conserver · écarter)
//   faible_confiance → erreur (action RH : vérifier puis inclure)

import type { ReactNode } from 'react';
import type { EtatReconciliation } from '@pli/types';
import { Icon, type IconName } from './icon.js';
import { cn } from '../lib/cn.js';

export type StatusTone = 'succes' | 'attente' | 'erreur' | 'info' | 'neutre';
export type StatusPillSize = 'sm' | 'md';

export interface StatusPalette {
  bg: string;
  fg: string;
  border: string;
  icon: IconName;
}

/** Palette par tone — derived de design-system.jsx (valeurs verbatim). */
export const STATUS_STYLES: Record<StatusTone, StatusPalette> = {
  succes: { bg: '#E6F2EC', fg: '#216A41', border: '#C2E0CE', icon: 'Check' },
  attente: { bg: '#FBF1D8', fg: '#8C6A12', border: '#EAD79A', icon: 'Clock' },
  erreur: { bg: '#FBE3E1', fg: '#9D2A23', border: '#F0BFBB', icon: 'TriangleAlert' },
  info: { bg: '#DEEBF7', fg: '#1F5285', border: '#B9D2EC', icon: 'Info' },
  neutre: { bg: '#EFF2F7', fg: '#5B6577', border: '#DCE1E9', icon: 'Circle' },
};

/**
 * Projection EtatReconciliation → StatusTone.
 * Mapping référence : voir le README du wireframe, section LOT 1.
 */
export function toneDepuisEtatReconciliation(etat: EtatReconciliation): StatusTone {
  switch (etat) {
    case 'apparie':
      return 'succes';
    case 'introuvable':
    case 'doublon':
      return 'attente';
    case 'faible_confiance':
      return 'erreur';
  }
}

export interface StatusPillProps {
  tone?: StatusTone;
  icon?: IconName;
  children?: ReactNode;
  size?: StatusPillSize;
}

export function StatusPill({ tone = 'neutre', icon, children, size = 'md' }: StatusPillProps) {
  const s = STATUS_STYLES[tone];
  const sz = size === 'sm' ? 'h-5 px-2 text-[11px]' : 'h-6 px-2.5 text-[12px]';
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full font-medium border', sz)}
      style={{ backgroundColor: s.bg, color: s.fg, borderColor: s.border }}
    >
      <Icon name={icon ?? s.icon} size={size === 'sm' ? 10 : 12} strokeWidth={2.25} />
      {children}
    </span>
  );
}
