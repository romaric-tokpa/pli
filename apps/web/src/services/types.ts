// Types partagés des services — frontière LISTE vs DÉTAIL portée AU TYPE.
//
// Invariant CLAUDE.md : « Le salaire net n'apparaît JAMAIS dans une liste,
// carte, prévisualisation ou résumé. Il n'est jamais lu ni stocké hors du
// document. Il ne vit que dans le PDF. »
//
// Ici, l'invariant est matérialisé en TypeScript : les méthodes `lister*`
// renvoient des types `*Resume` dont les montants sont retirés par `Omit`.
// Seules les méthodes `obtenir*Complet` renvoient le bulletin avec montants,
// et leur nom le rend EXPLICITE pour le caller.

import type { Bulletin, BulletinCoffre } from '@pli/types';

/**
 * Vue résumé d'un Bulletin (côté Pro) — aucun champ montant.
 * Construite par `Omit` : si un nouveau champ montant est ajouté à Bulletin
 * en Phase 1, il devra être listé ici, sinon la fuite n'est pas portée par
 * le type. C'est volontaire : forcer la décision explicite.
 */
export type BulletinResume = Omit<Bulletin, 'brut' | 'cnps' | 'its' | 'net'>;

/** Vue complète d'un Bulletin — RÉSERVÉE au viewer PDF. */
export type BulletinDetail = Bulletin;

/** Vue résumé d'un BulletinCoffre (côté mobile / personnel) — aucun montant. */
export type BulletinCoffreResume = Omit<BulletinCoffre, 'brut' | 'cnps' | 'its' | 'net'>;

/** Vue complète d'un BulletinCoffre — pour le viewer mobile. */
export type BulletinCoffreDetail = BulletinCoffre;

// ─── Filtres ──────────────────────────────────────────────────────────────

import type { Periode, IdEntite, MatriculeSalarie } from '@pli/types';
import type {
  EtatReconciliation,
  StatutConsultation,
  StatutSignature,
  StatutSalarie,
} from '@pli/types';

export interface FiltreSalaries {
  service?: string;
  statut?: StatutSalarie;
  recherche?: string;
}

export interface FiltreBulletins {
  periode?: Periode;
  salarieId?: IdEntite;
  matricule?: MatriculeSalarie;
  statutConsultation?: StatutConsultation;
  statutSignature?: StatutSignature;
}

export interface FiltreReconciliation {
  etat?: EtatReconciliation;
}
