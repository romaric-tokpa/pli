// Service cabinet — portefeuille d'entreprises clientes.
//
// Cloisonnement (CLAUDE.md invariant 5) : un cabinet voit son portefeuille
// d'entreprises, MAIS chaque entreprise du portefeuille est isolée des
// autres. Le scoping cross-entreprise n'existe pas — pour opérer sur une
// entreprise du portefeuille, il faut un ContexteCabinet qui pointe sur
// l'entrepriseId précise.

import type { Cabinet, Entreprise, GestionnaireCabinet, IdEntite } from '@pli/types';
import type { ContexteCabinet } from './contexte.js';

export interface CabinetsService {
  /** Profil du cabinet courant. */
  obtenirCabinet(ctx: ContexteCabinet): Promise<Cabinet | null>;

  /** Portefeuille d'entreprises du cabinet courant. */
  obtenirPortefeuille(ctx: ContexteCabinet): Promise<Entreprise[]>;

  /** Gestionnaires affectés au cabinet courant. */
  listerGestionnaires(ctx: ContexteCabinet): Promise<GestionnaireCabinet[]>;

  /**
   * Vérifie qu'une entreprise précise est dans le portefeuille du cabinet
   * courant — utilisé par les services scopés sur ContexteCabinet pour
   * refuser une opération hors portefeuille.
   */
  appartientAuPortefeuille(ctx: ContexteCabinet, entrepriseId: IdEntite): Promise<boolean>;
}
