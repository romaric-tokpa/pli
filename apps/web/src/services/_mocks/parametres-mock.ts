// Implémentation mock de ParametresService — informations légales et
// préférences de distribution. Lecture sur ENTREPRISES_TENANT (la fiche
// canonique). Préférences mutables en mémoire pour démo des Switch.

import type { Entreprise, IdEntite } from '@pli/types';
import type {
  ParametresService,
  PreferencesDistribution,
  ResultatMaj,
} from '../parametres-service.js';
import { ENTREPRISES_TENANT } from './data-entreprises.js';

const PREFS_PAR_DEFAUT: PreferencesDistribution = {
  signatureObligatoireAvantConsultation: false,
  relanceAutoJ3: true,
  notificationEmailNouveauBulletin: true,
};

export function creerParametresServiceMock(): ParametresService {
  const prefs: Record<IdEntite, PreferencesDistribution> = {};
  function obtenirOuInit(id: IdEntite): PreferencesDistribution {
    if (!prefs[id]) prefs[id] = { ...PREFS_PAR_DEFAUT };
    return prefs[id]!;
  }

  return {
    async obtenirEntreprise(ctx) {
      const e: Entreprise | undefined = ENTREPRISES_TENANT[ctx.entrepriseId];
      return e ? { ...e } : null;
    },

    async obtenirPreferences(ctx) {
      return { ...obtenirOuInit(ctx.entrepriseId) };
    },

    async basculerPreference(
      ctx,
      cle,
      valeur,
    ): Promise<ResultatMaj<PreferencesDistribution>> {
      if (!ENTREPRISES_TENANT[ctx.entrepriseId]) {
        return { ok: false, raison: 'introuvable' };
      }
      const p = obtenirOuInit(ctx.entrepriseId);
      p[cle] = valeur;
      return { ok: true, valeur: { ...p } };
    },
  };
}
