// Implémentation mock de BulletinsService.
//
// Démontre comment la FRONTIÈRE LISTE vs DÉTAIL est appliquée :
//  - `lister()` projette Bulletin → BulletinResume via destructuration qui
//    EXCLUT brut/cnps/its/net. Si quelqu'un ajoute un champ montant à
//    Bulletin sans le retirer ici, le test d'invariant (« net jamais en
//    liste ») claque.
//  - `obtenirComplet()` renvoie le Bulletin tel quel — pour le viewer.

import type { Bulletin } from '@pli/types';
import type { ContexteScopeEntreprise } from '../contexte.js';
import type { BulletinsService } from '../bulletins-service.js';
import type { BulletinResume } from '../types.js';
import { BULLETINS_PAR_ENTREPRISE } from './data-entreprises.js';

function registreEntreprise(ctx: ContexteScopeEntreprise): Bulletin[] {
  return BULLETINS_PAR_ENTREPRISE[ctx.entrepriseId] ?? [];
}

function enResume(b: Bulletin): BulletinResume {
  // Destructuration explicite : on retire les 4 champs montants.
  // Le linter `noUnusedLocals` veille à ce qu'aucun ne soit oublié.
  const { brut: _brut, cnps: _cnps, its: _its, net: _net, ...resume } = b;
  void _brut;
  void _cnps;
  void _its;
  void _net;
  return resume;
}

export function creerBulletinsServiceMock(): BulletinsService {
  return {
    async lister(ctx, filtre) {
      let bulletins = registreEntreprise(ctx);
      if (filtre?.periode) bulletins = bulletins.filter((b) => b.periode === filtre.periode);
      if (filtre?.salarieId) bulletins = bulletins.filter((b) => b.salarieId === filtre.salarieId);
      if (filtre?.matricule) {
        // Résolution interne sans toucher au registre des salariés (couplage évité).
        bulletins = bulletins.filter((b) => b.id.includes(filtre.matricule!.toLowerCase()));
      }
      if (filtre?.statutConsultation) {
        bulletins = bulletins.filter((b) => b.statutConsultation === filtre.statutConsultation);
      }
      if (filtre?.statutSignature) {
        bulletins = bulletins.filter((b) => b.statutSignature === filtre.statutSignature);
      }
      return bulletins.map(enResume);
    },

    async obtenirResume(ctx, id) {
      const b = registreEntreprise(ctx).find((b) => b.id === id);
      return b ? enResume(b) : null;
    },

    async obtenirComplet(ctx, id) {
      return registreEntreprise(ctx).find((b) => b.id === id) ?? null;
    },
  };
}
