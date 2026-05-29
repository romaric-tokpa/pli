// Exécution des 3 suites de contrat contre l'implémentation MOCK.
//
// Quand l'API HTTP réelle arrivera en Phase 2, il suffira d'ajouter un fichier
// jumeau `invariants-http.test.ts` qui rejoue les MÊMES suites avec la
// factory HTTP. Les invariants continuent à protéger la prod sans
// modification du code de test.

import type { ContexteEntreprise } from '../contexte.js';
import {
  creerBulletinsServiceMock,
  creerFacturationServiceMock,
  creerReclamationsServiceMock,
  creerReconciliationServiceMock,
  creerSalariesServiceMock,
  creerSecuriteServiceMock,
} from '../index.js';
import {
  suiteContratAppairageBorneTenant,
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
