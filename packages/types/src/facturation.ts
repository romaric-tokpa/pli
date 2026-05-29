// Facturation — factures émises, plans tarifaires, mode de paiement.
//
// Le forfait Pli est à 275 FCFA / salarié actif / mois (CLAUDE.md, invariant
// économique). Une facture = total = nombre de salariés actifs × tarif du
// cycle en cours. Le plan annuel applique une remise (15 % typique).
//
// tenant_id ajouté à la persistance (Phase 1) : facture/plan appartiennent
// à une entreprise.

import type {
  DateJJMMAAAA,
  IdEntite,
  MontantFCFA,
} from './commun.js';
import type { CycleAbonnement } from './abonnement.js';

export type StatutFacture = 'payee' | 'en_attente';

export type ModePaiement = 'wave' | 'cheque';

export interface Facture {
  id: IdEntite;
  numero: string;
  periode: string;
  montant: MontantFCFA;
  statut: StatutFacture;
  dateEmission: DateJJMMAAAA;
  salariesFactures: number;
  mode: 'Wave' | 'Chèque';
  /** Date de paiement effective si statut === 'payee'. */
  payeLe?: DateJJMMAAAA;
}

/**
 * Plan tarifaire affiché côté facturation : un cycle (mensuel ou annuel),
 * un tarif unitaire et une remise éventuelle. La composition (150/75/50)
 * est portée par `Abonnement.composition` côté entreprise.
 */
export interface PlanTarifaire {
  id: CycleAbonnement;
  nom: string;
  prixMois: MontantFCFA;
  prixAnnuelEquiv: MontantFCFA;
  remise: number;
  cycle: string;
  description: string;
}
