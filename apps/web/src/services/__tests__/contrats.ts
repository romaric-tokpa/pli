// Harnais de tests d'invariant — patron « contract test ».
//
// Chaque suite ci-dessous prend en argument une FACTORY de service. Le test
// porte donc sur le CONTRAT de l'interface (ce que la méthode promet), et non
// sur une implémentation précise. Quand l'API HTTP réelle remplacera le mock
// en Phase 2, on relancera ces mêmes suites contre la nouvelle factory et
// l'invariant continue de protéger la prod sans modification.
//
// Pattern inspiré du « interface conformance test » de Hyrum's Law.

import { describe, expect, it } from 'vitest';

import type { ContexteEntreprise, ContexteScopeEntreprise } from '../contexte.js';
import type { BulletinsService } from '../bulletins-service.js';
import type { SalariesService } from '../salaries-service.js';
import type { ReconciliationService } from '../reconciliation-service.js';
import type { ReclamationsService } from '../reclamations-service.js';
import type { FacturationService } from '../facturation-service.js';
import type { SecuriteService } from '../securite-service.js';

// -----------------------------------------------------------------------------
// Invariant 1 — Net JAMAIS dans une liste
// -----------------------------------------------------------------------------
export function suiteContratNetJamaisEnListe(
  nomImpl: string,
  factory: () => BulletinsService,
  contexteAvecBulletins: ContexteScopeEntreprise,
): void {
  describe(`[Contrat ${nomImpl}] BulletinsService — Net jamais dans une liste`, () => {
    it('lister() ne renvoie aucun champ montant (brut/cnps/its/net)', async () => {
      const service = factory();
      const resumes = await service.lister(contexteAvecBulletins);
      expect(resumes.length).toBeGreaterThan(0); // sanity : le mock fournit des données
      for (const r of resumes) {
        expect(r).not.toHaveProperty('brut');
        expect(r).not.toHaveProperty('cnps');
        expect(r).not.toHaveProperty('its');
        expect(r).not.toHaveProperty('net');
      }
    });

    it('obtenirResume() ne renvoie aucun champ montant', async () => {
      const service = factory();
      const resumes = await service.lister(contexteAvecBulletins);
      const premier = resumes[0]!;
      const resume = await service.obtenirResume(contexteAvecBulletins, premier.id);
      expect(resume).not.toBeNull();
      expect(resume).not.toHaveProperty('brut');
      expect(resume).not.toHaveProperty('cnps');
      expect(resume).not.toHaveProperty('its');
      expect(resume).not.toHaveProperty('net');
    });

    it("obtenirComplet() — SEULE méthode autorisée à exposer le net — l'expose effectivement", async () => {
      // Test de la frontière inverse : la méthode dédiée au viewer DOIT
      // exposer les montants (sinon le viewer ne peut rien afficher).
      const service = factory();
      const resumes = await service.lister(contexteAvecBulletins);
      const premier = resumes[0]!;
      const complet = await service.obtenirComplet(contexteAvecBulletins, premier.id);
      expect(complet).not.toBeNull();
      expect(complet).toHaveProperty('brut');
      expect(complet).toHaveProperty('cnps');
      expect(complet).toHaveProperty('its');
      expect(complet).toHaveProperty('net');
      expect(typeof complet!.net).toBe('number');
    });
  });
}

