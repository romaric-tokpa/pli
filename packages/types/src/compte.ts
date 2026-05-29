// Compte personnel et rattachements employeur.
//
// Principe fondateur de la portabilité du coffre-fort Pli :
// la PERSONNE (ComptePersonnel) est distincte de l'EMPLOI (Rattachement).
// Une personne peut porter plusieurs rattachements dans le temps
// (un employeur précédent "parti", un employeur actuel "actif").
// Le coffre agrège entre employeurs UNIQUEMENT en contexte personnel.

import type { DateJJMMAAAA, IdEntite, MatriculeSalarie, Telephone225 } from './commun.js';

// -----------------------------------------------------------------------------
// Compte personnel — la clé durable du coffre. Survit aux changements
// d'employeur. Pas de tenant : appartient à la personne, pas à une entreprise.
// -----------------------------------------------------------------------------
export interface ComptePersonnel {
  id: IdEntite;
  nom: string;
  prenom: string;
  telephonePerso: Telephone225;
  /** Format affichage masqué pour l'UI ; n'est pas un substitut au champ chiffré. */
  telPersoMasque?: string;
  emailPersoRecuperation: string | null;
  emailPersoMasque?: string;
  photoUrl: string | null;
  dateCreation: DateJJMMAAAA;
}

// -----------------------------------------------------------------------------
// Rattachement — relation d'emploi entre un ComptePersonnel et une Entreprise.
// L'entité dans laquelle vit le matricule (borné au registre de l'entreprise).
//
// tenant_id ajouté à la persistance (Phase 1) : un rattachement est scopé
// à l'entreprise côté API/DB, jamais côté domaine partagé.
// -----------------------------------------------------------------------------

/** Statut du lien d'emploi côté coffre personnel. Distinct du StatutSalarie côté RH. */
export type StatutRattachement = 'actif' | 'parti';

export interface Rattachement {
  id: IdEntite;
  comptePersonnelId: IdEntite;
  entrepriseId: IdEntite;
  entrepriseNom: string;
  entrepriseSecteur: string;
  matricule: MatriculeSalarie;
  emailPro: string;
  service: string;
  poste: string;
  statut: StatutRattachement;
  dateDebut: DateJJMMAAAA;
  /** null tant que le rattachement est "actif". */
  dateFin: DateJJMMAAAA | null;
}
