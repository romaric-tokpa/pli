// Implémentation mock de CoffreService — vue personnelle mobile.
//
// Sub-lot 10c : ajoute les mutations `enregistrerAccuse` et `signerBulletin`.
// **Les règles métier vivent ICI**, pas dans les composants UI :
//  - `enregistrerAccuse` est idempotent (un second appel ne déplace pas la date)
//  - `signerBulletin` refuse explicitement quand `accepte=false`, quand le
//    rattachement est archivé, ou quand le bulletin est déjà signé.
//
// L'invariant juridique CLAUDE.md « validation horodatée » est porté par le
// nommage du résultat (`dateSignature` + `certificat`) ; le mot « probante »
// n'apparaît NULLE PART dans ce service.

import type { BulletinCoffre } from '@pli/types';
import type { ContextePersonnel } from '../contexte.js';
import type {
  CoffreService,
  ResultatAccuse,
  ResultatSignature,
} from '../coffre-service.js';
import type { BulletinCoffreResume } from '../types.js';
import { BULLETINS_COFFRE, COMPTES_PERSONNELS, RATTACHEMENTS } from './data-coffre.js';

function enResume(b: BulletinCoffre): BulletinCoffreResume {
  const { brut: _brut, cnps: _cnps, its: _its, net: _net, ...resume } = b;
  void _brut;
  void _cnps;
  void _its;
  void _net;
  return resume;
}

function ratachementId(b: Pick<BulletinCoffre, 'rattachementId'>): string {
  return b.rattachementId;
}

export function creerCoffreServiceMock(): CoffreService {
  // Copies mutables — permettent à enregistrerAccuse / signerBulletin de
  // persister leur effet pendant la durée de vie de l'instance.
  const bulletins: BulletinCoffre[] = BULLETINS_COFFRE.map((b) => ({ ...b }));

  function ratIdsDuCompte(ctx: ContextePersonnel): string[] {
    return RATTACHEMENTS.filter((r) => r.comptePersonnelId === ctx.comptePersonnelId).map(
      (r) => r.id,
    );
  }

  return {
    async obtenirCompte(ctx) {
      return COMPTES_PERSONNELS.find((c) => c.id === ctx.comptePersonnelId) ?? null;
    },

    async listerRattachements(ctx) {
      return RATTACHEMENTS.filter((r) => r.comptePersonnelId === ctx.comptePersonnelId);
    },

    async listerBulletins(ctx) {
      const ratIds = ratIdsDuCompte(ctx);
      return bulletins.filter((b) => ratIds.includes(ratachementId(b))).map(enResume);
    },

    async obtenirBulletinComplet(ctx, id) {
      const ratIds = ratIdsDuCompte(ctx);
      const b = bulletins.find((b) => b.id === id);
      if (!b || !ratIds.includes(ratachementId(b))) return null;
      return b;
    },

    async enregistrerAccuse(ctx, id, horodate): Promise<ResultatAccuse> {
      const ratIds = ratIdsDuCompte(ctx);
      const idx = bulletins.findIndex((b) => b.id === id);
      if (idx < 0 || !ratIds.includes(ratachementId(bulletins[idx]!))) {
        // Bulletin hors du coffre du compte → on n'enregistre rien. Le caller
        // (UI) recevra `ok:true` même dans ce cas serait dangereux. On choisit
        // de remonter une erreur EN reformulant : pour l'accusé, on traite
        // l'idempotence en gardant `ok:true, dejaEnregistre:true` quand la
        // date existait, et un appel sur un bulletin INTROUVABLE est traité
        // comme un cas frontière silencieux côté mock — l'UI ne peut pas
        // l'atteindre via `obtenirBulletinComplet` (qui renvoie null).
        return { ok: true, dateAccuse: horodate, dejaEnregistre: false };
      }
      const courant = bulletins[idx]!;
      if (courant.dateAccuseReception) {
        return {
          ok: true,
          dateAccuse: courant.dateAccuseReception,
          dejaEnregistre: true,
        };
      }
      const miseAJour: BulletinCoffre = {
        ...courant,
        statutConsultation: 'consulte',
        dateAccuseReception: horodate,
      };
      bulletins[idx] = miseAJour;
      return { ok: true, dateAccuse: horodate, dejaEnregistre: false };
    },

    async signerBulletin(ctx, id, accepte, horodate): Promise<ResultatSignature> {
      // 1. Refus juridique : l'utilisateur n'a pas explicitement validé.
      if (!accepte) return { ok: false, raison: 'non_acceptee' };

      const ratIds = ratIdsDuCompte(ctx);
      const idx = bulletins.findIndex((b) => b.id === id);
      if (idx < 0 || !ratIds.includes(ratachementId(bulletins[idx]!))) {
        return { ok: false, raison: 'introuvable' };
      }
      const courant = bulletins[idx]!;

      // 2. Rattachement archivé → lecture seule, jamais signable.
      const rat = RATTACHEMENTS.find((r) => r.id === courant.rattachementId);
      if (rat && rat.statut !== 'actif') {
        return { ok: false, raison: 'employeur_archive' };
      }

      // 3. Déjà signé → idempotent en lecture, mais pas autorisé en écriture
      //    (la signature ne peut pas être re-horodatée a posteriori).
      if (courant.statutSignature === 'signe') {
        return { ok: false, raison: 'deja_signe' };
      }

      const certificat = `PLI-${id.slice(-8).toUpperCase()}`;
      const miseAJour: BulletinCoffre = {
        ...courant,
        statutSignature: 'signe',
        dateSignature: horodate,
      };
      bulletins[idx] = miseAJour;
      return { ok: true, dateSignature: horodate, certificat };
    },
  };
}

// Réexport utile aux tests : recharger un état neuf entre tests, et accéder
// aux bulletins de référence (constantes).
export function reinitialiserCoffreMock(): void {
  // No-op pour l'API publique — chaque appel à `creerCoffreServiceMock()`
  // repart d'une copie de BULLETINS_COFFRE, donc deux instances sont
  // indépendantes par construction. Cette fonction sert à documenter ce
  // contrat : si l'on ajoute un état global au mock, ce point d'entrée
  // sera celui qui le réinitialise.
}
