// Table de correspondance des icônes legacy (lucide UMD utilisé par le wireframe)
// vers la nomenclature canonique de lucide-react v0.469.
//
// Utilisation : ce fichier est principalement DOCUMENTAIRE. Quand un écran est
// porté depuis _wireframe/src/*.jsx vers apps/web/src/, remplacer chaque
// occurrence `<Icon name="LegacyName" />` par `<Icon name="CanoniqueName" />`.
// TypeScript refusera tout `name="LegacyName"` car `IconName` est dérivé de
// `keyof typeof icons`, qui ne contient plus les anciens alias dans v0.469.
//
// Audit source : grep de tous les noms d'icônes du wireframe + cross-reference
// avec le registre lucide-react v0.469. Confirmé sur 128 noms utilisés au total
// — 13 legacy, 115 déjà canoniques.
//
// La constante `ALIAS_ICONES_LEGACY` peut servir, à l'étape 8+, à un script de
// migration automatique (sed ou codemod) si le besoin se présente.

import type { IconName } from './icon.js';

/**
 * Mapping legacy lucide UMD → canonique lucide-react v0.469.
 * Toute clé absente ici est soit toujours valide (présente dans v0.469),
 * soit un nom inventé hors registre — dans ce cas, vérifier le rendu attendu.
 */
export const ALIAS_ICONES_LEGACY = {
  AlertCircle: 'CircleAlert',
  AlertTriangle: 'TriangleAlert',
  BarChart3: 'ChartBarBig',
  CheckCircle2: 'CircleCheckBig',
  HelpCircle: 'CircleHelp',
  Home: 'House',
  LineChart: 'ChartLine',
  Loader2: 'LoaderCircle',
  MinusCircle: 'CircleMinus',
  MoreVertical: 'EllipsisVertical',
  PieChart: 'ChartPie',
  PlusCircle: 'CirclePlus',
  UploadCloud: 'CloudUpload',
} as const satisfies Record<string, IconName>;

export type NomIconeLegacy = keyof typeof ALIAS_ICONES_LEGACY;
