// Mocks console opérateur — agrège les entreprises de toutes les surfaces
// (tenants Pli Pro directs + entreprises clientes des cabinets). L'admin est
// la SEULE surface où cette agrégation est légitime, par construction.

import type {
  AnnoncePlateforme,
  CoffresDormants,
  Conformite,
  Entreprise,
  EntreeAuditAdmin,
  EvenementActivite,
  Impaye,
  Incident,
  MetriquesCabinetPlateforme,
  MetriquesEntreprisePlateforme,
  ModeleEmail,
  ParametresPlateforme,
  PointMrrMensuel,
  PointVolumetrie,
  ServiceSante,
  SourceRevenu,
  TicketSupport,
  UtilisateurPlateforme,
} from '@pli/types';
import { ENTREPRISES_TENANT } from './data-entreprises.js';
import { ENTREPRISES_CABINETS } from './data-portefeuille-cabinet.js';

/**
 * Toutes les entreprises de la plateforme — union des tenants Pli Pro
 * directs et des entreprises clientes des cabinets. C'est la seule vue
 * cross-tenant légitime de la base.
 */
export const ENTREPRISES_PLATEFORME: Entreprise[] = [
  ...Object.values(ENTREPRISES_TENANT),
  ...ENTREPRISES_CABINETS,
];

/**
 * Métriques par entreprise — porté verbatim des valeurs cohérentes avec
 * data-cabinets.jsx (wireframe) pour les 9 entreprises clientes + valeurs
 * propres pour atlantique/comoe.
 *
 * Format MRR : nombre de salariés × tarif effectif (mensuel 275 ou annuel 234).
 */
export const METRIQUES_ENTREPRISES_PLATEFORME: MetriquesEntreprisePlateforme[] = [
  // Tenants Pli Pro directs
  {
    entrepriseId: 'atlantique',
    planId: 'mensuel',
    salaries: 24,
    bulletinsMois: 22,
    mrr: 6600, // 24 × 275
    consultation: 0.86,
    dateInscription: '12/01/2024',
    derniereActivite: 'il y a 12 min',
  },
  {
    entrepriseId: 'comoe',
    planId: 'annuel',
    salaries: 287,
    bulletinsMois: 285,
    mrr: 67158, // 287 × 234
    consultation: 0.91,
    dateInscription: '04/04/2024',
    derniereActivite: 'il y a 1 h',
  },
  // Portefeuille Cabinet Comptable Ébrié
  {
    entrepriseId: 'ec-cacao',
    planId: 'mensuel',
    salaries: 48,
    bulletinsMois: 47,
    mrr: 13200,
    consultation: 0.79,
    dateInscription: '10/03/2024',
    derniereActivite: 'il y a 2 h',
  },
  {
    entrepriseId: 'ec-ivoire-log',
    planId: 'mensuel',
    salaries: 108,
    bulletinsMois: 108,
    mrr: 29700,
    consultation: 0.84,
    dateInscription: '22/06/2024',
    derniereActivite: 'il y a 4 h',
  },
  {
    entrepriseId: 'ec-lagune',
    planId: 'mensuel',
    salaries: 18,
    bulletinsMois: 18,
    mrr: 0, // essai gratuit
    consultation: 0.72,
    dateInscription: '12/02/2026',
    derniereActivite: 'hier à 18:24',
  },
  {
    entrepriseId: 'ec-sahel',
    planId: 'mensuel',
    salaries: 22,
    bulletinsMois: 22,
    mrr: 6050,
    consultation: 0.68,
    dateInscription: '29/07/2024',
    derniereActivite: 'il y a 1 j',
  },
  {
    entrepriseId: 'ec-ebrie-dist',
    planId: 'mensuel',
    salaries: 40,
    bulletinsMois: 40,
    mrr: 11000,
    consultation: 0.82,
    dateInscription: '14/10/2024',
    derniereActivite: 'il y a 6 h',
  },
  // Portefeuille Lagune Intérim
  {
    entrepriseId: 'ec-bouake-ph',
    planId: 'mensuel',
    salaries: 32,
    bulletinsMois: 30,
    mrr: 8800,
    consultation: 0.77,
    dateInscription: '21/11/2024',
    derniereActivite: 'hier',
  },
  {
    entrepriseId: 'ec-abidjan-tech',
    planId: 'mensuel',
    salaries: 36,
    bulletinsMois: 35,
    mrr: 9900,
    consultation: 0.94,
    dateInscription: '18/09/2024',
    derniereActivite: 'il y a 30 min',
  },
  {
    entrepriseId: 'ec-baobab-mf',
    planId: 'mensuel',
    salaries: 58,
    bulletinsMois: 56,
    mrr: 15950,
    consultation: 0.88,
    dateInscription: '07/05/2024',
    derniereActivite: 'il y a 3 h',
  },
  {
    entrepriseId: 'ec-comoe-ind',
    planId: 'annuel',
    salaries: 285,
    bulletinsMois: 285,
    mrr: 66690, // 285 × 234
    consultation: 0.91,
    dateInscription: '11/02/2019',
    derniereActivite: 'il y a 1 h',
  },
];

