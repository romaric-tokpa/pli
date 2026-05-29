// Service facturation — forfait, plans, factures et mode de paiement de
// l'entreprise du contexte.
//
// Invariant CLAUDE.md « Le forfait 275 FCFA (= 150 + 75 + 50) doit rester
// cohérent entre Pli Pro, la console et le modèle économique » : ce service
// EST la source de vérité pour le tarif côté Pro. La console partagera la
// même structure (mais via AdminService).

import type {
  Abonnement,
  CompositionForfait,
  CycleAbonnement,
  Facture,
  ModePaiement,
  MontantFCFA,
  PlanTarifaire,
} from '@pli/types';
import type { ContexteScopeEntreprise } from './contexte.js';

export interface Tarifs {
  /** Tarif unitaire de base (275 FCFA dans le modèle). */
  forfaitMois: MontantFCFA;
  /** Décomposition affichée du forfait. */
  composition: CompositionForfait;
  /** Plans disponibles (mensuel + annuel). */
  plans: PlanTarifaire[];
  /** Nombre de bulletins offerts en essai. */
  essaiBulletins: number;
}

export type ResultatChangementPlan =
  | { ok: true; abonnement: Abonnement }
  | { ok: false; raison: 'introuvable' | 'meme_plan' };

export type ResultatChangementMode =
  | { ok: true; mode: ModePaiement }
  | { ok: false; raison: 'introuvable' };

export interface FacturationService {
  /** Tarifs publics — pas de scoping tenant nécessaire. */
  obtenirTarifs(): Promise<Tarifs>;

  /** Abonnement de l'entreprise du contexte. */
  obtenirAbonnement(ctx: ContexteScopeEntreprise): Promise<Abonnement | null>;

  /** Mode de paiement courant (Wave / Chèque). */
  obtenirModePaiement(ctx: ContexteScopeEntreprise): Promise<ModePaiement | null>;

  /** Historique des factures, plus récente en premier. */
  listerFactures(ctx: ContexteScopeEntreprise): Promise<Facture[]>;

  /** Compte des salariés actifs (base de calcul du forfait). */
  compterSalariesActifs(ctx: ContexteScopeEntreprise): Promise<number>;

  /** Bascule de plan — pas d'effet réel en Phase 0. */
  changerPlan(
    ctx: ContexteScopeEntreprise,
    cycle: CycleAbonnement,
  ): Promise<ResultatChangementPlan>;

  /** Bascule du mode de paiement. */
  changerModePaiement(
    ctx: ContexteScopeEntreprise,
    mode: ModePaiement,
  ): Promise<ResultatChangementMode>;
}
