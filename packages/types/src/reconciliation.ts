// Ligne de réconciliation — un document = une ligne dans le tableau de
// l'écran #/pro/bulletins/upload après ingestion (fichier de correspondance,
// convention de nommage ou PDF groupé).
//
// Invariants CLAUDE.md portés au niveau des règles métier (étape 7, services) :
//  - l'appairage est BORNÉ au registre de l'entreprise du contexte
//  - SEULES les lignes en état "apparie" peuvent être distribuées
//  - une exception n'est JAMAIS distribuée

import type { IdEntite, MatriculeSalarie, Periode } from './commun.js';
import type { EtatReconciliation } from './statuts.js';

export interface LigneReconciliation {
  id: IdEntite;
  fichier: string;
  /** Matricule détecté par l'ingestion (peut être absent si extraction impossible). */
  matriculeDetecte: MatriculeSalarie | null;
  /** Nom inféré du salarié (null tant que non apparié à un Salarie connu). */
  nom: string | null;
  service: string | null;
  periode: Periode;
  etat: EtatReconciliation;
  /**
   * Score de confiance OCR/découpage (0–100), présent uniquement
   * quand etat === "faible_confiance".
   */
  confiance?: number;
}