/** Métriques agrégées par cabinet (calculées depuis les portefeuilles). */
export const METRIQUES_CABINETS_PLATEFORME: MetriquesCabinetPlateforme[] = [
  {
    cabinetId: 'cab-ebrie',
    salariesCumules: 236, // 48+108+18+22+40
    entreprisesGerees: 5,
    mrr: 59950, // somme des MRR cabinet-ebrie
    pctNegocie: 10,
  },
  {
    cabinetId: 'cab-lagune-i',
    salariesCumules: 411, // 32+36+58+285
    entreprisesGerees: 4,
    mrr: 101340, // somme des MRR cabinet-lagune-i
    pctNegocie: 15,
  },
];

/** Évolution MRR 12 mois — porté verbatim de _wireframe/src/admin-data.jsx. */
export const EVOLUTION_MRR_12M: PointMrrMensuel[] = [
  { mois: 'Mar.', mrr: 1_420_000 },
  { mois: 'Avr.', mrr: 1_485_000 },
  { mois: 'Mai', mrr: 1_530_000 },
  { mois: 'Juin', mrr: 1_580_000 },
  { mois: 'Juil.', mrr: 1_610_000 },
  { mois: 'Août', mrr: 1_645_000 },
  { mois: 'Sep.', mrr: 1_695_000 },
  { mois: 'Oct.', mrr: 1_742_000 },
  { mois: 'Nov.', mrr: 1_790_000 },
  { mois: 'Déc.', mrr: 1_825_000 },
  { mois: 'Jan.', mrr: 1_855_000 },
  { mois: 'Fév.', mrr: 1_870_000 },
];

export const REVENU_PAR_SOURCE: SourceRevenu[] = [
  { source: 'Per-bulletin', montant: 1_057_500, couleur: '#15294E' },
  { source: 'Signature', montant: 285_000, couleur: '#B85737' },
  { source: 'Abonnement', montant: 400_950, couleur: '#2C6FB3' },
  { source: 'Preuve & conformité', montant: 87_750, couleur: '#2F8F5B' },
  { source: 'Premium / Rapports', montant: 38_800, couleur: '#D9A227' },
];

export const ACTIVITE_PLATEFORME: EvenementActivite[] = [
  {
    id: 'ap1',
    type: 'inscription',
    texte: 'Nouvelle entreprise : Lagune Services (essai)',
    date: '12/02/2026 09:12',
    icon: 'Building2',
  },
  {
    id: 'ap2',
    type: 'plan',
    texte: 'Comoé Industries a basculé vers le plan annuel',
    date: '10/02/2026 14:48',
    icon: 'ArrowUpRight',
  },
  {
    id: 'ap3',
    type: 'paiement',
    texte: 'Paiement reçu — Comoé Industries · 67 158 FCFA',
    date: '08/02/2026 11:02',
    icon: 'Receipt',
  },
  {
    id: 'ap4',
    type: 'ticket',
    texte: 'Ticket critique ouvert par Sahel Négoce',
    date: '07/02/2026 16:30',
    icon: 'TriangleAlert',
  },
  {
    id: 'ap5',
    type: 'plan',
    texte: 'Abidjan Tech a renouvelé son abonnement',
    date: '05/02/2026 10:14',
    icon: 'ToggleRight',
  },
  {
    id: 'ap6',
    type: 'suspension',
    texte: 'Sahel Négoce — facture en retard (>30 j)',
    date: '01/02/2026 08:00',
    icon: 'Power',
  },
];

