// Implémentation mock de ReclamationsService — lecture sur Record indexé
// par entrepriseId. Le scoping tenant est appliqué par la signature du
// service : aucun chemin ne touche au registre d'un autre tenant.
//
// Les opérations de mutation (envoyerReponse, marquerResolue) clonent les
// registres en place pour que les écrans qui rechargent voient le changement
// pendant la durée de vie de l'instance. C'est suffisant pour le mock —
// l'API Phase 1 persistera en base.

import type {
  IdEntite,
  MessageReclamation,
  Reclamation,
  StatutReclamation,
} from '@pli/types';
import type { ContexteScopeEntreprise } from '../contexte.js';
import type {
  FiltreReclamations,
  ReclamationsService,
  ResultatReponse,
  StatistiquesReclamations,
} from '../reclamations-service.js';
import {
  RECLAMATIONS_PAR_ENTREPRISE,
  STATS_RECLAMATIONS_PARTYPE_PAR_ENTREPRISE,
  STATS_RECLAMATIONS_TENDANCE_PAR_ENTREPRISE,
} from './data-entreprises.js';

function correspond(r: Reclamation, filtre?: FiltreReclamations): boolean {
  if (!filtre) return true;
  if (filtre.statut && r.statut !== filtre.statut) return false;
  if (filtre.recherche) {
    const aig = filtre.recherche.toLowerCase().trim();
    if (
      !r.sujet.toLowerCase().includes(aig) &&
      !r.type.toLowerCase().includes(aig) &&
      !r.messages.some((m) => m.nom.toLowerCase().includes(aig))
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Stockage en mémoire — instance-locale pour permettre la persistance
 * pendant la durée de vie d'un mock. À chaque `creerReclamationsServiceMock`
 * on repart d'une copie superficielle des données seed (les tests peuvent
 * isoler leur état). En Phase 1, ce module disparaît au profit d'un client HTTP.
 */
export function creerReclamationsServiceMock(): ReclamationsService {
  const registre: Record<IdEntite, Reclamation[]> = {};
  for (const [id, liste] of Object.entries(RECLAMATIONS_PAR_ENTREPRISE)) {
    registre[id] = liste.map((r) => ({ ...r, messages: [...r.messages] }));
  }

  function listeMutable(ctx: ContexteScopeEntreprise): Reclamation[] {
    return registre[ctx.entrepriseId] ?? [];
  }

  return {
    async lister(ctx, filtre) {
      return listeMutable(ctx).filter((r) => correspond(r, filtre));
    },

    async obtenir(ctx, id) {
      return listeMutable(ctx).find((r) => r.id === id) ?? null;
    },

    async statistiques(ctx) {
      const reclamations = listeMutable(ctx);
      const parStatut: { statut: StatutReclamation; count: number }[] = (
        ['nouvelle', 'en_cours', 'resolue'] as StatutReclamation[]
      ).map((statut) => ({
        statut,
        count: reclamations.filter((r) => r.statut === statut).length,
      }));
      const parType = STATS_RECLAMATIONS_PARTYPE_PAR_ENTREPRISE[ctx.entrepriseId] ?? [];
      const tendance6Mois =
        STATS_RECLAMATIONS_TENDANCE_PAR_ENTREPRISE[ctx.entrepriseId] ?? [];

      const stats: StatistiquesReclamations = {
        total: reclamations.length,
        parStatut,
        parType: parType.map((t) => ({ ...t })),
        tendance6Mois: tendance6Mois.map((p) => ({ ...p })),
        delaiPremiereReponse: '4 h 12',
        delaiResolutionMoyen: '2,3 j',
        tauxResolution: 75,
      };
      return stats;
    },

    async envoyerReponse(ctx, id, texte, auteurNom): Promise<ResultatReponse> {
      const liste = registre[ctx.entrepriseId];
      if (!liste) return { ok: false, raison: 'introuvable' };
      const idx = liste.findIndex((r) => r.id === id);
      if (idx < 0) return { ok: false, raison: 'introuvable' };
      const courante = liste[idx]!;
      if (courante.statut === 'resolue') return { ok: false, raison: 'deja_resolue' };

      const message: MessageReclamation = {
        auteur: 'rh',
        nom: auteurNom,
        date: courante.dateOuverture,
        texte,
      };
      const miseAJour: Reclamation = {
        ...courante,
        statut: courante.statut === 'nouvelle' ? 'en_cours' : courante.statut,
        derniereActivite: 'à l’instant',
        messages: [...courante.messages, message],
      };
      liste[idx] = miseAJour;
      return { ok: true, reclamation: miseAJour };
    },

    async marquerResolue(ctx, id): Promise<ResultatReponse> {
      const liste = registre[ctx.entrepriseId];
      if (!liste) return { ok: false, raison: 'introuvable' };
      const idx = liste.findIndex((r) => r.id === id);
      if (idx < 0) return { ok: false, raison: 'introuvable' };
      const courante = liste[idx]!;
      if (courante.statut === 'resolue') return { ok: false, raison: 'deja_resolue' };
      const miseAJour: Reclamation = {
        ...courante,
        statut: 'resolue',
        derniereActivite: 'à l’instant',
      };
      liste[idx] = miseAJour;
      return { ok: true, reclamation: miseAJour };
    },
  };
}
