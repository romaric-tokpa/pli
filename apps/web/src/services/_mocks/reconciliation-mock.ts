// Implémentation mock de ReconciliationService.
//
// Applique strictement l'invariant CLAUDE.md : seules les lignes "apparie"
// sont distribuées. Les exceptions passées par erreur (introuvable, doublon,
// faible_confiance) sont REFUSÉES et comptabilisées dans `refuses`.

import type { ContexteScopeEntreprise } from '../contexte.js';
import type { ReconciliationService, ResultatDistribution } from '../reconciliation-service.js';
import { RECONCILIATION_PAR_ENTREPRISE } from './data-entreprises.js';

export function creerReconciliationServiceMock(): ReconciliationService {
  return {
    async obtenirLot(ctx: ContexteScopeEntreprise, filtre) {
      const lot = RECONCILIATION_PAR_ENTREPRISE[ctx.entrepriseId] ?? [];
      return filtre?.etat ? lot.filter((l) => l.etat === filtre.etat) : lot;
    },

    async distribuer(ctx: ContexteScopeEntreprise, lignesIds): Promise<ResultatDistribution> {
      const lot = RECONCILIATION_PAR_ENTREPRISE[ctx.entrepriseId] ?? [];
      const cibles = lot.filter((l) => lignesIds.includes(l.id));

      let distribues = 0;
      let refuses = 0;
      for (const ligne of cibles) {
        if (ligne.etat === 'apparie') {
          distribues += 1;
        } else {
          // INVARIANT : on ne distribue PAS, on incrémente le compteur d'audit.
          refuses += 1;
        }
      }
      return { distribues, refuses };
    },
  };
}
