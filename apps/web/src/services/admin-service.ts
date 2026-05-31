// Service admin — console opérateur Pli.
//
// Pas de scoping tenant (vue globale plateforme — c'est la SEULE surface où
// l'agrégat cross-tenant est légitime, par construction). Chaque opération
// est JOURNALISÉE dans l'audit append-only (CLAUDE.md invariant 4). L'impl
// mock pose un stub d'audit pour rappeler l'obligation ; le test de contrat
// `suiteContratImpersonationJournalisee` vérifie qu'une impersonation produit
// effectivement une entrée lisible.

import type {
  AnnoncePlateforme,
  Cabinet,
  CoffresDormants,
  Conformite,
  Entreprise,
  EntreeAuditAdmin,
  EvenementActivite,
  FiltreAuditAdmin,
  IdEntite,
  Impaye,
  Incident,
  MetriquesCabinetPlateforme,
  MetriquesEntreprisePlateforme,
  MetriquesPlateforme,
  ModeleEmail,
  ParametresPlateforme,
  PointMrrMensuel,
  PointVolumetrie,
  ServiceSante,
  SourceRevenu,
  TicketSupport,
  UtilisateurPlateforme,
} from '@pli/types';
import type { ContexteAdmin } from './contexte.js';

export interface AdminService {
  // ─── Vue d'ensemble plateforme ──────────────────────────────────────────

  /** KPIs de tête (entreprises actives, salariés, bulletins, MRR, ARR, taux consult.). */
  obtenirMetriquesPlateforme(ctx: ContexteAdmin): Promise<MetriquesPlateforme>;

  /** Évolution mensuelle du MRR (12 derniers mois). */
  obtenirEvolutionMrr(ctx: ContexteAdmin): Promise<PointMrrMensuel[]>;

  /** Ventilation du revenu par source (per-bulletin, signature, abonnement…). */
  obtenirRevenuParSource(ctx: ContexteAdmin): Promise<SourceRevenu[]>;

  /** Activité plateforme — timeline d'évènements récents. */
  listerActivitePlateforme(ctx: ContexteAdmin): Promise<EvenementActivite[]>;

  /** Factures impayées en attente de traitement. */
  listerImpayes(ctx: ContexteAdmin): Promise<Impaye[]>;

  // ─── Entreprises de la plateforme ───────────────────────────────────────

  /** Liste toutes les entreprises (tenants directs + entreprises clientes de cabinets). */
  listerEntreprises(ctx: ContexteAdmin): Promise<Entreprise[]>;

  /** Métriques (MRR, salariés, bulletins, consultation…) par entreprise. */
  listerMetriquesEntreprises(
    ctx: ContexteAdmin,
  ): Promise<MetriquesEntreprisePlateforme[]>;

  // ─── Cabinets partenaires ──────────────────────────────────────────────

  /** Liste tous les cabinets partenaires. */
  listerCabinets(ctx: ContexteAdmin): Promise<Cabinet[]>;

  /** Métriques (MRR, effectif portefeuille, entreprises gérées…) par cabinet. */
  listerMetriquesCabinets(
    ctx: ContexteAdmin,
  ): Promise<MetriquesCabinetPlateforme[]>;

  // ─── Santé système ──────────────────────────────────────────────────────

  /** État des services Pli (distribution, appairage, notifications, etc.). */
  listerServicesSante(ctx: ContexteAdmin): Promise<ServiceSante[]>;

  /** Volumétrie quotidienne (bulletins + signatures) sur 30 jours. */
  obtenirVolumetrie30j(ctx: ContexteAdmin): Promise<PointVolumetrie[]>;

  /** Historique des incidents (30 derniers jours). */
  listerIncidents(ctx: ContexteAdmin): Promise<Incident[]>;

  /**
   * Synthèse coffres dormants — coût visible de la conservation des
   * comptes d'ex-salariés.
   */
  obtenirCoffresDormants(ctx: ContexteAdmin): Promise<CoffresDormants>;

