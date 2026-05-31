// Exécution des 3 suites de contrat contre l'implémentation MOCK.
//
// Quand l'API HTTP réelle arrivera en Phase 2, il suffira d'ajouter un fichier
// jumeau `invariants-http.test.ts` qui rejoue les MÊMES suites avec la
// factory HTTP. Les invariants continuent à protéger la prod sans
// modification du code de test.

import type {
  ContexteAdmin,
  ContexteEntreprise,
  ContextePortefeuilleCabinet,
} from '../contexte.js';
import {
  creerAdminServiceMock,
  creerBulletinsServiceMock,
  creerCabinetsServiceMock,
  creerFacturationServiceMock,
  creerReclamationsServiceMock,
  creerReconciliationServiceMock,
  creerSalariesServiceMock,
  creerSecuriteServiceMock,
} from '../index.js';
import {
  suiteContratAdminAgregat,
  suiteContratAppairageBorneTenant,
  suiteContratCloisonnementCabinet,
  suiteContratDistributionRefuseExceptions,
  suiteContratFacturation,
  suiteContratNetJamaisEnListe,
  suiteContratReclamationsBorneTenant,
  suiteContratSecurite,
} from './contrats.js';

const CTX_ATLANTIQUE: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

const CTX_COMOE: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'comoe',
};

// Invariant 1 — Net jamais dans une liste
suiteContratNetJamaisEnListe('mock', creerBulletinsServiceMock, CTX_ATLANTIQUE);

// Invariant 2 — Appairage borné au tenant (avec cas de collision MAT-00112)
suiteContratAppairageBorneTenant('mock', creerSalariesServiceMock, {
  tenantA: CTX_ATLANTIQUE,
  tenantB: CTX_COMOE,
  matriculeExclusifA: 'MAT-00118', // Kouadio N'Guessan — Atlantique uniquement
  matriculeExclusifB: 'MAT-00301', // Naomi Kouakou — Comoé uniquement
  matriculeEnCollision: 'MAT-00112', // Aya Koffi @ Atlantique vs Karim Bah @ Comoé
  nomCollisionA: 'Aya Koffi',
  nomCollisionB: 'Karim Bah',
});

// Invariant 3 — Distribution refuse les exceptions
suiteContratDistributionRefuseExceptions('mock', creerReconciliationServiceMock, CTX_ATLANTIQUE);

// Invariant 4 — Réclamations bornées au tenant
suiteContratReclamationsBorneTenant('mock', creerReclamationsServiceMock, {
  tenantAvecReclamations: CTX_ATLANTIQUE,
  tenantVide: CTX_COMOE,
});

// Invariant 5 — Forfait Pli (275 FCFA = 150 + 75 + 50) cohérent
suiteContratFacturation('mock', creerFacturationServiceMock, {
  tenantA: CTX_ATLANTIQUE,
  tenantB: CTX_COMOE,
});

// Invariant 6 — Sessions Pro et journal d'audit
suiteContratSecurite('mock', creerSecuriteServiceMock, CTX_ATLANTIQUE);

// Invariant 7 — Cloisonnement cabinet (PORTEFEUILLE invisible entre cabinets,
// PONT appartientAuPortefeuille refuse les ids forgés). Le test croise deux
// cabinets (Cabinet Comptable Ébrié + Lagune Intérim) et un id inexistant.
const CTX_CAB_EBRIE: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: 'cab-ebrie',
};
const CTX_CAB_LAGUNE: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: 'cab-lagune-i',
};
suiteContratCloisonnementCabinet('mock', creerCabinetsServiceMock, {
  ctxCabinetA: CTX_CAB_EBRIE,
  ctxCabinetB: CTX_CAB_LAGUNE,
  entrepriseAuPortefeuilleA: 'ec-cacao', // Cacao Plus SARL — cab-ebrie
  entrepriseAuPortefeuilleB: 'ec-bouake-ph', // Bouaké Pharma — cab-lagune-i
  entrepriseInexistante: 'ec-inexistante-forgee',
  gestionnaireDuCabinetB: 'uc-4', // Stéphanie Béhi — cab-lagune-i
});

// Invariant 8 — AdminService : agrégat cross-tenant légitime, net jamais agrégé,
// impersonation produit une entrée d'audit (vérification complète en 12d).
const CTX_ADMIN: ContexteAdmin = { type: 'admin', adminId: 'u1' };
suiteContratAdminAgregat('mock', creerAdminServiceMock, CTX_ADMIN);