// ─── Santé système ─────────────────────────────────────────────────────────

export const SERVICES_SANTE: ServiceSante[] = [
  { id: 's_dist', nom: 'Distribution des bulletins', statut: 'operationnel', uptime: 99.97, p95: '182 ms', icon: 'Send' },
  { id: 's_app', nom: 'Appairage automatique', statut: 'operationnel', uptime: 99.92, p95: '245 ms', icon: 'FileCheck2' },
  { id: 's_notif', nom: 'Notifications (push & email)', statut: 'degrade', uptime: 98.41, p95: '1.2 s', icon: 'BellRing' },
  { id: 's_stockage', nom: 'Stockage des bulletins', statut: 'operationnel', uptime: 99.99, p95: '84 ms', icon: 'Database' },
  { id: 's_sign', nom: 'Signature électronique', statut: 'operationnel', uptime: 99.95, p95: '412 ms', icon: 'PenLine' },
  { id: 's_api', nom: 'API publique', statut: 'operationnel', uptime: 99.89, p95: '156 ms', icon: 'Code' },
];

export const INCIDENTS_HISTORIQUE: Incident[] = [
  { id: 'i1', date: '27/02/2026', duree: '1 h 04 min', titre: 'Latence élevée sur l\'appairage automatique', severite: 'majeur', resolu: true, service: 'Appairage' },
  { id: 'i2', date: '18/02/2026', duree: '22 min', titre: 'Erreurs intermittentes sur les notifications push', severite: 'mineur', resolu: true, service: 'Notifications' },
  { id: 'i3', date: '11/02/2026', duree: '—', titre: 'Dégradation des notifications email (en cours)', severite: 'mineur', resolu: false, service: 'Notifications' },
  { id: 'i4', date: '02/02/2026', duree: '47 min', titre: 'Indisponibilité du service de signature', severite: 'critique', resolu: true, service: 'Signature' },
];

export const VOLUMETRIE_30J: PointVolumetrie[] = [
  { jour: 'J-29', bulletins: 412, signatures: 156 }, { jour: 'J-28', bulletins: 380, signatures: 142 },
  { jour: 'J-27', bulletins: 89, signatures: 32 }, { jour: 'J-26', bulletins: 62, signatures: 28 },
  { jour: 'J-25', bulletins: 425, signatures: 168 }, { jour: 'J-24', bulletins: 398, signatures: 152 },
  { jour: 'J-23', bulletins: 451, signatures: 174 }, { jour: 'J-22', bulletins: 423, signatures: 162 },
  { jour: 'J-21', bulletins: 405, signatures: 158 }, { jour: 'J-20', bulletins: 387, signatures: 148 },
  { jour: 'J-19', bulletins: 76, signatures: 31 }, { jour: 'J-18', bulletins: 58, signatures: 24 },
  { jour: 'J-17', bulletins: 442, signatures: 172 }, { jour: 'J-16', bulletins: 414, signatures: 161 },
  { jour: 'J-15', bulletins: 446, signatures: 178 }, { jour: 'J-14', bulletins: 421, signatures: 164 },
  { jour: 'J-13', bulletins: 437, signatures: 168 }, { jour: 'J-12', bulletins: 396, signatures: 154 },
  { jour: 'J-11', bulletins: 81, signatures: 35 }, { jour: 'J-10', bulletins: 67, signatures: 26 },
  { jour: 'J-9', bulletins: 458, signatures: 182 }, { jour: 'J-8', bulletins: 432, signatures: 168 },
  { jour: 'J-7', bulletins: 471, signatures: 188 }, { jour: 'J-6', bulletins: 449, signatures: 176 },
  { jour: 'J-5', bulletins: 463, signatures: 184 }, { jour: 'J-4', bulletins: 418, signatures: 162 },
  { jour: 'J-3', bulletins: 92, signatures: 38 }, { jour: 'J-2', bulletins: 71, signatures: 29 },
  { jour: 'J-1', bulletins: 485, signatures: 192 }, { jour: 'Auj.', bulletins: 218, signatures: 84 },
];

