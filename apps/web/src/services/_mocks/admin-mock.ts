// Implémentation mock de AdminService.
//
// Pose des stubs d'audit (journal append-only) — la Phase 1 branchera le
// vrai journal côté API. Le numéro de journal est retourné pour permettre
// au caller de référencer l'entrée.

import type { ContexteAdmin } from '../contexte.js';
import type { AdminService } from '../admin-service.js';
import { CABINETS } from './data-cabinets.js';
import { ENTREPRISES_PLATEFORME } from './data-admin.js';

let compteurJournal = 1;
function nouveauJournalId(): string {
  return `la-${String(compteurJournal++).padStart(4, '0')}`;
}

export function creerAdminServiceMock(): AdminService {
  return {
    async listerEntreprises(_ctx: ContexteAdmin) {
      return ENTREPRISES_PLATEFORME;
    },

    async listerCabinets(_ctx) {
      return CABINETS;
    },

    async impersonnerEntreprise(_ctx, _entrepriseId) {
      // En Phase 0 mock : on retourne un ID journal symbolique.
      // En Phase 1 : entrée d'audit hash-chainée, signée du adminId.
      return { journalId: nouveauJournalId() };
    },

    async suspendreEntreprise(_ctx, _entrepriseId, _motif) {
      return { journalId: nouveauJournalId() };
    },
  };
}
