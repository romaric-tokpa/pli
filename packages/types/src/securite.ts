// Sécurité — sessions actives, paramètres d'authentification, journal d'audit.
//
// Invariant CLAUDE.md « max 2 sessions par entreprise / 1 sur mobile » : le
// type Session ne le porte pas (c'est une règle métier appliquée par
// SecuriteService.connecter, hors Phase 0) mais la liste retournée par
// .obtenirSessions() ne doit jamais dépasser ce cap côté pro.
//
// Journal d'audit append-only chaîné par hash en Phase 1 — pour la mock on
// se contente des champs d'affichage.

import type { DateJJMMAAAA, IdEntite } from './commun.js';

export interface Session {
  id: IdEntite;
  appareil: string;
  lieu: string;
  derniereActivite: string;
  /** True pour la session de l'utilisateur connecté. */
  actuel: boolean;
  icon: string;
}

export type TypeEntreeAudit =
  | 'connexion'
  | 'distribution'
  | 'modification'
  | 'upload'
  | 'reclamation'
  | 'creation'
  | 'securite'
  | 'export';

export interface EntreeAudit {
  id: IdEntite;
  /** Date complète horodatée — format "JJ/MM/AAAA HH:MM" dans le wireframe. */
  date: DateJJMMAAAA;
  utilisateur: string;
  action: string;
  ip: string;
  type: TypeEntreeAudit;
}

export interface ParametresAuthentification {
  /** Double authentification activée. */
  a2f: boolean;
  /** Date de la dernière modification du mot de passe. */
  dernierChangementMotDePasse: DateJJMMAAAA;
  /** Restrictions IP/horaires (Phase 1). */
  restrictionIP: boolean;
  restrictionHoraire: boolean;
  /** Alertes e-mail à la connexion depuis un nouvel appareil. */
  alertesSecurite: boolean;
}