export const COFFRES_DORMANTS_DEMO: CoffresDormants = {
  coffresDormants: 3280,
  partStockage: 0.22,
  revenuAssocie: 0,
};

// ─── Journal d'audit — seed initial (porté de _wireframe/src/admin-data.jsx)
// L'admin-mock garde ces entrées + en ajoute à chaque action sensible.
export const AUDIT_ADMIN_SEED: EntreeAuditAdmin[] = [
  { id: 'la-seed-1', date: '27/02/2026 13:42', acteur: 'Aïcha Bamba', cible: 'Module Premium salarié', action: 'Activation globale d\'un module', ip: '196.207.62.42', type: 'module' },
  { id: 'la-seed-2', date: '27/02/2026 10:14', acteur: 'Karim Touré', cible: 'INC-2026-104', action: 'Réponse au ticket support', ip: '196.207.62.31', type: 'support' },
  { id: 'la-seed-3', date: '27/02/2026 09:32', acteur: 'Aïcha Bamba', cible: 'Console opérateur', action: 'Connexion (2FA validée)', ip: '196.207.62.42', type: 'connexion' },
  { id: 'la-seed-4', date: '26/02/2026 18:14', acteur: 'Drissa Diomandé', cible: 'Plan mensuel', action: 'Modification du tarif (275 → 275 FCFA / mois)', ip: '196.207.62.18', type: 'plan' },
  { id: 'la-seed-5', date: '26/02/2026 16:48', acteur: 'Drissa Diomandé', cible: 'Comoé Industries', action: 'Changement de plan (Mensuel → Annuel)', ip: '196.207.62.18', type: 'plan' },
  { id: 'la-seed-6', date: '25/02/2026 11:20', acteur: 'Aïcha Bamba', cible: 'Bannière incident', action: 'Publication d\'une bannière plateforme', ip: '196.207.62.42', type: 'communication' },
  { id: 'la-seed-7', date: '01/02/2026 08:00', acteur: 'Drissa Diomandé', cible: 'Sahel Négoce', action: 'Suspension de l\'entreprise (impayé > 30 j)', ip: '196.207.62.18', type: 'suspension' },
];

export const IMPAYES: Impaye[] = [
  {
    id: 'imp1',
    entrepriseId: 'ec-sahel',
    numeroFacture: 'FAC-2026-008-002',
    periode: 'Février 2026',
    montant: 6050,
    jourRetard: 14,
    raison: 'Prélèvement échoué',
  },
  {
    id: 'imp2',
    entrepriseId: 'ec-sahel',
    numeroFacture: 'FAC-2026-008-001',
    periode: 'Janvier 2026',
    montant: 6050,
    jourRetard: 42,
    raison: 'Aucun paiement reçu',
  },
];

// ─── Utilisateurs plateforme — porté de admin-data.jsx (12 entrées) ────────

