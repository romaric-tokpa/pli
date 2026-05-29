// Cabinets partenaires (comptable ou intérim) — opèrent AU NOM DE plusieurs
// entreprises clientes. Vue cabinet = portefeuille d'entreprises, chacune
// strictement cloisonnée des autres (invariant CLAUDE.md).
//
// tenant_id ajouté à la persistance (Phase 1) : un gestionnaire de cabinet
// est scopé à son cabinet ET à la liste d'entreprises qui lui sont affectées.

import type { DateJJMMAAAA, IdEntite, Telephone225 } from './commun.js';

export type TypeCabinet = 'comptable' | 'interim';

/** Mode de facturation : tout au cabinet, ou refacturation à chaque entreprise. */
export type ModeFacturationCabinet = 'consolide' | 'par_entreprise';

/** Statut actuel limité à "actif" dans le wireframe — élargir au besoin. */
export type StatutCabinet = 'actif';

export type RoleGestionnaireCabinet = 'responsable' | 'gestionnaire';

export interface Cabinet {
  id: IdEntite;
  nom: string;
  type: TypeCabinet;
  contact: string;
  email: string;
  telephone: Telephone225;
  adresse: string;
  modeFacturation: ModeFacturationCabinet;
  /** Remise partenaire en %, applicable quand modeFacturation === "consolide". */
  remisePartenaire: number | null;
  /** Commission cabinet en %, applicable quand modeFacturation === "par_entreprise". */
  tauxCommission: number | null;
  statut: StatutCabinet;
  dateContrat: DateJJMMAAAA;
  entreprisesIds: IdEntite[];
}

export interface GestionnaireCabinet {
  id: IdEntite;
  cabinetId: IdEntite;
  nom: string;
  role: RoleGestionnaireCabinet;
  email: string;
  /** Sous-ensemble des entreprises du cabinet auxquelles l'utilisateur a accès. */
  entreprisesAffectees: IdEntite[];
  derniereConnexion: DateJJMMAAAA;
  /** Authentification à deux facteurs activée. */
  a2f: boolean;
}
