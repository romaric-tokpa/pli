// Service réconciliation — pipeline d'ingestion → appairage → distribution.
//
// Invariant CLAUDE.md « Rien n'est distribué sans appairage certain (apparié).
// Jamais une exception. » : `distribuer` doit FILTRER en interne sur les lignes
// en état "apparie" et IGNORER (avec un compteur explicite) toute exception
// passée par erreur. Aucun chemin de code ne distribue une ligne non appariée.

import type { IdEntite, LigneReconciliation } from '@pli/types';
import type { ContexteScopeEntreprise } from './contexte.js';
import type { FiltreReconciliation } from './types.js';

export interface ResultatDistribution {
  /** Nombre de lignes effectivement distribuées (toutes en état "apparie"). */
  readonly distribues: number;
  /**
   * Nombre de lignes refusées par l'invariant — exceptions (introuvable,
   * doublon, faible_confiance) passées par erreur dans la liste à distribuer.
   * Doit toujours être 0 dans le flux normal ; un nombre > 0 signale un bug
   * côté caller.
   */
  readonly refuses: number;
}

export interface ReconciliationService {
  /** Lot en cours de réconciliation pour le tenant. */
  obtenirLot(
    ctx: ContexteScopeEntreprise,
    filtre?: FiltreReconciliation,
  ): Promise<LigneReconciliation[]>;

  /**
   * Distribue UNIQUEMENT les lignes en état "apparie".
   * Si la liste contient des lignes en exception, elles sont REFUSÉES
   * silencieusement et comptées dans `refuses`. Voir invariant CLAUDE.md.
   */
  distribuer(ctx: ContexteScopeEntreprise, lignesIds: IdEntite[]): Promise<ResultatDistribution>;
}
