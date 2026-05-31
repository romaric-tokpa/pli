// Mocks portés depuis _wireframe/src/data-cabinets.jsx — entreprises
// CLIENTES gérées par un cabinet. Distinctes des tenants Pli Pro (atlantique,
// comoe) — elles ne sont jamais accessibles depuis /pro, uniquement depuis
// /cabinet/entreprises/:id (et bornées au portefeuille du cabinet courant).

import type { Entreprise, MetriquesPortefeuilleEntreprise } from '@pli/types';

/**
 * 5 entreprises gérées par cab-ebrie + 4 par cab-lagune-i.
 * Toutes en `modeGestion: 'deleguee_cabinet'` et avec leur `cabinetId`.
 */
export const ENTREPRISES_CABINETS: Entreprise[] = [
  // ─── Portefeuille Cabinet Comptable Ébrié ────────────────────────────────
  {
    id: 'ec-cacao',
    nom: 'Cacao Plus SARL',
    secteur: 'Agroalimentaire',
    type: 'cabinet',
    statut: 'active',
    modeGestion: 'deleguee_cabinet',
    cabinetId: 'cab-ebrie',
    effectif: 48,
  },
  {
    id: 'ec-ivoire-log',
    nom: 'Ivoire Logistique',
    secteur: 'Transport',
    type: 'cabinet',
    statut: 'active',
    modeGestion: 'deleguee_cabinet',
    cabinetId: 'cab-ebrie',
    effectif: 108,
  },
  {
    id: 'ec-lagune',
    nom: 'Lagune Services',
    secteur: 'Services',
    type: 'cabinet',
    statut: 'essai',
    modeGestion: 'deleguee_cabinet',
    cabinetId: 'cab-ebrie',
    effectif: 18,
  },
  {
    id: 'ec-sahel',
    nom: 'Sahel Négoce',
    secteur: 'Commerce',
    type: 'cabinet',
    statut: 'impaye',
    modeGestion: 'deleguee_cabinet',
    cabinetId: 'cab-ebrie',
    effectif: 22,
  },
  {
    id: 'ec-ebrie-dist',
    nom: 'Ébrié Distribution',
    secteur: 'Commerce',
    type: 'cabinet',
    statut: 'active',
    modeGestion: 'deleguee_cabinet',
    cabinetId: 'cab-ebrie',
    effectif: 40,
  },
  // ─── Portefeuille Lagune Intérim ─────────────────────────────────────────
  {
    id: 'ec-bouake-ph',
    nom: 'Bouaké Pharma',
    secteur: 'Santé',
    type: 'cabinet',
    statut: 'active',
    modeGestion: 'deleguee_cabinet',
    cabinetId: 'cab-lagune-i',
    effectif: 32,
  },
  {
    id: 'ec-abidjan-tech',
    nom: 'Abidjan Tech',
    secteur: 'Informatique',
    type: 'cabinet',
    statut: 'active',
    modeGestion: 'deleguee_cabinet',
    cabinetId: 'cab-lagune-i',
    effectif: 36,
  },
  {
    id: 'ec-baobab-mf',
    nom: 'Baobab Microfinance',
    secteur: 'Finance',
    type: 'cabinet',
    statut: 'active',
    modeGestion: 'deleguee_cabinet',
    cabinetId: 'cab-lagune-i',
    effectif: 58,
  },
  {
    id: 'ec-comoe-ind',
    nom: 'Comoé Industries',
    secteur: 'Manufacturing',
    type: 'cabinet',
    statut: 'active',
    modeGestion: 'deleguee_cabinet',
    cabinetId: 'cab-lagune-i',
    effectif: 285,
  },
];

/**
 * Métriques d'opération par entreprise du portefeuille (Février 2026).
 * Valeurs portées verbatim de data-cabinets.jsx. AUCUN montant — uniquement
 * des compteurs et un taux. Conforme à l'invariant 1 (net jamais en liste).
 */
export const METRIQUES_PORTEFEUILLE_CABINET: MetriquesPortefeuilleEntreprise[] = [
  // cab-ebrie
  {
    entrepriseId: 'ec-cacao',
    salaries: 48,
    bulletinsMois: 47,
    bulletinsAUploader: 0,
    bulletinsADistribuer: 0,
    relancesEnAttente: 4,
    consultation: 0.79,
  },
  {
    entrepriseId: 'ec-ivoire-log',
    salaries: 108,
    bulletinsMois: 0,
    bulletinsAUploader: 108,
    bulletinsADistribuer: 0,
    relancesEnAttente: 0,
    consultation: 0.84,
  },
  {
    entrepriseId: 'ec-lagune',
    salaries: 18,
    bulletinsMois: 18,
    bulletinsAUploader: 0,
    bulletinsADistribuer: 0,
    relancesEnAttente: 3,
    consultation: 0.72,
  },
  {
    entrepriseId: 'ec-sahel',
    salaries: 22,
    bulletinsMois: 22,
    bulletinsAUploader: 0,
    bulletinsADistribuer: 22,
    relancesEnAttente: 7,
    consultation: 0.68,
  },
  {
    entrepriseId: 'ec-ebrie-dist',
    salaries: 40,
    bulletinsMois: 40,
    bulletinsAUploader: 0,
    bulletinsADistribuer: 0,
    relancesEnAttente: 6,
    consultation: 0.82,
  },
  // cab-lagune-i
  {
    entrepriseId: 'ec-bouake-ph',
    salaries: 32,
    bulletinsMois: 30,
    bulletinsAUploader: 0,
    bulletinsADistribuer: 2,
    relancesEnAttente: 5,
    consultation: 0.77,
  },
  {
    entrepriseId: 'ec-abidjan-tech',
    salaries: 36,
    bulletinsMois: 35,
    bulletinsAUploader: 0,
    bulletinsADistribuer: 0,
    relancesEnAttente: 1,
    consultation: 0.94,
  },
  {
    entrepriseId: 'ec-baobab-mf',
    salaries: 58,
    bulletinsMois: 56,
    bulletinsAUploader: 0,
    bulletinsADistribuer: 0,
    relancesEnAttente: 4,
    consultation: 0.88,
  },
  {
    entrepriseId: 'ec-comoe-ind',
    salaries: 285,
    bulletinsMois: 285,
    bulletinsAUploader: 0,
    bulletinsADistribuer: 0,
    relancesEnAttente: 18,
    consultation: 0.91,
  },
];
