// Service réclamations — fil de discussion bidirectionnel RH ↔ salarié.
//
// Invariant CLAUDE.md « Isolation tenant » : toutes les opérations sont
// scopées au registre de l'entreprise du contexte. Une réclamation ouverte
// chez Comoé ne peut JAMAIS être lue/répondue depuis le contexte Atlantique.
// Le mock applique le filtrage dès l'entrée par `ctx.entrepriseId`.
//
// L'envoi de réponse et la résolution renvoient un `ResultatReponse` plutôt
// qu'un void : permet de remonter une erreur métier (réclamation déjà résolue,
// non trouvée hors tenant, etc.) sans levée d'exception.

import type { IdEntite, Reclamation, StatutReclamation } from '@pli/types';
import type { ContexteScopeEntreprise } from './contexte.js';

export interface FiltreReclamations {
  statut?: StatutReclamation;
  recherche?: string;
}

export interface StatistiquesReclamations {
  total: number;
  parStatut: { statut: StatutReclamation; count: number }[];
  parType: { type: string; count: number; couleur: string }[];
  tendance6Mois: { mois: string; ouvertes: number; resolues: number }[];
  delaiPremiereReponse: string;
  delaiResolutionMoyen: string;
  tauxResolution: number;
}

export type ResultatReponse =
  | { ok: true; reclamation: Reclamation }
  | { ok: false; raison: 'introuvable' | 'deja_resolue' };

export interface ReclamationsService {
  lister(
    ctx: ContexteScopeEntreprise,
    filtre?: FiltreReclamations,
  ): Promise<Reclamation[]>;

  obtenir(ctx: ContexteScopeEntreprise, id: IdEntite): Promise<Reclamation | null>;

  statistiques(ctx: ContexteScopeEntreprise): Promise<StatistiquesReclamations>;

  /**
   * Ajoute un message du côté RH. Refuse si la réclamation est `resolue`
   * ou inexistante dans le tenant.
   */
  envoyerReponse(
    ctx: ContexteScopeEntreprise,
    id: IdEntite,
    texte: string,
    auteurNom: string,
  ): Promise<ResultatReponse>;

  /** Bascule le statut à `resolue`. Refuse si déjà résolue ou inexistante. */
  marquerResolue(ctx: ContexteScopeEntreprise, id: IdEntite): Promise<ResultatReponse>;
}
