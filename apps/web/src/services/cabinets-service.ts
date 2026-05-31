// Service cabinet — portefeuille d'entreprises clientes.
//
// CLOISONNEMENT (CLAUDE.md invariant 5) — cette interface modélise les DEUX
// modes d'accès du cabinet :
//
//  1. MODE PORTEFEUILLE (`ContextePortefeuilleCabinet`)
//     Le cabinet liste, gère et supervise son portefeuille d'entreprises
//     (création déléguée, stats consolidées, facturation, gestionnaires).
//     Aucune donnée intra-entreprise ne transite ici.
//
//  2. MODE ENTREPRISE SCELLÉE (`ContexteCabinet`)
//     Le cabinet opère AU NOM D'UNE entreprise précise du portefeuille.
//     Les services scopés (Salaries/Bulletins/Réclamations) acceptent ce
//     contexte via `ContexteScopeEntreprise = ContexteEntreprise | ContexteCabinet`.
//     `appartientAuPortefeuille` est l'unique pont entre les deux mondes :
//     il refuse l'entrée si l'entrepriseId visé n'est PAS dans le portefeuille
//     du cabinet — empêchant ainsi une URL forgée d'atteindre une entreprise
//     hors gestion.
//
// L'invariant « cloisonnement entre entreprises clientes » est porté par le
// TYPE : il n'existe AUCUN ContexteCabinet pluralisé. Un ContexteCabinet pointe
// toujours sur UNE entreprise. Pour opérer sur une autre entreprise du
// portefeuille, il faut explicitement construire un nouveau ContexteCabinet.

import type {
  Cabinet,
  Entreprise,
  GestionnaireCabinet,
  IdEntite,
  MetriquesPortefeuilleEntreprise,
} from '@pli/types';
import type {
  ContexteEspaceCabinet,
  ContextePortefeuilleCabinet,
} from './contexte.js';

export interface CabinetsService {
  /**
   * Profil du cabinet courant. Accessible depuis les deux modes (la
   * sidebar de l'espace cabinet l'affiche partout).
   */
  obtenirCabinet(ctx: ContexteEspaceCabinet): Promise<Cabinet | null>;

  /**
   * Liste les gestionnaires du cabinet courant. Accessible depuis les deux
   * modes (le footer de la sidebar affiche le gestionnaire connecté).
   */
  listerGestionnaires(ctx: ContexteEspaceCabinet): Promise<GestionnaireCabinet[]>;

  /**
   * Profil d'un gestionnaire précis du cabinet courant. Renvoie `null` si
   * le gestionnaire n'appartient PAS à ce cabinet (cloisonnement). En
   * Phase 1, l'authentification garantira que l'utilisateur ne demande
   * que son propre profil.
   */
  obtenirGestionnaire(
    ctx: ContexteEspaceCabinet,
    gestionnaireId: IdEntite,
  ): Promise<GestionnaireCabinet | null>;

  /**
   * Portefeuille d'entreprises du cabinet courant — uniquement en mode
   * portefeuille (lister, ajouter, naviguer). Le mode entreprise scellée
   * n'a pas besoin de cette méthode : il opère sur UNE entreprise déjà
   * sélectionnée.
   */
  obtenirPortefeuille(ctx: ContextePortefeuilleCabinet): Promise<Entreprise[]>;

  /**
   * Vérifie qu'une entreprise précise est dans le portefeuille du cabinet
   * courant — UNIQUE PONT entre mode portefeuille et mode entreprise
   * scellée. Une URL `/cabinet/entreprises/<id>` doit appeler cette méthode
   * avant de construire un `ContexteCabinet` pour cet id ; sinon, un id
   * forgé pourrait théoriquement traverser le cloisonnement.
   */
  appartientAuPortefeuille(
    ctx: ContextePortefeuilleCabinet,
    entrepriseId: IdEntite,
  ): Promise<boolean>;

  /**
   * Métriques d'opération du portefeuille (compteurs et taux de
   * consultation par entreprise). N'expose JAMAIS de montants
   * (CLAUDE.md invariant 1) — le nom du type `MetriquesPortefeuilleEntreprise`
   * et le grep sur les champs (`brut|cnps|its|net`) le garantissent.
   */
  obtenirMetriquesPortefeuille(
    ctx: ContextePortefeuilleCabinet,
  ): Promise<MetriquesPortefeuilleEntreprise[]>;
}
