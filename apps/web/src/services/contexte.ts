// Contextes d'accès — TRADUISENT le scoping serveur qui sera appliqué en
// Phase 1 (middleware d'auth + RLS PostgreSQL). En Phase 0 mock, le contexte
// est passé en argument explicite à chaque méthode de service.
//
// Invariant CLAUDE.md : « Trois contextes d'accès — entreprise (son tenant),
// cabinet (son portefeuille, entreprises cloisonnées), personnel salarié
// (ses bulletins tous employeurs confondus). »
//
// La signature des services REND IMPOSSIBLE l'appel sans contexte. Cela
// préfigure la Phase 1 et garantit qu'aucun mock n'oubliera son scoping.

import type { IdEntite } from '@pli/types';

/** Pli Pro — administrateur RH d'une entreprise précise. */
export interface ContexteEntreprise {
  readonly type: 'entreprise';
  readonly entrepriseId: IdEntite;
}

/** Pli mobile salarié — agrège les bulletins entre rattachements employeurs. */
export interface ContextePersonnel {
  readonly type: 'personnel';
  readonly comptePersonnelId: IdEntite;
}

/**
 * Espace cabinet — mode PORTEFEUILLE : le cabinet gère son portefeuille
 * (liste des entreprises clientes, ajout déléguée, stats consolidées,
 * facturation cabinet, gestionnaires). Ne donne PAS accès aux données
 * d'une entreprise précise — pour cela il faut passer en `ContexteCabinet`.
 */
export interface ContextePortefeuilleCabinet {
  readonly type: 'portefeuille_cabinet';
  readonly cabinetId: IdEntite;
}

/**
 * Espace cabinet — mode ENTREPRISE SCELLÉE : le cabinet opère AU NOM D'UNE
 * entreprise du portefeuille. Le cabinet ne peut PAS agréger entre entreprises
 * clientes (cloisonnement CLAUDE.md invariant 5). Le type rend ce
 * cloisonnement structurel : un service scopé par entreprise ne peut être
 * appelé sans `entrepriseId`, et l'appel doit s'authentifier comme provenant
 * du cabinet propriétaire de cette entreprise (vérifié dans
 * `CabinetsService.appartientAuPortefeuille`).
 */
export interface ContexteCabinet {
  readonly type: 'cabinet';
  readonly cabinetId: IdEntite;
  readonly entrepriseId: IdEntite;
}

/** Console opérateur — équipe Pli. Pas de scoping tenant (audit obligatoire). */
export interface ContexteAdmin {
  readonly type: 'admin';
  readonly adminId: IdEntite;
}

/**
 * Sous-ensemble des contextes qui scopent à une entreprise.
 * Utilisé par les services qui opèrent sur le registre d'une entreprise
 * (salariés, bulletins, réconciliation, réclamations).
 */
export type ContexteScopeEntreprise = ContexteEntreprise | ContexteCabinet;

/**
 * Sous-ensemble des contextes utilisables dans l'espace cabinet (les deux
 * modes : portefeuille ou entreprise scellée). Utilisé par CabinetsService
 * pour les méthodes accessibles depuis les deux modes (obtenirCabinet,
 * listerGestionnaires, etc.).
 */
export type ContexteEspaceCabinet = ContextePortefeuilleCabinet | ContexteCabinet;

/** Union discriminée pour l'auth-service / contexte courant. */
export type ContexteAcces =
  | ContexteEntreprise
  | ContextePersonnel
  | ContextePortefeuilleCabinet
  | ContexteCabinet
  | ContexteAdmin;
