// Service sécurité — sessions actives, paramètres 2FA, journal d'audit.
//
// Invariant CLAUDE.md « max 2 sessions par entreprise / 1 sur mobile » :
// `obtenirSessions` ne renvoie jamais plus de 2 sessions. Le mock applique
// directement un slice(0, 2) ; en Phase 1, le service serveur déconnectera
// la plus ancienne au moment de la connexion d'une 3ème.
//
// Le journal est rendu via une projection filtrable mais l'invariant
// « append-only chaîné par hash » est porté en Phase 1 — ici on expose
// seulement les entrées en lecture seule (aucune méthode d'ajout/édition).

import type {
  EntreeAudit,
  IdEntite,
  ParametresAuthentification,
  Session,
  TypeEntreeAudit,
} from '@pli/types';
import type { ContexteScopeEntreprise } from './contexte.js';

export interface FiltreAudit {
  recherche?: string;
  type?: TypeEntreeAudit;
}

export type ResultatDeconnexion =
  | { ok: true }
  | { ok: false; raison: 'introuvable' | 'session_actuelle' };

export interface SecuriteService {
  /** Sessions actives (max 2 côté Pro). */
  obtenirSessions(ctx: ContexteScopeEntreprise): Promise<Session[]>;

  /** Déconnecte une session précise. La session actuelle ne peut PAS l'être par ce chemin. */
  deconnecterSession(
    ctx: ContexteScopeEntreprise,
    sessionId: IdEntite,
  ): Promise<ResultatDeconnexion>;

  /** Déconnecte toutes les sessions sauf l'actuelle. */
  deconnecterAutresSessions(ctx: ContexteScopeEntreprise): Promise<number>;

  /** Paramètres d'authentification (2FA, mot de passe, restrictions). */
  obtenirParametres(ctx: ContexteScopeEntreprise): Promise<ParametresAuthentification>;

  /** Bascule l'état de la 2FA. */
  basculerA2F(ctx: ContexteScopeEntreprise, a2f: boolean): Promise<{ ok: true; a2f: boolean }>;

  /** Journal d'audit (lecture seule, append-only en Phase 1). */
  listerJournal(ctx: ContexteScopeEntreprise, filtre?: FiltreAudit): Promise<EntreeAudit[]>;
}
