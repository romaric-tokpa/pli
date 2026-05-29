// Énums de statut — littéraux DÉRIVÉS du wireframe (src/data.jsx, src/data-comptes.jsx).
// Toute divergence de vocabulaire (un libellé manquant, un accent en trop)
// se traduirait par une traduction silencieuse dans la couche services et,
// in fine, par des bugs invisibles. Ne pas modifier sans vérifier le mock.

/** Statut de distribution du bulletin par l'entreprise vers le salarié. */
export type StatutRemise = 'distribue' | 'en_attente';

/** Statut de consultation du bulletin par le salarié. */
export type StatutConsultation = 'consulte' | 'non_consulte';

/** Statut de la validation horodatée (anciennement "signature"). */
export type StatutSignature = 'non_requise' | 'non_signe' | 'requis_non_signe' | 'signe';

/**
 * État d'appairage d'un document dans le tableau de réconciliation
 * (Pli Pro · #/pro/bulletins/upload).
 *
 * Invariant CLAUDE.md : seuls les documents en état "apparie" peuvent
 * être distribués. Aucune exception ne franchit l'étape de distribution.
 */
export type EtatReconciliation = 'apparie' | 'introuvable' | 'doublon' | 'faible_confiance';
