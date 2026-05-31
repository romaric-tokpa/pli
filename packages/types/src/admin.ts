// Types console opérateur — agrégats plateforme (au-dessus des tenants).
//
// Toutes ces structures sont LÉGITIMEMENT autorisées à exposer des montants
// FCFA (MRR, ARR, impayés) puisqu'elles agrègent du REVENU plateforme, pas
// du salaire individuel. L'invariant 1 CLAUDE.md (« net jamais en liste »)
// s'applique au SALAIRE NET d'un employé — la masse facturable côté Pli
// n'est pas concernée. Exception documentée comme `Facture` côté cabinet.

import type { DateJJMMAAAA, IdEntite, MontantFCFA } from './commun.js';

/** Vue agrégée plateforme — KPIs de tête. */
export interface MetriquesPlateforme {
  /** Nombre d'entreprises actives (hors essai/suspendue/impayée). */
  entreprisesActives: number;
  /** Effectif cumulé (sommes des effectifs des entreprises actives). */
  salariesCumules: number;
  /** Bulletins distribués sur le mois courant. */
  bulletinsMois: number;
  /** Monthly Recurring Revenue total — somme des MRR par entreprise. */
  mrrTotal: MontantFCFA;
  /** ARR projeté = MRR × 12. */
  arrProjete: MontantFCFA;
  /** Taux de consultation moyen (0..1). */
  tauxConsultationMoyen: number;
}

/**
 * Métriques d'opération d'une entreprise vue depuis la console. Inclut
 * MRR (revenu Pli) et compteurs — JAMAIS de net salarial.
 */
export interface MetriquesEntreprisePlateforme {
  entrepriseId: IdEntite;
  /** Plan tarifaire en cours (`mensuel` ou `annuel`). */
  planId: 'mensuel' | 'annuel';
  salaries: number;
  bulletinsMois: number;
  /** Revenu mensuel Pli généré par cette entreprise. */
  mrr: MontantFCFA;
  /** Taux de consultation des bulletins distribués (0..1). */
  consultation: number;
  dateInscription: DateJJMMAAAA;
  derniereActivite: string;
}

/** Métriques d'opération d'un cabinet partenaire vues depuis la console. */
export interface MetriquesCabinetPlateforme {
  cabinetId: IdEntite;
  /** Effectif cumulé du portefeuille du cabinet. */
  salariesCumules: number;
  /** Nombre d'entreprises gérées. */
  entreprisesGerees: number;
  /** Revenu mensuel Pli généré par le portefeuille (modèle MRR). */
  mrr: MontantFCFA;
  /** Commission du cabinet en pourcentage (par_entreprise) ou remise (consolide). */
  pctNegocie: number;
}

/** Évènement dans le flux d'activité plateforme. */
export interface EvenementActivite {
  id: IdEntite;
  type:
    | 'inscription'
    | 'plan'
    | 'paiement'
    | 'ticket'
    | 'module'
    | 'suspension';
  texte: string;
  date: DateJJMMAAAA;
  /** Nom d'icône lucide. */
  icon: string;
}

/** Facture impayée — entrée du tableau « Impayés à traiter ». */
export interface Impaye {
  id: IdEntite;
  entrepriseId: IdEntite;
  numeroFacture: string;
  periode: string;
  montant: MontantFCFA;
  jourRetard: number;
  raison: string;
}

/** Évolution mensuelle MRR (douze mois). */
export interface PointMrrMensuel {
  /** Libellé court de mois (« Fév. »). */
  mois: string;
  mrr: MontantFCFA;
}

/** Source de revenu — utilisée par /admin/revenus et le pie de la vue d'ensemble. */
export interface SourceRevenu {
  source: string;
  montant: MontantFCFA;
  /** Couleur hex pour le rendu du pie (charte). */
  couleur: string;
}

/** Type d'action sensible journalisée dans /admin/audit. */
export type TypeAuditAdmin =
  | 'impersonation'
  | 'suspension'
  | 'plan'
  | 'module'
  | 'donnees'
  | 'connexion'
  | 'communication'
  | 'support';

/**
 * Entrée du journal d'audit de la console opérateur — append-only et en
 * lecture seule depuis l'UI. En Phase 1, chaque entrée sera CHAÎNÉE par hash
 * (CLAUDE.md « audit append-only chaîné par hash »), le mock ne fait que la
 * conserver dans l'ordre d'ajout.
 */
export interface EntreeAuditAdmin {
  id: IdEntite;
  date: DateJJMMAAAA;
  acteur: string;
  cible: string;
  action: string;
  /** Adresse IP de l'opérateur au moment de l'action. */
  ip: string;
  type: TypeAuditAdmin;
}

/** Filtres optionnels pour la consultation du journal admin. */
export interface FiltreAuditAdmin {
  /** Recherche partielle sur acteur / cible / action. */
  recherche?: string;
  type?: TypeAuditAdmin;
}

/** État de santé d'un service de la plateforme. */
export interface ServiceSante {
  id: IdEntite;
  nom: string;
  statut: 'operationnel' | 'degrade' | 'indisponible';
  /** Uptime en pourcentage (0..100). */
  uptime: number;
  /** Latence P95 affichable (ex. « 182 ms »). */
  p95: string;
  /** Nom d'icône lucide. */
  icon: string;
}

