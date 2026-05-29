// Types primitifs partagés à tout le domaine métier.
// Aliases sémantiques (pas de "branding") : on privilégie la lisibilité
// sans coût runtime ni friction d'ergonomie pour la Phase 0.

export type IdEntite = string;

/** Identifiant de période au format "AAAA-MM" (ex. "2026-02"). */
export type Periode = string;

/**
 * Date au format affichage "JJ/MM/AAAA" ou "JJ/MM/AAAA HH:MM".
 * Note : on conserve la convention texte du wireframe. Le passage à
 * un type Date ISO sera fait en Phase 1 lors de la persistance.
 */
export type DateJJMMAAAA = string;

/** Montant en FCFA, entier (pas de centimes). */
export type MontantFCFA = number;

/** Téléphone ivoirien au format affichage "+225 XX XX XX XX XX". */
export type Telephone225 = string;

/** Matricule salarié dans le registre de son employeur (ex. "MAT-00112"). */
export type MatriculeSalarie = string;
