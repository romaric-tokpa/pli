// Implémentation mock de FacturationService.
//
// Le tarif unique (275 FCFA) est exposé comme constante du module — sera
// remplacé par un appel HTTP en Phase 2. Toute mutation (changement de
// plan, mode de paiement) clone l'état en mémoire de l'instance mock pour
// permettre la persistance pendant la durée de vie de la session.

import type {
  Abonnement,
  CycleAbonnement,
  Facture,
  IdEntite,
  ModePaiement,
  PlanTarifaire,
} from '@pli/types';
import type {
  FacturationService,
  ResultatChangementMode,
  ResultatChangementPlan,
  Tarifs,
} from '../facturation-service.js';
import { creerSalariesServiceMock } from './salaries-mock.js';
import {
  ABONNEMENTS_PAR_ENTREPRISE,
  FACTURES_PAR_ENTREPRISE,
  MODES_PAIEMENT_PAR_ENTREPRISE,
} from './data-entreprises.js';

const PLANS: PlanTarifaire[] = [
  {
    id: 'mensuel',
    nom: 'Mensuel',
    prixMois: 275,
    prixAnnuelEquiv: 275 * 12,
    remise: 0,
    cycle: 'Facturé chaque mois',
    description: 'Sans engagement — résiliable à tout moment',
  },
  {
    id: 'annuel',
    nom: 'Annuel',
    prixMois: 234,
    prixAnnuelEquiv: 2805,
    remise: 15,
    cycle: 'Facturé une fois par an',
    description: 'Économisez ≈ 2 mois sur 12 (−15 %)',
  },
];

const TARIFS_PUBLICS: Tarifs = {
  forfaitMois: 275,
  composition: {
    distributionFCFA: 150,
    signatureFCFA: 75,
    reclamationFCFA: 50,
  },
  plans: PLANS,
  essaiBulletins: 20,
};

export function creerFacturationServiceMock(): FacturationService {
  const salaries = creerSalariesServiceMock();

  // Copies mutables : permettent à la modale « Changer de plan » de
  // persister son choix dans la durée de vie de la page.
  const abonnements: Record<IdEntite, Abonnement> = {};
  for (const [id, ab] of Object.entries(ABONNEMENTS_PAR_ENTREPRISE)) {
    abonnements[id] = { ...ab, composition: { ...ab.composition } };
  }
  const modes: Record<IdEntite, ModePaiement> = { ...MODES_PAIEMENT_PAR_ENTREPRISE };

  function obtenirFactures(id: IdEntite): Facture[] {
    return FACTURES_PAR_ENTREPRISE[id] ?? [];
  }

  return {
    async obtenirTarifs() {
      return {
        ...TARIFS_PUBLICS,
        plans: TARIFS_PUBLICS.plans.map((p) => ({ ...p })),
      };
    },

    async obtenirAbonnement(ctx) {
      const ab = abonnements[ctx.entrepriseId];
      return ab ? { ...ab, composition: { ...ab.composition } } : null;
    },

    async obtenirModePaiement(ctx) {
      return modes[ctx.entrepriseId] ?? null;
    },

    async listerFactures(ctx) {
      return obtenirFactures(ctx.entrepriseId).map((f) => ({ ...f }));
    },

    async compterSalariesActifs(ctx) {
      const liste = await salaries.lister(ctx, { statut: 'actif' });
      return liste.length;
    },

    async changerPlan(ctx, cycle: CycleAbonnement): Promise<ResultatChangementPlan> {
      const ab = abonnements[ctx.entrepriseId];
      if (!ab) return { ok: false, raison: 'introuvable' };
      if (ab.cycle === cycle) return { ok: false, raison: 'meme_plan' };
      const tarifMois = cycle === 'mensuel' ? 275 : 234;
      abonnements[ctx.entrepriseId] = { ...ab, cycle, tarifMois };
      return { ok: true, abonnement: abonnements[ctx.entrepriseId]! };
    },

    async changerModePaiement(ctx, mode: ModePaiement): Promise<ResultatChangementMode> {
      if (!(ctx.entrepriseId in modes)) return { ok: false, raison: 'introuvable' };
      modes[ctx.entrepriseId] = mode;
      return { ok: true, mode };
    },
  };
}