export const UTILISATEURS_PLATEFORME: UtilisateurPlateforme[] = [
  { id: 'u1', nom: 'Drissa Diomandé', email: 'drissa@pli.ci', role: 'Super Admin', entrepriseId: null, statut: 'actif', derniereConnexion: '27/02/2026 14:08', a2f: true },
  { id: 'u2', nom: 'Aïcha Bamba', email: 'aicha@pli.ci', role: 'Super Admin', entrepriseId: null, statut: 'actif', derniereConnexion: '27/02/2026 09:32', a2f: true },
  { id: 'u3', nom: 'Karim Touré', email: 'karim@pli.ci', role: 'Support N2', entrepriseId: null, statut: 'actif', derniereConnexion: '26/02/2026 17:48', a2f: true },
  { id: 'u4', nom: 'Sylvie Aké', email: 'sylvie.ake@atlantique.ci', role: 'Admin RH', entrepriseId: 'atlantique', statut: 'actif', derniereConnexion: '27/02/2026 11:14', a2f: true },
  { id: 'u5', nom: 'Fatou Diallo', email: 'fatou.diallo@atlantique.ci', role: 'Gestionnaire', entrepriseId: 'atlantique', statut: 'actif', derniereConnexion: '26/02/2026 16:48', a2f: false },
  { id: 'u6', nom: 'Yannick Soro', email: 'y.soro@sahel-negoce.ci', role: 'Admin RH', entrepriseId: 'ec-sahel', statut: 'actif', derniereConnexion: '27/02/2026 09:48', a2f: false },
  { id: 'u7', nom: 'Bernadette Aké', email: 'b.ake@ivoire-logistique.ci', role: 'Admin RH', entrepriseId: 'ec-ivoire-log', statut: 'actif', derniereConnexion: '26/02/2026 14:30', a2f: true },
  { id: 'u8', nom: 'Yvan Toh', email: 'y.toh@abidjantech.ci', role: 'Admin RH', entrepriseId: 'ec-abidjan-tech', statut: 'actif', derniereConnexion: '25/02/2026 11:05', a2f: true },
  { id: 'u9', nom: "Patrice N'Doli", email: 'p.ndoli@sanpedromar.ci', role: 'Admin RH', entrepriseId: 'ec-baobab-mf', statut: 'suspendu', derniereConnexion: '14/02/2026 08:15', a2f: false },
  { id: 'u10', nom: 'Henri Béhi', email: 'h.behi@sucrivoire.ci', role: 'DAF', entrepriseId: 'ec-cacao', statut: 'actif', derniereConnexion: '26/02/2026 09:14', a2f: true },
  { id: 'u11', nom: 'Naomi Kouakou', email: 'n.kouakou@comoeind.ci', role: 'Admin RH', entrepriseId: 'comoe', statut: 'actif', derniereConnexion: '27/02/2026 08:22', a2f: true },
  { id: 'u12', nom: 'Olivier Méï', email: 'o.mei@ec-bouake-ph.ci', role: 'Admin RH', entrepriseId: 'ec-bouake-ph', statut: 'actif', derniereConnexion: '27/02/2026 13:48', a2f: true },
];

// ─── Tickets support escaladés (porté de admin-data.jsx) ────────────────────