/** Incident historique ou en cours. */
export interface Incident {
  id: IdEntite;
  date: DateJJMMAAAA;
  duree: string;
  titre: string;
  severite: 'critique' | 'majeur' | 'mineur';
  resolu: boolean;
  service: string;
}

/** Point de volumétrie quotidienne (bulletins distribués + signatures réalisées). */
export interface PointVolumetrie {
  jour: string;
  bulletins: number;
  signatures: number;
}

/**
 * Synthèse « coffres dormants » — ex-salariés en lecture seule, sans revenu
 * Pli associé. Coût VISIBLE de la garantie « conservation tant que le compte
 * est actif » (CLAUDE.md). Ce n'est pas un net salarial — c'est un agrégat
 * de stockage.
 */
export interface CoffresDormants {
  /** Nombre de coffres en lecture seule. */
  coffresDormants: number;
  /** Part du stockage total occupée par ces coffres (0..1). */
  partStockage: number;
  /** Revenu Pli généré par ces coffres (toujours 0 — c'est le point). */
  revenuAssocie: MontantFCFA;
}

// ─── Utilisateurs plateforme (Super Admins + Admins RH) ─────────────────────

export type RoleUtilisateurPlateforme =
  | 'Super Admin'
  | 'Support N2'
  | 'Admin RH'
  | 'Gestionnaire'
  | 'DAF';

export interface UtilisateurPlateforme {
  id: IdEntite;
  nom: string;
  email: string;
  role: RoleUtilisateurPlateforme;
  /** null si compte plateforme (super admin / support), sinon tenant de l'utilisateur. */
  entrepriseId: IdEntite | null;
  statut: 'actif' | 'suspendu';
  derniereConnexion: DateJJMMAAAA;
  a2f: boolean;
}

// ─── Support — tickets escaladés ────────────────────────────────────────────

export type PrioriteTicket = 'critique' | 'haute' | 'normale' | 'basse';
export type StatutTicket = 'en_cours' | 'resolue';
export type CanalTicket = 'Email' | 'Console' | 'Téléphone';

export interface MessageTicket {
  auteur: 'client' | 'support';
  nom: string;
  date: DateJJMMAAAA;
  texte: string;
}

export interface TicketSupport {
  id: IdEntite;
  numero: string;
  entrepriseId: IdEntite;
  priorite: PrioriteTicket;
  statut: StatutTicket;
  sujet: string;
  canal: CanalTicket;
  ouvertLe: DateJJMMAAAA;
  contact: string;
  role: string;
  messages: MessageTicket[];
}

// ─── Conformité — hébergement, certificat, rétention, RGPD ──────────────────

export interface Hebergement {
  fournisseur: string;
  ville: string;
  certification: string;
  dateConvention: DateJJMMAAAA;
  statut: string;
}

export interface CertificatSignature {
  fournisseur: string;
  serie: string;
  delivreLe: DateJJMMAAAA;
  expireLe: DateJJMMAAAA;
  statut: string;
  joursAvantExpiration: number;
}

export interface PolitiqueRetention {
  bulletins: string;
  audit: string;
  sessions: string;
}

export type StatutDemandeRgpd = 'traitee' | 'en_cours';
export type TypeDemandeRgpd = 'Accès' | 'Suppression' | 'Portabilité';

export interface DemandeRgpd {
  id: IdEntite;
  type: TypeDemandeRgpd;
  demandeur: string;
  entreprise: string;
  date: DateJJMMAAAA;
  statut: StatutDemandeRgpd;
}

export interface Conformite {
  hebergement: Hebergement;
  certificatSignature: CertificatSignature;
  retention: PolitiqueRetention;
  demandesRgpd: DemandeRgpd[];
}

// ─── Communications — annonces + modèles e-mail ─────────────────────────────

export type StatutAnnonce = 'publiee' | 'programmee';

export interface AnnoncePlateforme {
  id: IdEntite;
  titre: string;
  segment: string;
  canal: string;
  statut: StatutAnnonce;
  publiee: string;
}

export interface ModeleEmail {
  id: IdEntite;
  nom: string;
  envois: number;
  derniereModif: DateJJMMAAAA;
}

// ─── Paramètres plateforme (admin) ──────────────────────────────────────────

export interface DomainePlateforme {
  domaine: string;
  role: string;
  statut: 'actif' | 'inactif';
}

export interface IntegrationPlateforme {
  id: IdEntite;
  nom: string;
  description: string;
  actif: boolean;
  icone: string;
}

export interface CleApi {
  environnement: 'Production' | 'Sandbox';
  cle: string;
}

export interface WebhookPlateforme {
  evenement: string;
  url: string;
}

export interface ParametresPlateforme {
  brandingNom: string;
  couleurPrimaire: string;
  couleurAccent: string;
  policeDefault: string;
  domaines: DomainePlateforme[];
  integrations: IntegrationPlateforme[];
  clesApi: CleApi[];
  webhooks: WebhookPlateforme[];
}
