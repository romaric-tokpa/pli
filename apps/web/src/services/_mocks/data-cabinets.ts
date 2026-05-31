// Mocks portés depuis _wireframe/src/data-cabinets.jsx — espace cabinet.
//
// Sub-lot 11b : les `entreprisesIds` pointent désormais sur les entreprises
// CLIENTES du portefeuille (data-portefeuille-cabinet.ts), pas sur les
// tenants Pli Pro directs (atlantique, comoe). Le cloisonnement entre les
// deux mondes (Pro / Cabinet) est ainsi total.

import type { Cabinet, GestionnaireCabinet, IdEntite } from '@pli/types';

export const CABINETS: Cabinet[] = [
  {
    id: 'cab-ebrie',
    nom: 'Cabinet Comptable Ébrié',
    type: 'comptable',
    contact: 'Edmond Kouassi',
    email: 'contact@cabinet-ebrie.ci',
    telephone: '+225 27 20 24 18 36',
    adresse: 'Cocody, Riviera 3 — Abidjan',
    modeFacturation: 'consolide',
    remisePartenaire: 10,
    tauxCommission: null,
    statut: 'actif',
    dateContrat: '10/03/2024',
    entreprisesIds: ['ec-cacao', 'ec-ivoire-log', 'ec-lagune', 'ec-sahel', 'ec-ebrie-dist'],
  },
  {
    id: 'cab-lagune-i',
    nom: 'Lagune Intérim',
    type: 'interim',
    contact: 'Stéphanie Béhi',
    email: 'operations@lagune-interim.ci',
    telephone: '+225 27 22 41 55 12',
    adresse: 'Plateau, Avenue Chardy — Abidjan',
    modeFacturation: 'par_entreprise',
    remisePartenaire: null,
    tauxCommission: 15,
    statut: 'actif',
    dateContrat: '22/06/2024',
    entreprisesIds: ['ec-bouake-ph', 'ec-abidjan-tech', 'ec-baobab-mf', 'ec-comoe-ind'],
  },
];

export const GESTIONNAIRES_CABINETS: GestionnaireCabinet[] = [
  // Cabinet Comptable Ébrié
  {
    id: 'uc-1',
    cabinetId: 'cab-ebrie',
    nom: 'Edmond Kouassi',
    role: 'responsable',
    email: 'edmond@cabinet-ebrie.ci',
    entreprisesAffectees: ['ec-cacao', 'ec-ivoire-log', 'ec-lagune', 'ec-sahel', 'ec-ebrie-dist'],
    derniereConnexion: '27/02/2026 14:08',
    a2f: true,
  },
  {
    id: 'uc-2',
    cabinetId: 'cab-ebrie',
    nom: 'Nadège Touré',
    role: 'gestionnaire',
    email: 'nadege@cabinet-ebrie.ci',
    entreprisesAffectees: ['ec-cacao', 'ec-ebrie-dist'],
    derniereConnexion: '27/02/2026 10:15',
    a2f: true,
  },
  {
    id: 'uc-3',
    cabinetId: 'cab-ebrie',
    nom: 'Pascal Tanoh',
    role: 'gestionnaire',
    email: 'pascal@cabinet-ebrie.ci',
    entreprisesAffectees: ['ec-ivoire-log', 'ec-sahel'],
    derniereConnexion: '26/02/2026 17:32',
    a2f: false,
  },
  // Lagune Intérim
  {
    id: 'uc-4',
    cabinetId: 'cab-lagune-i',
    nom: 'Stéphanie Béhi',
    role: 'responsable',
    email: 'stephanie@lagune-interim.ci',
    entreprisesAffectees: ['ec-bouake-ph', 'ec-abidjan-tech', 'ec-baobab-mf', 'ec-comoe-ind'],
    derniereConnexion: '27/02/2026 09:48',
    a2f: true,
  },
  {
    id: 'uc-5',
    cabinetId: 'cab-lagune-i',
    nom: 'Yvan Toh',
    role: 'gestionnaire',
    email: 'yvan@lagune-interim.ci',
    entreprisesAffectees: ['ec-bouake-ph', 'ec-comoe-ind'],
    derniereConnexion: '26/02/2026 16:14',
    a2f: true,
  },
];

/** Cabinet courant pour la démo (cf. wireframe). */
export const CABINET_COURANT_ID: IdEntite = 'cab-ebrie';
export const GESTIONNAIRE_COURANT_ID: IdEntite = 'uc-1';