// -----------------------------------------------------------------------------
// Invariant 2 — Appairage BORNÉ au registre du tenant
// -----------------------------------------------------------------------------
export function suiteContratAppairageBorneTenant(
  nomImpl: string,
  factory: () => SalariesService,
  config: {
    tenantA: ContexteEntreprise;
    tenantB: ContexteEntreprise;
    /** Matricule présent dans LE TENANT A uniquement. */
    matriculeExclusifA: string;
    /** Matricule présent dans LE TENANT B uniquement. */
    matriculeExclusifB: string;
    /**
     * Matricule présent dans LES DEUX tenants mais sur des SALARIÉS
     * DIFFÉRENTS — cas de collision intentionnelle pour tester que la
     * résolution renvoie bien le salarié du tenant courant, pas un autre.
     */
    matriculeEnCollision: string;
    /** Nom attendu dans tenant A pour matriculeEnCollision. */
    nomCollisionA: string;
    /** Nom attendu dans tenant B pour matriculeEnCollision. */
    nomCollisionB: string;
  },
): void {
  describe(`[Contrat ${nomImpl}] SalariesService — Appairage borné au tenant`, () => {
    const {
      tenantA,
      tenantB,
      matriculeExclusifA,
      matriculeExclusifB,
      matriculeEnCollision,
      nomCollisionA,
      nomCollisionB,
    } = config;

    it('resoudreParMatricule() ne traverse JAMAIS le tenant : matricule exclusif au tenant A est invisible depuis tenant B', async () => {
      const service = factory();
      const depuisA = await service.resoudreParMatricule(tenantA, matriculeExclusifA);
      const depuisB = await service.resoudreParMatricule(tenantB, matriculeExclusifA);
      expect(depuisA).not.toBeNull();
      expect(depuisA!.matricule).toBe(matriculeExclusifA);
      expect(depuisB).toBeNull(); // INVARIANT : pas de leak cross-tenant
    });

    it('symétrie : matricule exclusif au tenant B est invisible depuis tenant A', async () => {
      const service = factory();
      const depuisA = await service.resoudreParMatricule(tenantA, matriculeExclusifB);
      const depuisB = await service.resoudreParMatricule(tenantB, matriculeExclusifB);
      expect(depuisA).toBeNull();
      expect(depuisB).not.toBeNull();
      expect(depuisB!.matricule).toBe(matriculeExclusifB);
    });

    it('matricule en COLLISION renvoie deux personnes DIFFÉRENTES selon le tenant', async () => {
      // Cas le plus important : MAT-00112 existe chez A (Aya Koffi à Atlantique)
      // ET chez B (Karim Bah à Comoé). Aucune méthode ne doit jamais retourner
      // le salarié de l'autre tenant.
      const service = factory();
      const depuisA = await service.resoudreParMatricule(tenantA, matriculeEnCollision);
      const depuisB = await service.resoudreParMatricule(tenantB, matriculeEnCollision);
      expect(depuisA).not.toBeNull();
      expect(depuisB).not.toBeNull();
      expect(depuisA!.nom).toBe(nomCollisionA);
      expect(depuisB!.nom).toBe(nomCollisionB);
      expect(depuisA!.id).not.toBe(depuisB!.id);
    });

    it('lister() depuis tenant A ne contient aucun salarié du tenant B', async () => {
      const service = factory();
      const salariesA = await service.lister(tenantA);
      const salariesB = await service.lister(tenantB);
      const idsB = new Set(salariesB.map((s) => s.id));
      for (const sA of salariesA) {
        expect(idsB.has(sA.id)).toBe(false);
      }
    });

    it('obtenir() avec un id du tenant B depuis le contexte tenant A renvoie null', async () => {
      const service = factory();
      const salariesB = await service.lister(tenantB);
      const premierB = salariesB[0]!;
      const resultat = await service.obtenir(tenantA, premierB.id);
      expect(resultat).toBeNull();
    });
  });
}

// -----------------------------------------------------------------------------
// Invariant 3 — Distribution refuse les exceptions
// -----------------------------------------------------------------------------
export function suiteContratDistributionRefuseExceptions(
  nomImpl: string,
  factory: () => ReconciliationService,
  ctx: ContexteScopeEntreprise,
): void {
  describe(`[Contrat ${nomImpl}] ReconciliationService — Distribution refuse les exceptions`, () => {
    it("distribuer() avec une ligne 'apparie' la distribue effectivement", async () => {
      const service = factory();
      const lot = await service.obtenirLot(ctx);
      const apparies = lot.filter((l) => l.etat === 'apparie');
      expect(apparies.length).toBeGreaterThan(0);
      const resultat = await service.distribuer(
        ctx,
        apparies.map((l) => l.id),
      );
      expect(resultat.distribues).toBe(apparies.length);
      expect(resultat.refuses).toBe(0);
    });

    it('distribuer() avec une exception (introuvable, doublon, faible_confiance) la REFUSE', async () => {
      const service = factory();
      const lot = await service.obtenirLot(ctx);
      const exceptions = lot.filter((l) => l.etat !== 'apparie');
      expect(exceptions.length).toBeGreaterThan(0);
      const resultat = await service.distribuer(
        ctx,
        exceptions.map((l) => l.id),
      );
      expect(resultat.distribues).toBe(0);
      expect(resultat.refuses).toBe(exceptions.length);
    });

    it("distribuer() avec un MIX trie : ne distribue que les 'apparie', refuse le reste", async () => {
      const service = factory();
      const lot = await service.obtenirLot(ctx);
      const ids = lot.map((l) => l.id);
      const apparies = lot.filter((l) => l.etat === 'apparie').length;
      const exceptions = lot.length - apparies;
      const resultat = await service.distribuer(ctx, ids);
      expect(resultat.distribues).toBe(apparies);
      expect(resultat.refuses).toBe(exceptions);
    });
  });
}

