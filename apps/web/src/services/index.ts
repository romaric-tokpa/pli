// Barrel de la couche services.
//
// CONSOMMATION par les écrans (étapes 8-12) :
//
//   import { useServices } from '@/services';            // (hook React à venir)
//   import type { BulletinsService } from '@/services';
//
// Les écrans n'importent JAMAIS les fichiers du dossier `_mocks/` directement.
// Cette règle est vérifiée par un test ESLint custom à l'étape 7 (grep final)
// et reste appliquée à chaque étape suivante.

// ─── Contextes & types ────────────────────────────────────────────────────
export type {
  ContexteEntreprise,
  ContextePersonnel,
  ContextePortefeuilleCabinet,
  ContexteCabinet,
  ContexteEspaceCabinet,
  ContexteAdmin,
  ContexteScopeEntreprise,
  ContexteAcces,
} from './contexte.js';

export type {
  BulletinResume,
  BulletinDetail,
  BulletinCoffreResume,
  BulletinCoffreDetail,
  FiltreSalaries,
  FiltreBulletins,
  FiltreReconciliation,
} from './types.js';

// ─── Interfaces des services ──────────────────────────────────────────────
export type { SalariesService } from './salaries-service.js';
export type { BulletinsService } from './bulletins-service.js';
export type { ReconciliationService, ResultatDistribution } from './reconciliation-service.js';
export type {
  ReclamationsService,
  FiltreReclamations,
  ResultatReponse,
  StatistiquesReclamations,
} from './reclamations-service.js';
export type {
  FacturationService,
  Tarifs,
  ResultatChangementPlan,
  ResultatChangementMode,
} from './facturation-service.js';
export type {
  SecuriteService,
  FiltreAudit,
  ResultatDeconnexion,
} from './securite-service.js';
export type {
  ParametresService,
  PreferencesDistribution,
  ResultatMaj,
} from './parametres-service.js';
export type {
  CoffreService,
  ResultatAccuse,
  ResultatSignature,
} from './coffre-service.js';
export type {
  NotificationsService,
  Notification,
  TypeNotification,
} from './notifications-service.js';
export type {
  ActivationService,
  DonneesActivation,
  ResultatActivation,
  ResultatVerificationEmail,
} from './activation-service.js';
export type { CabinetsService } from './cabinets-service.js';
export type { AdminService } from './admin-service.js';
export type { AuthService } from './auth-service.js';

// ─── Factories mock (à substituer par l'API réelle en Phase 2) ────────────
export { creerSalariesServiceMock } from './_mocks/salaries-mock.js';
export { creerBulletinsServiceMock } from './_mocks/bulletins-mock.js';
export { creerReconciliationServiceMock } from './_mocks/reconciliation-mock.js';
export { creerReclamationsServiceMock } from './_mocks/reclamations-mock.js';
export { creerFacturationServiceMock } from './_mocks/facturation-mock.js';
export { creerSecuriteServiceMock } from './_mocks/securite-mock.js';
export { creerParametresServiceMock } from './_mocks/parametres-mock.js';
export { creerCoffreServiceMock } from './_mocks/coffre-mock.js';
export { creerNotificationsServiceMock } from './_mocks/notifications-mock.js';
export { creerActivationServiceMock } from './_mocks/activation-mock.js';
export { creerCabinetsServiceMock } from './_mocks/cabinets-mock.js';
export { creerAdminServiceMock } from './_mocks/admin-mock.js';
export { creerAuthServiceMock } from './_mocks/auth-mock.js';
