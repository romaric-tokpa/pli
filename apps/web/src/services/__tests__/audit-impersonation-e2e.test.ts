// Test e2e impersonation → journal d'audit (sub-lot 12c).
//
// Vérifie l'invariant CLAUDE.md « toute impersonation est journalisée » à
// bout en bout sur le mock :
//
//   1. État initial : le journal contient le seed (entrées historiques),
//      mais AUCUNE entrée de type `impersonation` créée à cette session.
//   2. Action : `impersonnerEntreprise(ctx, 'atlantique')` renvoie un
//      `journalId` (preuve d'API).
//   3. Vérification : `listerJournalAdmin(ctx)` retourne désormais une
//      entrée de type `impersonation` avec :
//        - id === journalId retourné
//        - cible === nom de l'entreprise ('Groupe Atlantique CI')
//        - acteur, IP, date renseignés
//   4. Append-only : la nouvelle entrée a été AJOUTÉE — le seed est toujours
//      là, rien n'a été remplacé.
//   5. Filtre : `listerJournalAdmin(ctx, { type: 'impersonation' })` rend
//      bien la nouvelle entrée et ignore le reste.
//
// Si jamais quelqu'un retire la journalisation côté impersonation (regression
// majeure de sécurité), ce test claque immédiatement.

import { describe, expect, it } from 'vitest';
import type { ContexteAdmin } from '../contexte.js';
import { creerAdminServiceMock } from '../index.js';

const CTX: ContexteAdmin = { type: 'admin', adminId: 'u1' };

describe('AdminService — impersonation produit une entrée d\'audit lisible (e2e)', () => {
  it('état initial : 0 entrée d\'impersonation dans le journal seed', async () => {
    const service = creerAdminServiceMock();
    const j = await service.listerJournalAdmin(CTX);
    const impersonations = j.filter((e) => e.type === 'impersonation');
    expect(impersonations.length).toBe(0);
  });

  it('impersonnerEntreprise() pose une entrée lisible avec id, cible, acteur, IP, date, type', async () => {
    const service = creerAdminServiceMock();
    const seedLen = (await service.listerJournalAdmin(CTX)).length;

    const { journalId } = await service.impersonnerEntreprise(CTX, 'atlantique');
    expect(journalId).toMatch(/^la-\d{4}$/);

    const apres = await service.listerJournalAdmin(CTX);
    // Append-only : seed + 1
    expect(apres.length).toBe(seedLen + 1);

    // La nouvelle entrée est en tête (ordre descendant — plus récent d'abord).
    const entree = apres[0]!;
    expect(entree.id).toBe(journalId);
    expect(entree.type).toBe('impersonation');
    expect(entree.cible).toBe('Groupe Atlantique CI');
    expect(entree.acteur).toBeTruthy();
    expect(entree.ip).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
    expect(entree.date).toMatch(/^\d{2}\/\d{2}\/\d{4}/);
    expect(entree.action.toLowerCase()).toContain('impersonation');
  });

  it('le filtre `type: impersonation` rend uniquement la nouvelle entrée', async () => {
    const service = creerAdminServiceMock();
    await service.impersonnerEntreprise(CTX, 'comoe');
    const filtre = await service.listerJournalAdmin(CTX, { type: 'impersonation' });
    expect(filtre.length).toBe(1);
    expect(filtre[0]!.cible).toBe('Comoé Industries');
  });

  it('deux impersonations successives produisent deux entrées distinctes', async () => {
    const service = creerAdminServiceMock();
    const seedLen = (await service.listerJournalAdmin(CTX)).length;
    const r1 = await service.impersonnerEntreprise(CTX, 'atlantique');
    const r2 = await service.impersonnerEntreprise(CTX, 'comoe');
    expect(r1.journalId).not.toBe(r2.journalId);
    const apres = await service.listerJournalAdmin(CTX);
    expect(apres.length).toBe(seedLen + 2);
  });

  it("suspendreEntreprise() pose aussi une entrée d'audit (type=suspension)", async () => {
    // Symétrie : la suspension est l'autre action sensible journalisée.
    const service = creerAdminServiceMock();
    const { journalId } = await service.suspendreEntreprise(
      CTX,
      'ec-sahel',
      'impayé > 30 j',
    );
    const apres = await service.listerJournalAdmin(CTX, { type: 'suspension' });
    const trouvee = apres.find((e) => e.id === journalId);
    expect(trouvee).toBeDefined();
    expect(trouvee!.cible).toBe('Sahel Négoce');
    expect(trouvee!.action).toContain('impayé > 30 j');
  });

  it("l'AdminService n'expose AUCUNE méthode de suppression du journal (append-only au type)", () => {
    // Vérifie au runtime que le mock n'a pas de méthode `supprimer*`. Cette
    // garantie est aussi vraie au compilateur — l'interface AdminService n'a
    // aucune méthode de mutation du journal. Le test runtime ajoute un
    // garde-fou contre l'ajout discret d'une méthode hors interface.
    const service = creerAdminServiceMock() as unknown as Record<string, unknown>;
    const noms = Object.keys(service);
    for (const n of noms) {
      expect(n).not.toMatch(/supprimer|deletJournal|effacer/i);
    }
  });
});
