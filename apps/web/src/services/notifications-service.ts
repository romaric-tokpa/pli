// Service notifications mobile salarié.
//
// Le badge cachet du MobileTabBar reflète `compterNonLues()` — règle UX
// portée par le service, miroir de l'invariant CLAUDE.md « tout bouton
// déclenche une action ».

import type { IdEntite } from '@pli/types';
import type { ContextePersonnel } from './contexte.js';

export type TypeNotification =
  | 'nouveau_bulletin'
  | 'rappel_signature'
  | 'reclamation'
  | 'securite';

export interface Notification {
  id: IdEntite;
  type: TypeNotification;
  titre: string;
  description: string;
  /** Libellé naturel (« il y a 2 h », « hier », « 29/01/2026 »). */
  date: string;
  lu: boolean;
  /** Nom d'icône lucide pour le rendu. */
  icon: string;
}

export interface NotificationsService {
  lister(ctx: ContextePersonnel): Promise<Notification[]>;
  compterNonLues(ctx: ContextePersonnel): Promise<number>;
  marquerLue(ctx: ContextePersonnel, id: IdEntite): Promise<{ ok: true }>;
  marquerToutesLues(ctx: ContextePersonnel): Promise<{ ok: true; touchees: number }>;
}
