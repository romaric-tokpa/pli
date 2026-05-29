// Service bulletins — vue Pro / Cabinet.
//
// FRONTIÈRE LISTE vs DÉTAIL portée par les types de retour :
//  - `lister()` renvoie `BulletinResume[]` — Omit<Bulletin, brut|cnps|its|net>
//  - `obtenirComplet()` renvoie `BulletinDetail` — Bulletin entier, RÉSERVÉ
//    au viewer PDF. Le nom explicite signale au caller qu'il exposera des
//    montants.
//
// L'invariant « net jamais dans une liste/carte/résumé » (CLAUDE.md) est
// porté ICI au niveau du contrat. Aucun mock ni implémentation HTTP future
// ne peut casser cet invariant sans casser le type.

import type { IdEntite } from '@pli/types';
import type { ContexteScopeEntreprise } from './contexte.js';
import type { BulletinDetail, BulletinResume, FiltreBulletins } from './types.js';

export interface BulletinsService {
  /** Liste de RÉSUMÉS (sans montants) — scopé au tenant du contexte. */
  lister(ctx: ContexteScopeEntreprise, filtre?: FiltreBulletins): Promise<BulletinResume[]>;

  /** Détail RÉSUMÉ d'un bulletin précis — sans montants, pour les fiches sans viewer. */
  obtenirResume(ctx: ContexteScopeEntreprise, id: IdEntite): Promise<BulletinResume | null>;

  /**
   * Détail COMPLET avec montants — UNIQUEMENT pour le viewer PDF.
   * Tout appel à cette méthode doit être justifié (viewer ouvert, téléchargement).
   * Toute action d'audit (téléchargement, signature) doit être consignée.
   */
  obtenirComplet(ctx: ContexteScopeEntreprise, id: IdEntite): Promise<BulletinDetail | null>;
}