  // ─── Journal d'audit (append-only, lecture seule) ───────────────────────

  /**
   * Liste les entrées du journal d'audit admin (impersonations, suspensions,
   * changements de plan, accès données…). Append-only : aucune méthode pour
   * supprimer ou modifier. En Phase 1, chaque entrée sera chaînée par hash
   * (CLAUDE.md), le mock garantit déjà l'ordre d'ajout et l'unicité d'id.
   */
  listerJournalAdmin(
    ctx: ContexteAdmin,
    filtre?: FiltreAuditAdmin,
  ): Promise<EntreeAuditAdmin[]>;

  // ─── Utilisateurs plateforme ────────────────────────────────────────────

  /** Liste des comptes plateforme (super admins + admins RH des entreprises). */
  listerUtilisateursPlateforme(ctx: ContexteAdmin): Promise<UtilisateurPlateforme[]>;

  /** Réinitialiser le mot de passe d'un utilisateur — action sensible journalisée. */
  reinitialiserMotDePasseUtilisateur(
    ctx: ContexteAdmin,
    utilisateurId: IdEntite,
  ): Promise<{ journalId: string }>;

  // ─── Support — tickets escaladés ────────────────────────────────────────

  /** Liste des tickets support escaladés depuis les entreprises clientes. */
  listerTicketsSupport(ctx: ContexteAdmin): Promise<TicketSupport[]>;

  /** Marquer un ticket comme résolu — action journalisée. */
  marquerTicketResolu(
    ctx: ContexteAdmin,
    ticketId: IdEntite,
  ): Promise<{ journalId: string }>;

  // ─── Conformité ──────────────────────────────────────────────────────────

  /** Hébergement, certificat de signature, rétention, demandes RGPD. */
  obtenirConformite(ctx: ContexteAdmin): Promise<Conformite>;

  /** Traiter une demande RGPD — action journalisée. */
  traiterDemandeRgpd(
    ctx: ContexteAdmin,
    demandeId: IdEntite,
  ): Promise<{ journalId: string }>;

  // ─── Communications ──────────────────────────────────────────────────────

  /** Liste des annonces / bannières plateforme. */
  listerAnnonces(ctx: ContexteAdmin): Promise<AnnoncePlateforme[]>;

  /** Liste des modèles d'e-mails transactionnels. */
  listerModelesEmail(ctx: ContexteAdmin): Promise<ModeleEmail[]>;

  /** Programmer une annonce — action journalisée. */
  programmerAnnonce(
    ctx: ContexteAdmin,
    titre: string,
    segment: string,
    canal: string,
  ): Promise<{ journalId: string }>;

  // ─── Paramètres plateforme ──────────────────────────────────────────────

  /** Paramètres globaux : branding, domaines, intégrations, clés API, webhooks. */
  obtenirParametresPlateforme(ctx: ContexteAdmin): Promise<ParametresPlateforme>;

  /** Activer/désactiver une intégration partenaire — action journalisée. */
  basculerIntegration(
    ctx: ContexteAdmin,
    integrationId: IdEntite,
    actif: boolean,
  ): Promise<{ journalId: string }>;

  // ─── Actions sensibles (impersonation + suspension) ─────────────────────

  /**
   * Impersonation : « se connecter en tant que » un admin RH d'une entreprise.
   * Doit poser une entrée d'audit. En Phase 0 mock : enregistre l'action dans
   * un journal interne lisible via `listerJournalAdmin` (test de contrat).
   */
  impersonnerEntreprise(
    ctx: ContexteAdmin,
    entrepriseId: IdEntite,
  ): Promise<{ journalId: string }>;

  /**
   * Suspension d'une entreprise (impayé > 30j etc.). Action sensible journalisée.
   */
  suspendreEntreprise(
    ctx: ContexteAdmin,
    entrepriseId: IdEntite,
    motif: string,
  ): Promise<{ journalId: string }>;
}
