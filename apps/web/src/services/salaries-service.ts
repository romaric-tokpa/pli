// Service salariés — registre RH d'une entreprise.
//
// Invariant CLAUDE.md « L'appairage du matricule est borné au registre de
// l'entreprise du contexte » : `resoudreParMatricule` doit RIGOUREUSEMENT
// se limiter au registre du tenant scopé par le contexte. Toute traversée
// de tenants est interdite.

import type { IdEntite, MatriculeSalarie, Salarie } from '@pli/types';
import type { ContexteScopeEntreprise } from './contexte.js';
import type { FiltreSalaries } from './types.js';

export interface SalariesService {
  /** Liste filtrée des salariés du registre de l'entreprise contexte. */
  lister(ctx: ContexteScopeEntreprise, filtre?: FiltreSalaries): Promise<Salarie[]>;

  /** Détail d'un salarié — borné au tenant. Renvoie null si non trouvé OU hors tenant. */
  obtenir(ctx: ContexteScopeEntreprise, id: IdEntite): Promise<Salarie | null>;

  /**
   * Résolution matricule → salarié BORNÉE AU REGISTRE de l'entreprise contexte.
   * INVARIANT : si le matricule existe chez un autre tenant mais pas dans le
   * registre du contexte, doit renvoyer null. JAMAIS de leak cross-tenant.
   */
  resoudreParMatricule(
    ctx: ContexteScopeEntreprise,
    matricule: MatriculeSalarie,
  ): Promise<Salarie | null>;
}
