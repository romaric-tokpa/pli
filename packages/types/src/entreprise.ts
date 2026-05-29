// Entreprise — tenant racine côté Pli Pro. Toutes les entités métier
// (salariés, bulletins, réclamations) en dépendent.
//
// tenant_id ajouté à la persistance (Phase 1) : l'id de l'entreprise EST
// le tenant. RLS PostgreSQL appliquée sur chaque table fille.

import type { IdEntite, Telephone225 } from './commun.js';

/** Origine du compte entreprise. */
export type TypeEntreprise = 'directe' | 'cabinet';

/** Cycle de vie commercial côté console opérateur. */
export type StatutEntreprise = 'active' | 'essai' | 'impaye' | 'suspendue';

/** Qui opère le compte au quotidien. */
export type ModeGestion = 'directe' | 'deleguee_cabinet';

export interface Entreprise {
  id: IdEntite;
  nom: string;
  raisonSociale?: string;
  adresse?: string;
  telephone?: Telephone225;
  email?: string;
  /** Registre du Commerce et du Crédit Mobilier. */
  rccm?: string;
  /** Numéro de Compte Contribuable. */
  ncc?: string;
  secteur?: string;
  effectif?: number;
  type: TypeEntreprise;
  statut: StatutEntreprise;
  modeGestion?: ModeGestion;
  cabinetId?: IdEntite | null;
}