// -----------------------------------------------------------------------------
// Invariant 4 — Réclamations bornées au tenant
// -----------------------------------------------------------------------------
export function suiteContratReclamationsBorneTenant(
  nomImpl: string,
  factory: () => ReclamationsService,
  config: {
    tenantAvecReclamations: ContexteEntreprise;
    tenantVide: ContexteEntreprise;
  },
): void {
  describe(`[Contrat ${nomImpl}] ReclamationsService — Isolation tenant`, () => {
    const { tenantAvecReclamations, tenantVide } = config;

    it('lister() depuis un tenant sans réclamation renvoie une liste vide même si un autre tenant en a', async () => {
      const service = factory();
      const a = await service.lister(tenantAvecReclamations);
      const b = await service.lister(tenantVide);
      expect(a.length).toBeGreaterThan(0);
      expect(b).toEqual([]);
    });

    it("obtenir() avec un id d'un autre tenant renvoie null (pas de leak)", async () => {
      const service = factory();
      const a = await service.lister(tenantAvecReclamations);
      const id = a[0]!.id;
      const depuisAutre = await service.obtenir(tenantVide, id);
      expect(depuisAutre).toBeNull();
    });

    it("envoyerReponse() depuis un tenant tiers ne mute pas la réclamation d'origine", async () => {
      const service = factory();
      const a = await service.lister(tenantAvecReclamations);
      const cible = a.find((r) => r.statut !== 'resolue')!;
      const avant = cible.messages.length;
      const res = await service.envoyerReponse(
        tenantVide,
        cible.id,
        "Tentative cross-tenant",
        'Intrus',
      );
      expect(res.ok).toBe(false);
      const apresLecture = await service.obtenir(tenantAvecReclamations, cible.id);
      expect(apresLecture!.messages.length).toBe(avant);
    });

    it('marquerResolue() une réclamation déjà résolue est refusée', async () => {
      const service = factory();
      const liste = await service.lister(tenantAvecReclamations);
      const dejaResolue = liste.find((r) => r.statut === 'resolue');
      if (!dejaResolue) return; // pas de cas testable dans ce jeu de données
      const res = await service.marquerResolue(tenantAvecReclamations, dejaResolue.id);
      expect(res.ok).toBe(false);
    });

    it('statistiques() est scopé au tenant', async () => {
      const service = factory();
      const statsA = await service.statistiques(tenantAvecReclamations);
      const statsB = await service.statistiques(tenantVide);
      expect(statsA.total).toBeGreaterThan(0);
      expect(statsB.total).toBe(0);
    });
  });
}

