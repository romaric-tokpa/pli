// Service admin — console opérateur Pli.
//
// Pas de scoping tenant (vue globale plateforme). Chaque opération est
// JOURNALISÉE dans l'audit append-only (CLAUDE.md invariant 4). L'impl
// mock pose un stub d'audit pour rappeler l'obligation.

import type { Cabinet, Entreprise, IdEntite } from '@pli/types';
import type { ContexteAdmin } from './contexte.js';

export interface AdminService {
  /** Liste toutes les entreprises (vue plateforme). */
  listerEntreprises(ctx: ContexteAdmin): Promise<Entreprise[]>;

  /** Liste tous les cabinets partenaires. */
  listerCabinets(ctx: ContexteAdmin): Promise<Cabinet[]>;

  /**
   * Impersonation : « se connecter en tant que » un admin RH d'une entreprise.
   * Doit poser une entrée d'audit. En Phase 0 mock : enregistre l'action.
   */
  impersonnerEntreprise(ctx: ContexteAdmin, entrepriseId: IdEntite): Promise<{ journalId: string }>;

  /**
   * Suspension d'une entreprise (impayé > 30j etc.). Action sensible journalisée.
   */
  suspendreEntreprise(
    ctx: ContexteAdmin,
    entrepriseId: IdEntite,
    motif: string,
  ): Promise<{ journalId: string }>;
}
