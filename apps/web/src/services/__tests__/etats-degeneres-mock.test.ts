// Couverture mock des cas dégénérés — prouve que les BRANCHES « zéro résultat »
// des écrans /pro/* (EmptyState, lists vides, bouton « Relancer tous »
// désactivé) sont réellement atteignables avec le jeu de données actuel.
//
// Sans ces garde-fous, on risquerait que les EmptyState ne soient jamais
// rendus en mock — donc jamais inspectés visuellement et silencieusement
// régressés par une mise à jour ultérieure des données.
//
// Si on enrichit RECLAMATIONS_PAR_ENTREPRISE ou BULLETINS_PAR_ENTREPRISE et
// que les conditions ci-dessous cessent d'être vraies, ces tests claqueront —
// nous obligeant à choisir : adapter le mock ou perdre la couverture UI
// d'un état dégénéré.

import { describe, expect, it } from 'vitest';
import type { ContexteEntreprise } from '../contexte.js';
import {
  creerBulletinsServiceMock,
  creerFacturationServiceMock,
  creerReclamationsServiceMock,
  creerSalariesServiceMock,
  creerSecuriteServiceMock,
} from '../index.js';

const CTX_ATLANTIQUE: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

const CTX_COMOE: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'comoe',
};

describe('[Mock] Cas dégénérés rendus par les écrans /pro/*', () => {
  // ─── Suivi de la distribution ──────────────────────────────────────────

  it('Suivi : une période sans bulletin déclenche les deux EmptyState (consultation + signatures)', async () => {
    // L'écran /pro/suivi rend deux Card. Chacune affiche un EmptyState si
    // sa branche est vide. Pour qu'un mainteneur puisse visualiser cet état,
    // il faut qu'AU MOINS une période rende les deux EmptyState ensemble.
    const bulletins = creerBulletinsServiceMock();
    const novembre = await bulletins.lister(CTX_ATLANTIQUE, { periode: '2025-11' });
    expect(novembre).toEqual([]); // → distribues=0, nonConsultes=0, signes=0, aSigner=0
  });

  it('Suivi : une période avec uniquement des consultés déclenche le EmptyState « Tout le monde a consulté »', async () => {
    // Janvier 2026 : tous les bulletins distribués sont consultés.
    // → branche `nonConsultes.length === 0` rendue, bouton « Relancer tous » disabled.
    const bulletins = creerBulletinsServiceMock();
    const janvier = await bulletins.lister(CTX_ATLANTIQUE, { periode: '2026-01' });
    const distribues = janvier.filter((b) => b.statutRemise === 'distribue');
    expect(distribues.length).toBeGreaterThan(0);
    const nonConsultes = distribues.filter((b) => b.statutConsultation === 'non_consulte');
    expect(nonConsultes).toEqual([]);
  });

  // ─── Réclamations ───────────────────────────────────────────────────────

  it('Réclamations : un tenant sans réclamation déclenche les deux EmptyState (« Aucune réclamation » + « Sélectionnez »)', async () => {
    // Comoé est volontairement laissé sans réclamation pour exercer le double
    // EmptyState de /pro/reclamations.
    const service = creerReclamationsServiceMock();
    const liste = await service.lister(CTX_COMOE);
    expect(liste).toEqual([]);
  });

  it('Réclamations : un filtre par recherche sans correspondance renvoie une liste vide', async () => {
    // La recherche est client-side dans l'écran ; le service ne reçoit pas la
    // requête. Mais le service supporte aussi un filtre.recherche pour les
    // appels HTTP futurs — on garde la couverture du chemin vide.
    const service = creerReclamationsServiceMock();
    const liste = await service.lister(CTX_ATLANTIQUE, {
      recherche: 'chaîne-impossible-zzz',
    });
    expect(liste).toEqual([]);
  });

  it('Réclamations : il existe une réclamation sans réponse RH (statut « nouvelle » + 1 seul message)', async () => {
    // Branche « pas de réponse encore » : la conversation n'a qu'un message du
    // salarié. C'est l'état initial typique et le plus visible côté RH —
    // s'il disparaît, on ne sait plus à quoi ressemble un fil neuf.
    const service = creerReclamationsServiceMock();
    const liste = await service.lister(CTX_ATLANTIQUE);
    const sansReponse = liste.filter(
      (r) =>
        r.statut === 'nouvelle' &&
        r.messages.length === 1 &&
        r.messages[0]!.auteur === 'salarie',
    );
    expect(sansReponse.length).toBeGreaterThan(0);
  });

  // ─── Salariés ──────────────────────────────────────────────────────────

  // ─── Facturation ───────────────────────────────────────────────────────

  it('Facturation : il existe un tenant en statut « essai » → rendu du bandeau « bulletins restants »', async () => {
    // Sans abonnement en essai, le bandeau cachet en haut de l'écran
    // /pro/facturation n'est jamais visible. On verrouille la couverture.
    const service = creerFacturationServiceMock();
    const ab = await service.obtenirAbonnement(CTX_ATLANTIQUE);
    expect(ab?.statut).toBe('essai');
    expect(ab?.essaiBulletinsRestants).toBeGreaterThanOrEqual(0);
  });

  it("Facturation : un tenant peut n'avoir AUCUNE facture (cas « historique vide »)", async () => {
    // Le Table de l'écran rend `emptyState` (null par défaut → ligne vide)
    // quand `data` est []. Cohorte la garantie : Comoé sert cet état.
    const service = creerFacturationServiceMock();
    const factures = await service.listerFactures(CTX_COMOE);
    expect(factures).toEqual([]);
  });

  // ─── Sécurité ──────────────────────────────────────────────────────────

  it('Sécurité : un tenant peut n\'avoir AUCUNE entrée dans son journal d\'audit', async () => {
    // L'écran /pro/securite rend une Table vide dans ce cas — c'est l'état
    // d'un compte fraîchement provisionné. Comoé fournit ce cas.
    const service = creerSecuriteServiceMock();
    const journal = await service.listerJournal(CTX_COMOE);
    expect(journal).toEqual([]);
  });

  it('Sécurité : un tenant peut n\'avoir QU\'UNE seule session active (cas le plus courant)', async () => {
    // L'invariant max 2 ne dit pas qu'il y en a toujours 2. Le rendu
    // 1 session active doit pouvoir être visualisé.
    const service = creerSecuriteServiceMock();
    const sessions = await service.obtenirSessions(CTX_COMOE);
    expect(sessions.length).toBe(1);
  });

  // ─── Salariés ──────────────────────────────────────────────────────────

  it('Salariés : il existe au moins un salarié SANS aucun bulletin (cas « rien à afficher » sur la fiche)', async () => {
    // L'écran /pro/salaries/:id affiche un EmptyState dans l'onglet
    // « Historique bulletins » quand la projection BulletinsService.lister
    // ({salarieId}) est vide. Sans ce salarié dans le mock, l'EmptyState
    // n'est jamais visualisé.
    const salaries = creerSalariesServiceMock();
    const bulletins = creerBulletinsServiceMock();
    const tousSalaries = await salaries.lister(CTX_ATLANTIQUE);
    const sansBulletin: string[] = [];
    for (const s of tousSalaries) {
      const bs = await bulletins.lister(CTX_ATLANTIQUE, { salarieId: s.id });
      if (bs.length === 0) sansBulletin.push(s.id);
    }
    expect(sansBulletin.length).toBeGreaterThan(0);
  });
});