export const TICKETS_SUPPORT: TicketSupport[] = [
  {
    id: 't1',
    numero: 'INC-2026-104',
    entrepriseId: 'ec-sahel',
    priorite: 'critique',
    statut: 'en_cours',
    sujet: 'Impossible de distribuer les bulletins de février',
    canal: 'Email',
    ouvertLe: '27/02/2026 09:48',
    contact: 'Yannick Soro',
    role: 'Admin RH',
    messages: [
      { auteur: 'client', nom: 'Yannick Soro', date: '27/02/2026 09:48', texte: "Bonjour, l'upload échoue avec une erreur 500 sur tous les fichiers. Aucun bulletin n'est distribué." },
      { auteur: 'support', nom: 'Pli Support', date: '27/02/2026 10:14', texte: "Bonjour Yannick, nous investiguons. L'incident est lié au service d'appairage. ETA : 30 min." },
      { auteur: 'support', nom: 'Pli Support', date: '27/02/2026 10:52', texte: 'Service rétabli. Pouvez-vous relancer l\'upload depuis votre côté ?' },
    ],
  },
  {
    id: 't2',
    numero: 'INC-2026-103',
    entrepriseId: 'ec-ivoire-log',
    priorite: 'haute',
    statut: 'en_cours',
    sujet: 'Intégration SIRH — connecteur Sage en erreur',
    canal: 'Console',
    ouvertLe: '25/02/2026 14:30',
    contact: 'Bernadette Aké',
    role: 'Admin RH',
    messages: [
      { auteur: 'client', nom: 'Bernadette Aké', date: '25/02/2026 14:30', texte: "Le connecteur Sage retourne 'invalid_token' depuis lundi. Pouvez-vous régénérer les clés API ?" },
    ],
  },
  {
    id: 't3',
    numero: 'INC-2026-099',
    entrepriseId: 'ec-abidjan-tech',
    priorite: 'normale',
    statut: 'en_cours',
    sujet: 'Question sur le module Premium salarié',
    canal: 'Email',
    ouvertLe: '23/02/2026 11:05',
    contact: 'Yvan Toh',
    role: 'Admin RH',
    messages: [
      { auteur: 'client', nom: 'Yvan Toh', date: '23/02/2026 11:05', texte: "Bonjour, est-ce que l'export d'audit fonctionne pour les anciens employés ?" },
    ],
  },
  {
    id: 't4',
    numero: 'INC-2026-091',
    entrepriseId: 'ec-cacao',
    priorite: 'basse',
    statut: 'resolue',
    sujet: "Demande d'export d'audit pour le commissaire aux comptes",
    canal: 'Email',
    ouvertLe: '18/02/2026 09:00',
    contact: 'Henri Béhi',
    role: 'DAF',
    messages: [
      { auteur: 'client', nom: 'Henri Béhi', date: '18/02/2026 09:00', texte: 'Notre commissaire demande un export d\'audit sur le trimestre dernier. Comment procéder ?' },
      { auteur: 'support', nom: 'Pli Support', date: '18/02/2026 11:32', texte: "Bonjour Henri, l'export est disponible depuis Sécurité > Journal d'audit. Documentation jointe." },
      { auteur: 'client', nom: 'Henri Béhi', date: '19/02/2026 09:14', texte: 'Parfait, merci !' },
    ],
  },
  {
    id: 't5',
    numero: 'INC-2026-088',
    entrepriseId: 'ec-baobab-mf',
    priorite: 'haute',
    statut: 'en_cours',
    sujet: 'Demande de réactivation après régularisation',
    canal: 'Téléphone',
    ouvertLe: '16/02/2026 15:20',
    contact: "Patrice N'Doli",
    role: 'DG',
    messages: [
      { auteur: 'client', nom: "Patrice N'Doli", date: '16/02/2026 15:20', texte: 'Nous avons régularisé les deux impayés. Pouvez-vous réactiver notre compte ?' },
      { auteur: 'support', nom: 'Pli Support', date: '17/02/2026 09:30', texte: 'Bonjour Patrice, nous vérifions le paiement avec la comptabilité.' },
    ],
  },
];

// ─── Conformité (CLAUDE.md — libellés sensibles verrouillés) ────────────────
//
// IMPORTANT — libellés juridiques :
//   ✓ « validation horodatée »      (signature électronique en Phase 0)
//   ✓ « Conformité ARTCI »            (hébergeur Côte d'Ivoire)
//   ✗ « valeur probante »             (interdit Phase 0)
//   ✗ « signature avancée »            (réservé Phase 1, partenaire signataire)
//
// Vérifié par `admin-conformite-libelles.test.tsx`.

export const CONFORMITE_DEMO: Conformite = {
  hebergement: {
    fournisseur: 'ARTCI — Datacenter Abidjan',
    ville: "Abidjan, Côte d'Ivoire",
    certification: 'Tier III + ISO 27001',
    dateConvention: '15/03/2024',
    statut: 'Conforme',
  },
  certificatSignature: {
    fournisseur: 'OneCI (Côte d\'Ivoire)',
    serie: 'PLI-CERT-2025-A4F8',
    delivreLe: '01/06/2025',
    expireLe: '01/06/2026',
    statut: 'Valide',
    joursAvantExpiration: 94,
  },
  retention: {
    bulletins: 'tant que le compte est actif',
    audit: '5 ans',
    sessions: '90 jours',
  },
  demandesRgpd: [
    { id: 'd1', type: 'Accès', demandeur: 'Aya Koffi', entreprise: 'Groupe Atlantique CI', date: '20/02/2026', statut: 'traitee' },
    { id: 'd2', type: 'Suppression', demandeur: 'Sékou Doumbia', entreprise: 'Groupe Atlantique CI', date: '15/02/2026', statut: 'en_cours' },
    { id: 'd3', type: 'Portabilité', demandeur: 'Mariam Touré', entreprise: 'Groupe Atlantique CI', date: '08/02/2026', statut: 'traitee' },
  ],
};

