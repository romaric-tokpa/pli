// Mocks portés depuis _wireframe/src/admin-data.jsx — console opérateur.
//
// Échantillon minimal pour Phase 0 (2 entreprises seulement). L'écran admin
// complet est porté à l'étape 12 ; le mock sera enrichi à ce moment.

import type { Entreprise } from '@pli/types';

export const ENTREPRISES_PLATEFORME: Entreprise[] = [
  {
    id: 'atlantique',
    nom: 'Groupe Atlantique CI',
    secteur: 'Industrie',
    type: 'directe',
    statut: 'active',
    modeGestion: 'directe',
    cabinetId: null,
    effectif: 24,
  },
  {
    id: 'comoe',
    nom: 'Comoé Industries',
    secteur: 'Manufacturing',
    type: 'directe',
    statut: 'active',
    modeGestion: 'directe',
    cabinetId: null,
    effectif: 287,
  },
];
