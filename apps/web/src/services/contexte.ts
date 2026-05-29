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
 * Espace cabinet — opérations AU NOM D'UNE entreprise du portefeuille du cabinet.
 * Le cabinet ne peut PAS agréger entre entreprises clientes (cloisonnement).
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

/** Union discriminée pour l'auth-service / contexte courant. */
export type ContexteAcces =
  | ContexteEntreprise
  | ContextePersonnel
  | ContexteCabinet
  | ContexteAdmin;
