// Service paramètres — informations légales de l'entreprise + préférences
// de distribution. Le wireframe sépare cet écran de Sécurité (qui couvre
// l'auth) — on garde la même séparation côté services.

import type { Entreprise } from '@pli/types';
import type { ContexteScopeEntreprise } from './contexte.js';

export interface PreferencesDistribution {
  signatureObligatoireAvantConsultation: boolean;
  relanceAutoJ3: boolean;
  notificationEmailNouveauBulletin: boolean;
}

export type ResultatMaj<T> = { ok: true; valeur: T } | { ok: false; raison: 'introuvable' };

export interface ParametresService {
  obtenirEntreprise(ctx: ContexteScopeEntreprise): Promise<Entreprise | null>;
  obtenirPreferences(ctx: ContexteScopeEntreprise): Promise<PreferencesDistribution>;
  basculerPreference(
    ctx: ContexteScopeEntreprise,
    cle: keyof PreferencesDistribution,
    valeur: boolean,
  ): Promise<ResultatMaj<PreferencesDistribution>>;
}
