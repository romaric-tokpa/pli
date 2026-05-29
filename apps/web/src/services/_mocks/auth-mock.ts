// Implémentation mock de AuthService — singleton en mémoire.

import type { ContexteAcces } from '../contexte.js';
import type { AuthService } from '../auth-service.js';

let contexteActuel: ContexteAcces | null = null;

export function creerAuthServiceMock(initial?: ContexteAcces): AuthService {
  if (initial !== undefined) {
    contexteActuel = initial;
  }
  return {
    async contexteCourant() {
      return contexteActuel;
    },
    async definirContexte(ctx) {
      contexteActuel = ctx;
    },
  };
}
