// Abonnement — forfait unique tout-compris : 275 FCFA / salarié actif / mois.
// Composition : 150 distribution + 75 signature + 50 réclamation.
// Deux cycles : Mensuel (275) ou Annuel (−15 %, ≈ 234/mois, facturé en une fois).
// Essai gratuit : 20 bulletins.
//
// tenant_id ajouté à la persistance (Phase 1) : un abonnement appartient
// à une entreprise (1-1).

import type { IdEntite, MontantFCFA } from './commun.js';

export type CycleAbonnement = 'mensuel' | 'annuel';

/**
 * Statut commercial de l'abonnement. Aligné sur StatutEntreprise du wireframe
 * (admin-data.jsx) : un même cycle de vie est exposé sur l'entreprise et sur
 * son abonnement.
 */
export type StatutAbonnement = 'active' | 'essai' | 'impaye' | 'suspendue';

/** Composition affichée du forfait — 150 + 75 + 50 = 275 FCFA par défaut. */
export interface CompositionForfait {
  distributionFCFA: MontantFCFA;
  signatureFCFA: MontantFCFA;
  reclamationFCFA: MontantFCFA;
}

export interface Abonnement {
  entrepriseId: IdEntite;
  cycle: CycleAbonnement;
  statut: StatutAbonnement;
  /** Tarif par salarié actif et par mois (275 FCFA dans le modèle de référence). */
  tarifMois: MontantFCFA;
  /** Pourcentage de remise sur cycle annuel (15 % dans le modèle de référence). */
  remiseAnnuellePct?: number;
  composition: CompositionForfait;
  /** Bulletins restants dans l'essai gratuit (20 à l'ouverture). */
  essaiBulletinsRestants?: number;
}
