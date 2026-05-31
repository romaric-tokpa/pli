// Implémentation mock de CabinetsService.
//
// Sub-lot 11b : porte la lecture du portefeuille sur la nouvelle source
// `data-portefeuille-cabinet.ts` (entreprises CLIENTES du cabinet, distinctes
// des tenants Pli Pro directs). Ajoute `obtenirMetriquesPortefeuille`.

import type { ContextePortefeuilleCabinet, ContexteEspaceCabinet } from '../contexte.js';
import type { CabinetsService } from '../cabinets-service.js';
import { CABINETS, GESTIONNAIRES_CABINETS } from './data-cabinets.js';
import {
  ENTREPRISES_CABINETS,
  METRIQUES_PORTEFEUILLE_CABINET,
} from './data-portefeuille-cabinet.js';

export function creerCabinetsServiceMock(): CabinetsService {
  return {
    async obtenirCabinet(ctx: ContexteEspaceCabinet) {
      return CABINETS.find((c) => c.id === ctx.cabinetId) ?? null;
    },

    async listerGestionnaires(ctx) {
      return GESTIONNAIRES_CABINETS.filter((g) => g.cabinetId === ctx.cabinetId);
    },

    async obtenirGestionnaire(ctx, gestionnaireId) {
      return (
        GESTIONNAIRES_CABINETS.find(
          (g) => g.id === gestionnaireId && g.cabinetId === ctx.cabinetId,
        ) ?? null
      );
    },

    async obtenirPortefeuille(ctx: ContextePortefeuilleCabinet) {
      // Cloisonnement structurel : on filtre par cabinetId sur la source des
      // entreprises clientes. Aucune chance qu'une entreprise d'un autre
      // cabinet ne traverse.
      return ENTREPRISES_CABINETS.filter((e) => e.cabinetId === ctx.cabinetId);
    },

    async appartientAuPortefeuille(ctx, entrepriseId) {
      return ENTREPRISES_CABINETS.some(
        (e) => e.id === entrepriseId && e.cabinetId === ctx.cabinetId,
      );
    },

    async obtenirMetriquesPortefeuille(ctx) {
      const idsPortefeuille = new Set(
        ENTREPRISES_CABINETS.filter((e) => e.cabinetId === ctx.cabinetId).map((e) => e.id),
      );
      return METRIQUES_PORTEFEUILLE_CABINET.filter((m) =>
        idsPortefeuille.has(m.entrepriseId),
      );
    },
  };
}
