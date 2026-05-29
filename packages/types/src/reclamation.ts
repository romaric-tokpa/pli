// Réclamations — fil de discussion bidirectionnel RH ↔ salarié,
// rattaché à un bulletin précis.
//
// tenant_id ajouté à la persistance (Phase 1) : une réclamation appartient
// à l'entreprise du salarié émetteur.

import type { DateJJMMAAAA, IdEntite } from './commun.js';

export type StatutReclamation = 'nouvelle' | 'en_cours' | 'resolue';

export type AuteurMessageReclamation = 'salarie' | 'rh';

export interface MessageReclamation {
  auteur: AuteurMessageReclamation;
  nom: string;
  /** Date d'envoi du message. Format "JJ/MM/AAAA HH:MM" dans le wireframe. */
  date: DateJJMMAAAA;
  texte: string;
  /** Pièces jointes éventuelles (noms de fichier). */
  piecesJointes?: string[];
}

export interface Reclamation {
  id: IdEntite;
  salarieId: IdEntite;
  bulletinId: IdEntite;
  /**
   * Type / motif libre (libellé affiché). Le wireframe utilise des libellés
   * non normalisés ("Montant erroné", "Ligne manquante", "Période incorrecte",
   * "Autre") — pas d'énum strict pour rester ouvert aux nouveaux motifs.
   */
  type: string;
  statut: StatutReclamation;
  sujet: string;
  dateOuverture: DateJJMMAAAA;
  /**
   * Libellé naturel ("hier", "il y a 2 jours", "le 22/01/2026") issu du wireframe.
   * Sera calculé côté front à partir d'une date ISO en Phase 1.
   */
  derniereActivite: string;
  messages: MessageReclamation[];
}