// ─── Communications ────────────────────────────────────────────────────────

export const ANNONCES_PLATEFORME: AnnoncePlateforme[] = [
  { id: 'an1', titre: 'Maintenance planifiée — 02/03/2026 22h–23h', segment: 'Toutes les entreprises', canal: 'Bannière + e-mail', statut: 'programmee', publiee: 'Programmée pour le 28/02/2026 09:00' },
  { id: 'an2', titre: 'Nouveau module Preuve & conformité disponible', segment: 'Plan Annuel', canal: 'E-mail', statut: 'publiee', publiee: 'Publiée le 15/02/2026' },
  { id: 'an3', titre: 'Mise à jour des CGU au 01/03/2026', segment: 'Toutes les entreprises', canal: 'E-mail', statut: 'publiee', publiee: 'Publiée le 12/02/2026' },
];

export const MODELES_EMAIL: ModeleEmail[] = [
  { id: 'm1', nom: 'Activation de compte (salarié)', envois: 24, derniereModif: '08/02/2026' },
  { id: 'm2', nom: 'Nouveau bulletin disponible', envois: 3050, derniereModif: '28/01/2026' },
  { id: 'm3', nom: 'Rappel de signature', envois: 412, derniereModif: '15/01/2026' },
  { id: 'm4', nom: 'Réclamation — réponse RH', envois: 87, derniereModif: '10/12/2025' },
  { id: 'm5', nom: 'Facture mensuelle (entreprise cliente)', envois: 14, derniereModif: '01/02/2026' },
];

// ─── Paramètres plateforme ─────────────────────────────────────────────────

export const PARAMETRES_PLATEFORME_DEMO: ParametresPlateforme = {
  brandingNom: 'Pli — le coffre-fort de paie',
  couleurPrimaire: '#15294E',
  couleurAccent: '#B85737',
  policeDefault: 'Inter',
  domaines: [
    { domaine: 'pli.ci', role: 'Console opérateur', statut: 'actif' },
    { domaine: 'app.pli.ci', role: 'Application salarié', statut: 'actif' },
    { domaine: 'pro.pli.ci', role: 'Back-office RH', statut: 'actif' },
    { domaine: 'api.pli.ci', role: 'API publique', statut: 'actif' },
  ],
  integrations: [
    { id: 'int-wave', nom: 'Wave (Mobile Money)', description: 'Paiement des abonnements entreprises', actif: true, icone: 'Smartphone' },
    { id: 'int-orange', nom: 'Orange Money', description: 'Paiement secondaire pour les TPE', actif: true, icone: 'Smartphone' },
    { id: 'int-sage', nom: 'Sage Paie', description: 'Connecteur SIRH pour l\'export paie', actif: true, icone: 'Building2' },
    { id: 'int-paydc', nom: 'PayDC', description: 'Connecteur SIRH ouest-africain', actif: false, icone: 'Building2' },
    { id: 'int-sendgrid', nom: 'SendGrid', description: 'Envoi des e-mails transactionnels', actif: true, icone: 'Mail' },
    { id: 'int-slack', nom: 'Slack', description: 'Alertes incidents critiques', actif: true, icone: 'Bell' },
  ],
  clesApi: [
    { environnement: 'Production', cle: 'pli_pk_live_••••8a2f' },
    { environnement: 'Sandbox', cle: 'pli_pk_test_••••3e91' },
  ],
  webhooks: [
    { evenement: 'bulletin.distribue', url: 'https://hooks.pli.ci/sync' },
    { evenement: 'paiement.recu', url: 'https://hooks.pli.ci/billing' },
    { evenement: 'entreprise.suspendue', url: 'https://hooks.pli.ci/lifecycle' },
  ],
};
