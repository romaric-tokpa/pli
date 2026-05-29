// Service auth — gestion du contexte d'accès courant.
//
// En Phase 0 mock : retourne le contexte courant configuré en mémoire
// (utile pour tester chaque surface). En Phase 2 : appellera l'API d'auth
// réelle qui pose un cookie sécurisé + renvoie le contexte côté serveur.

import type { ContexteAcces } from './contexte.js';

export interface AuthService {
  /**
   * Contexte d'accès courant. null si non authentifié (à rediriger vers /connexion).
   */
  contexteCourant(): Promise<ContexteAcces | null>;

  /**
   * Force le contexte en mémoire — utile pour le mock et les tests.
   * Sera remplacé par un vrai flux de connexion en Phase 2.
   */
  definirContexte(ctx: ContexteAcces | null): Promise<void>;
}
