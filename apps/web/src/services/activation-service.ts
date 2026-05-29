// Service activation salarié — création du compte personnel (B2C).
//
// Invariant CLAUDE.md (libellé juridique) : **« acceptation des CGU
// bloquante »**. Le compte personnel B2C ne peut pas être activé sans
// acceptation explicite des CGU de Pli. C'est l'invariant juridique de la
// structure à deux contrats — le salarié accepte directement les CGU de Pli,
// indépendamment de son employeur.
//
// La règle vit ICI, dans le service. Le bouton « Envoyer le code SMS »
// disabled côté UI n'est qu'un MIROIR UX — un bypass du disabled n'aboutit
// à RIEN car activerCompte refuse explicitement.

import type { IdEntite } from '@pli/types';

export interface DonneesActivation {
  /** E-mail professionnel saisi à l'étape 1. */
  emailPro: string;
  /** Téléphone perso saisi à l'étape 4 — clé durable du compte. */
  telPerso: string;
  /** E-mail perso optionnel — filet de récupération. */
  emailPersoOpt?: string;
  /**
   * Acceptation explicite des CGU. **Doit être true** pour que l'activation
   * réussisse — c'est l'invariant juridique.
   */
  cguAcceptees: boolean;
}

export type ResultatActivation =
  | { ok: true; comptePersonnelId: IdEntite; rattachementId: IdEntite }
  | { ok: false; raison: 'cgu_non_acceptees' | 'email_inconnu' | 'compte_existant' };

export interface ResultatVerificationEmail {
  ok: boolean;
  rattachementId?: IdEntite;
  entrepriseNom?: string;
  /** Erreur lisible à afficher dans le TextField (« Adresse inconnue… »). */
  erreur?: string;
}

export interface ActivationService {
  /**
   * Vérifie qu'une adresse e-mail pro correspond à un rattachement ACTIF
   * dans le registre. Step 3 → 4 du parcours d'activation.
   */
  verifierEmailPro(emailPro: string): Promise<ResultatVerificationEmail>;

  /**
   * Active un compte personnel.
   * **REFUSE avec `cgu_non_acceptees`** si `donnees.cguAcceptees !== true`.
   * Le test d'invariant verrouille ce refus.
   */
  activerCompte(donnees: DonneesActivation): Promise<ResultatActivation>;
}
