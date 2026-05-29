// Service coffre personnel — vue mobile salarié.
//
// Particularité métier (CLAUDE.md invariant 5) : le coffre AGRÈGE entre
// employeurs UNIQUEMENT en contexte personnel. Le ctx ne dépend donc pas
// d'une entreprise mais d'un compte personnel. Les bulletins remontés
// proviennent de TOUS les rattachements du compte.
//
// Même frontière LISTE vs DÉTAIL que les bulletins Pro :
// listerBulletins → BulletinCoffreResume[] (sans montants)
// obtenirBulletinComplet → BulletinCoffreDetail (avec montants, viewer)

import type { ComptePersonnel, IdEntite, Rattachement } from '@pli/types';
import type { ContextePersonnel } from './contexte.js';
import type { BulletinCoffreDetail, BulletinCoffreResume } from './types.js';

export interface ResultatAccuse {
  ok: true;
  /** Date/heure JJ/MM/AAAA à HH:MM stamped au moment de l'enregistrement. */
  dateAccuse: string;
  /** True si l'accusé existait déjà (idempotent). */
  dejaEnregistre: boolean;
}

export type ResultatSignature =
  | {
      ok: true;
      /** Date/heure JJ/MM/AAAA à HH:MM */
      dateSignature: string;
      /** Identifiant du certificat horodaté Pli. */
      certificat: string;
    }
  | { ok: false; raison: 'non_acceptee' | 'introuvable' | 'employeur_archive' | 'deja_signe' };

export interface CoffreService {
  /** Profil du compte personnel courant. */
  obtenirCompte(ctx: ContextePersonnel): Promise<ComptePersonnel | null>;

  /** Rattachements employeurs (actifs + anciens) du compte courant. */
  listerRattachements(ctx: ContextePersonnel): Promise<Rattachement[]>;

  /** Bulletins du coffre — résumés sans montants. */
  listerBulletins(ctx: ContextePersonnel): Promise<BulletinCoffreResume[]>;

  /** Bulletin complet avec montants — RÉSERVÉ au viewer PDF mobile. */
  obtenirBulletinComplet(
    ctx: ContextePersonnel,
    id: IdEntite,
  ): Promise<BulletinCoffreDetail | null>;

  /**
   * Enregistre l'accusé de réception horodaté à l'ouverture d'un bulletin.
   * **Règle métier serveur (CLAUDE.md « accusé de réception »)** — vit ICI,
   * pas dans un effet de bord UI. Idempotent : un second appel ne déplace
   * pas la date.
   */
  enregistrerAccuse(
    ctx: ContextePersonnel,
    bulletinId: IdEntite,
    horodate: string,
  ): Promise<ResultatAccuse>;

  /**
   * Appose la **validation horodatée** (CLAUDE.md, libellé juridique
   * verrouillé). Refuse explicitement si :
   *  - l'utilisateur n'a pas confirmé (`accepte=false`)
   *  - le rattachement est archivé (employeur parti — lecture seule)
   *  - le bulletin est déjà signé
   *
   * Le service est la source de vérité ; le bouton `disabled` n'est qu'un
   * miroir UX (cf. réconciliation sub-lot 9b/3).
   */
  signerBulletin(
    ctx: ContextePersonnel,
    bulletinId: IdEntite,
    accepte: boolean,
    horodate: string,
  ): Promise<ResultatSignature>;
}
