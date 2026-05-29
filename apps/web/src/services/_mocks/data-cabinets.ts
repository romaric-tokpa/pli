// Mocks portés depuis _wireframe/src/data-cabinets.jsx — espace cabinet.

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
    entreprisesIds: ['atlantique'],
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
    entreprisesIds: ['comoe'],
  },
];

export const GESTIONNAIRES_CABINETS: GestionnaireCabinet[] = [
  {
    id: 'uc-1',
    cabinetId: 'cab-ebrie',
    nom: 'Edmond Kouassi',
    role: 'responsable',
    email: 'edmond@cabinet-ebrie.ci',
    entreprisesAffectees: ['atlantique'],
    derniereConnexion: '27/02/2026 14:08',
    a2f: true,
  },
  {
    id: 'uc-2',
    cabinetId: 'cab-ebrie',
    nom: 'Nadège Touré',
    role: 'gestionnaire',
    email: 'nadege@cabinet-ebrie.ci',
    entreprisesAffectees: ['atlantique'],
    derniereConnexion: '27/02/2026 10:15',
    a2f: true,
  },
  {
    id: 'uc-4',
    cabinetId: 'cab-lagune-i',
    nom: 'Stéphanie Béhi',
    role: 'responsable',
    email: 'stephanie@lagune-interim.ci',
    entreprisesAffectees: ['comoe'],
    derniereConnexion: '27/02/2026 09:48',
    a2f: true,
  },
];

/** Cabinet courant pour la démo (cf. wireframe). */
export const CABINET_COURANT_ID: IdEntite = 'cab-ebrie';
export const GESTIONNAIRE_COURANT_ID: IdEntite = 'uc-1';
