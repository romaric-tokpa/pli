// Implémentation mock de SalariesService — lectures sur Record indexé par
// entrepriseId. Le scoping tenant est appliqué DÈS l'entrée par le contexte ;
// aucun chemin de code ne lit en dehors du registre du tenant courant.

import type { IdEntite, MatriculeSalarie, Salarie } from '@pli/types';
import type { ContexteScopeEntreprise } from '../contexte.js';
import type { SalariesService } from '../salaries-service.js';
import type { FiltreSalaries } from '../types.js';
import { SALARIES_PAR_ENTREPRISE } from './data-entreprises.js';

function registreEntreprise(ctx: ContexteScopeEntreprise): Salarie[] {
  return SALARIES_PAR_ENTREPRISE[ctx.entrepriseId] ?? [];
}

function correspond(salarie: Salarie, filtre?: FiltreSalaries): boolean {
  if (!filtre) return true;
  if (filtre.statut && salarie.statut !== filtre.statut) return false;
  if (filtre.service && salarie.service !== filtre.service) return false;
  if (filtre.recherche) {
    const aig = filtre.recherche.toLowerCase().trim();
    if (
      !salarie.nom.toLowerCase().includes(aig) &&
      !salarie.matricule.toLowerCase().includes(aig) &&
      !salarie.email.toLowerCase().includes(aig)
    ) {
      return false;
    }
  }
  return true;
}

export function creerSalariesServiceMock(): SalariesService {
  return {
    async lister(ctx, filtre) {
      return registreEntreprise(ctx).filter((s) => correspond(s, filtre));
    },

    async obtenir(ctx, id: IdEntite) {
      return registreEntreprise(ctx).find((s) => s.id === id) ?? null;
    },

    async resoudreParMatricule(ctx, matricule: MatriculeSalarie) {
      // INVARIANT : lecture STRICTE dans le registre du tenant courant.
      // Aucune itération cross-tenant. Voir tests de contrat.
      return registreEntreprise(ctx).find((s) => s.matricule === matricule) ?? null;
    },
  };
}
