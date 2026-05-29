// Implémentation mock de CabinetsService.

import type { ContexteCabinet } from '../contexte.js';
import type { CabinetsService } from '../cabinets-service.js';
import { CABINETS, GESTIONNAIRES_CABINETS } from './data-cabinets.js';
import { ENTREPRISES_TENANT } from './data-entreprises.js';

export function creerCabinetsServiceMock(): CabinetsService {
  return {
    async obtenirCabinet(ctx: ContexteCabinet) {
      return CABINETS.find((c) => c.id === ctx.cabinetId) ?? null;
    },

    async obtenirPortefeuille(ctx) {
      const cab = CABINETS.find((c) => c.id === ctx.cabinetId);
      if (!cab) return [];
      // Le ContexteCabinet pointe sur UNE entreprise du portefeuille, mais
      // obtenirPortefeuille() retourne le PORTEFEUILLE COMPLET du cabinet,
      // pour permettre la sélection. Le cloisonnement entre entreprises est
      // appliqué au moment d'invoquer un service scopé sur une entreprise.
      return cab.entreprisesIds
        .map((id) => ENTREPRISES_TENANT[id])
        .filter((e): e is NonNullable<typeof e> => e !== undefined);
    },

    async listerGestionnaires(ctx) {
      return GESTIONNAIRES_CABINETS.filter((g) => g.cabinetId === ctx.cabinetId);
    },

    async appartientAuPortefeuille(ctx, entrepriseId) {
      const cab = CABINETS.find((c) => c.id === ctx.cabinetId);
      return cab?.entreprisesIds.includes(entrepriseId) ?? false;
    },
  };
}