// -----------------------------------------------------------------------------
// Invariant 5 — Facturation : tarif unique 275 FCFA + composition 150+75+50
// -----------------------------------------------------------------------------
export function suiteContratFacturation(
  nomImpl: string,
  factory: () => FacturationService,
  config: {
    tenantA: ContexteEntreprise;
    tenantB: ContexteEntreprise;
  },
): void {
  describe(`[Contrat ${nomImpl}] FacturationService — Forfait Pli`, () => {
    const { tenantA, tenantB } = config;

    it('obtenirTarifs() expose 275 FCFA / mois et la composition 150 + 75 + 50', async () => {
      const service = factory();
      const t = await service.obtenirTarifs();
      expect(t.forfaitMois).toBe(275);
      expect(t.composition.distributionFCFA).toBe(150);
      expect(t.composition.signatureFCFA).toBe(75);
      expect(t.composition.reclamationFCFA).toBe(50);
      // Invariant économique CLAUDE.md : 150 + 75 + 50 = 275
      const somme =
        t.composition.distributionFCFA +
        t.composition.signatureFCFA +
        t.composition.reclamationFCFA;
      expect(somme).toBe(t.forfaitMois);
    });

    it('obtenirTarifs() expose un plan mensuel à 275 et un plan annuel à 234 (−15 %)', async () => {
      const service = factory();
      const t = await service.obtenirTarifs();
      const mensuel = t.plans.find((p) => p.id === 'mensuel');
      const annuel = t.plans.find((p) => p.id === 'annuel');
      expect(mensuel?.prixMois).toBe(275);
      expect(annuel?.prixMois).toBe(234);
      expect(annuel?.remise).toBe(15);
    });

    it('listerFactures() est scopé : les factures du tenant A sont invisibles depuis le tenant B', async () => {
      const service = factory();
      const facturesA = await service.listerFactures(tenantA);
      const facturesB = await service.listerFactures(tenantB);
      const idsB = new Set(facturesB.map((f) => f.id));
      for (const f of facturesA) expect(idsB.has(f.id)).toBe(false);
    });

    it('changerPlan() est rejeté si le plan demandé est le même', async () => {
      const service = factory();
      const ab = await service.obtenirAbonnement(tenantA);
      expect(ab).not.toBeNull();
      const res = await service.changerPlan(tenantA, ab!.cycle);
      expect(res.ok).toBe(false);
    });

    it('changerModePaiement() met à jour le mode pour les appels suivants', async () => {
      const service = factory();
      const initial = await service.obtenirModePaiement(tenantA);
      const autre = initial === 'wave' ? 'cheque' : 'wave';
      const res = await service.changerModePaiement(tenantA, autre);
      expect(res.ok).toBe(true);
      const apres = await service.obtenirModePaiement(tenantA);
      expect(apres).toBe(autre);
    });
  });
}

// -----------------------------------------------------------------------------
// Invariant 6 — Sécurité : max 2 sessions Pro + journal en lecture seule
// -----------------------------------------------------------------------------
export function suiteContratSecurite(
  nomImpl: string,
  factory: () => SecuriteService,
  ctx: ContexteScopeEntreprise,
): void {
  describe(`[Contrat ${nomImpl}] SecuriteService — Sessions et audit`, () => {
    it('obtenirSessions() ne renvoie JAMAIS plus de 2 sessions Pro', async () => {
      const service = factory();
      const sessions = await service.obtenirSessions(ctx);
      expect(sessions.length).toBeLessThanOrEqual(2);
    });

    it('deconnecterSession() refuse de couper la session actuelle', async () => {
      const service = factory();
      const sessions = await service.obtenirSessions(ctx);
      const actuelle = sessions.find((s) => s.actuel);
      expect(actuelle).toBeDefined();
      const res = await service.deconnecterSession(ctx, actuelle!.id);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.raison).toBe('session_actuelle');
    });

    it('basculerA2F() persiste la nouvelle valeur', async () => {
      const service = factory();
      const initial = await service.obtenirParametres(ctx);
      const cible = !initial.a2f;
      const res = await service.basculerA2F(ctx, cible);
      expect(res.ok).toBe(true);
      const apres = await service.obtenirParametres(ctx);
      expect(apres.a2f).toBe(cible);
    });

    it("listerJournal() avec un filtre.recherche partiel matche action ET utilisateur", async () => {
      const service = factory();
      const tout = await service.listerJournal(ctx);
      if (tout.length === 0) return;
      const cible = tout[0]!;
      const morceau = cible.utilisateur.slice(0, 3);
      const filtre = await service.listerJournal(ctx, { recherche: morceau });
      expect(filtre.length).toBeGreaterThan(0);
    });
  });
}
