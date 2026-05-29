// Tests d'invariants juridiques mobile (sub-lot 10c).
//
// Trois règles non-négociables verrouillées au niveau du SERVICE — un bypass
// UI ne doit JAMAIS pouvoir les enfreindre :
//
//   1. Activation : CGU non cochées → refus du service.
//   2. Signature : non acceptée → refus du service.
//   3. Signature : employeur archivé → refus du service.
//
// Ces tests claquent si la règle disparaît du service (ex. quelqu'un déplace
// le « if !accepte » dans l'UI). C'est ce qui rend l'invariant durable au
// refactoring.

import { describe, expect, it } from 'vitest';
import {
  creerActivationServiceMock,
  creerCoffreServiceMock,
  type ContextePersonnel,
} from '../index.js';

const CTX_AYA: ContextePersonnel = {
  type: 'personnel',
  comptePersonnelId: 'cp-aya',
};

describe("[Mock] ActivationService — CGU bloquante (invariant juridique)", () => {
  it('activerCompte() REFUSE explicitement quand cguAcceptees=false, MÊME si tout le reste est valide', async () => {
    const service = creerActivationServiceMock();
    const res = await service.activerCompte({
      emailPro: 'aya.koffi@atlantique.ci',
      telPerso: '+225 07 00 00 00 99',
      cguAcceptees: false,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.raison).toBe('cgu_non_acceptees');
  });

  it("le refus CGU vient AVANT toute autre vérification (email pro inconnu)", async () => {
    // L'ordre des vérifications est testé : si on a la fois CGU manquantes ET
    // email inconnu, le service refuse pour CGU d'abord — c'est le contrat
    // juridique le plus fort.
    const service = creerActivationServiceMock();
    const res = await service.activerCompte({
      emailPro: 'inconnu@nulle-part.ci',
      telPerso: '+225 07 00 00 00 99',
      cguAcceptees: false,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.raison).toBe('cgu_non_acceptees');
  });

  it("activerCompte() avec cguAcceptees=true ET email pro valide RÉUSSIT", async () => {
    const service = creerActivationServiceMock();
    const res = await service.activerCompte({
      emailPro: 'aya.koffi@atlantique.ci',
      telPerso: '+225 07 00 00 00 99', // nouveau numéro pour éviter compte_existant
      cguAcceptees: true,
    });
    expect(res.ok).toBe(true);
  });

  it('activerCompte() refuse si l\'email pro est inconnu (et CGU cochées)', async () => {
    const service = creerActivationServiceMock();
    const res = await service.activerCompte({
      emailPro: 'inconnu@nulle-part.ci',
      telPerso: '+225 07 00 00 00 99',
      cguAcceptees: true,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.raison).toBe('email_inconnu');
  });
});

describe('[Mock] CoffreService.signerBulletin — règle accepte=true (invariant juridique)', () => {
  it('signerBulletin(accepte=false) REFUSE même sur un bulletin signable', async () => {
    const service = creerCoffreServiceMock();
    const bulletins = await service.listerBulletins(CTX_AYA);
    const cible = bulletins.find((b) => b.statutSignature !== 'signe');
    expect(cible).toBeDefined();
    const res = await service.signerBulletin(
      CTX_AYA,
      cible!.id,
      false,
      '01/03/2026 à 10:00',
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.raison).toBe('non_acceptee');
  });

  it('signerBulletin(accepte=true) sur un employeur ARCHIVÉ refuse explicitement', async () => {
    // Aya a un rattachement Comoé (parti). Ses bulletins Comoé doivent
    // être en lecture seule → signature impossible.
    const service = creerCoffreServiceMock();
    const bulletins = await service.listerBulletins(CTX_AYA);
    const rats = await service.listerRattachements(CTX_AYA);
    const ratParti = rats.find((r) => r.statut !== 'actif');
    expect(ratParti).toBeDefined();
    const bulletinArchive = bulletins.find((b) => b.rattachementId === ratParti!.id);
    expect(bulletinArchive).toBeDefined();
    const res = await service.signerBulletin(
      CTX_AYA,
      bulletinArchive!.id,
      true,
      '01/03/2026 à 10:00',
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.raison).toBe('employeur_archive');
  });

  it("signerBulletin() sur un bulletin DÉJÀ signé refuse (pas de re-horodatage a posteriori)", async () => {
    const service = creerCoffreServiceMock();
    const bulletins = await service.listerBulletins(CTX_AYA);
    const dejaSigne = bulletins.find((b) => b.statutSignature === 'signe');
    if (!dejaSigne) return;
    const res = await service.signerBulletin(
      CTX_AYA,
      dejaSigne.id,
      true,
      '01/03/2026 à 10:00',
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.raison).toBe('deja_signe');
  });

  it('signerBulletin(accepte=true) sur un bulletin signable RÉUSSIT et expose certificat + dateSignature', async () => {
    const service = creerCoffreServiceMock();
    const bulletins = await service.listerBulletins(CTX_AYA);
    const rats = await service.listerRattachements(CTX_AYA);
    const ratActif = rats.find((r) => r.statut === 'actif');
    const cible = bulletins.find(
      (b) => b.statutSignature !== 'signe' && b.rattachementId === ratActif!.id,
    );
    expect(cible).toBeDefined();
    const res = await service.signerBulletin(
      CTX_AYA,
      cible!.id,
      true,
      '01/03/2026 à 10:00',
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.dateSignature).toBe('01/03/2026 à 10:00');
      expect(res.certificat).toMatch(/^PLI-/);
    }
  });
});

describe('[Mock] CoffreService.enregistrerAccuse — règle métier serveur', () => {
  it('un premier appel marque la date et le bulletin comme consulté', async () => {
    const service = creerCoffreServiceMock();
    const bulletins = await service.listerBulletins(CTX_AYA);
    const cible = bulletins.find((b) => b.statutConsultation === 'non_consulte');
    expect(cible).toBeDefined();
    const res = await service.enregistrerAccuse(
      CTX_AYA,
      cible!.id,
      '01/03/2026 à 09:00',
    );
    expect(res.ok).toBe(true);
    expect(res.dejaEnregistre).toBe(false);
    expect(res.dateAccuse).toBe('01/03/2026 à 09:00');
    const apres = await service.obtenirBulletinComplet(CTX_AYA, cible!.id);
    expect(apres?.statutConsultation).toBe('consulte');
    expect(apres?.dateAccuseReception).toBe('01/03/2026 à 09:00');
  });

  it("est idempotent : un second appel ne déplace pas la date", async () => {
    const service = creerCoffreServiceMock();
    const bulletins = await service.listerBulletins(CTX_AYA);
    const cible = bulletins.find((b) => b.statutConsultation === 'non_consulte');
    expect(cible).toBeDefined();
    await service.enregistrerAccuse(CTX_AYA, cible!.id, '01/03/2026 à 09:00');
    const res2 = await service.enregistrerAccuse(
      CTX_AYA,
      cible!.id,
      '02/03/2026 à 12:00',
    );
    expect(res2.ok).toBe(true);
    expect(res2.dejaEnregistre).toBe(true);
    expect(res2.dateAccuse).toBe('01/03/2026 à 09:00');
  });
});
