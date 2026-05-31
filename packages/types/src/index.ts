// @pli/types — entités métier partagées entre Pli Pro, mobile salarié,
// espace cabinet et console opérateur.
//
// Vocabulaire dérivé directement du wireframe (src/data.jsx, data-comptes.jsx,
// data-cabinets.jsx, admin-data.jsx). Toute évolution doit rester sourcée.

export type {
  IdEntite,
  Periode,
  DateJJMMAAAA,
  MontantFCFA,
  Telephone225,
  MatriculeSalarie,
} from './commun.js';

export type {
  StatutRemise,
  StatutConsultation,
  StatutSignature,
  EtatReconciliation,
} from './statuts.js';

export type { ComptePersonnel, Rattachement, StatutRattachement } from './compte.js';

export type { Salarie, StatutSalarie, DateOuTiret } from './salarie.js';

export type { Bulletin, BulletinCoffre } from './bulletin.js';

export type { LigneReconciliation } from './reconciliation.js';

export type {
  Reclamation,
  MessageReclamation,
  StatutReclamation,
  AuteurMessageReclamation,
} from './reclamation.js';

export type { Entreprise, TypeEntreprise, StatutEntreprise, ModeGestion } from './entreprise.js';

export type {
  Cabinet,
  GestionnaireCabinet,
  MetriquesPortefeuilleEntreprise,
  TypeCabinet,
  ModeFacturationCabinet,
  StatutCabinet,
  RoleGestionnaireCabinet,
} from './cabinet.js';

export type {
  Abonnement,
  CycleAbonnement,
  StatutAbonnement,
  CompositionForfait,
} from './abonnement.js';

export type {
  Facture,
  StatutFacture,
  ModePaiement,
  PlanTarifaire,
} from './facturation.js';

export type {
  Session,
  EntreeAudit,
  TypeEntreeAudit,
  ParametresAuthentification,
} from './securite.js';

export type {
  MetriquesPlateforme,
  MetriquesEntreprisePlateforme,
  MetriquesCabinetPlateforme,
  EvenementActivite,
  Impaye,
  PointMrrMensuel,
  SourceRevenu,
  TypeAuditAdmin,
  EntreeAuditAdmin,
  FiltreAuditAdmin,
  ServiceSante,
  Incident,
  PointVolumetrie,
  CoffresDormants,
  RoleUtilisateurPlateforme,
  UtilisateurPlateforme,
  PrioriteTicket,
  StatutTicket,
  CanalTicket,
  MessageTicket,
  TicketSupport,
  Hebergement,
  CertificatSignature,
  PolitiqueRetention,
  StatutDemandeRgpd,
  TypeDemandeRgpd,
  DemandeRgpd,
  Conformite,
  StatutAnnonce,
  AnnoncePlateforme,
  ModeleEmail,
  DomainePlateforme,
  IntegrationPlateforme,
  CleApi,
  WebhookPlateforme,
  ParametresPlateforme,
} from './admin.js';
