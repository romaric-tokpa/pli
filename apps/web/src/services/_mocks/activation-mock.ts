// Implémentation mock de ActivationService.
//
// Le refus CGU est porté ICI, en premier dans le tri des branches — toute
// modification ultérieure du service (HTTP en Phase 1) DOIT garder ce refus
// en premier. Le test d'invariant `[Contrat mock] ActivationService …`
// claque sinon.

import type {
  ActivationService,
  DonneesActivation,
  ResultatActivation,
  ResultatVerificationEmail,
} from '../activation-service.js';
import { COMPTES_PERSONNELS, RATTACHEMENTS } from './data-coffre.js';

function normaliserTel(tel: string): string {
  return tel.replace(/\s+/g, '');
}

export function creerActivationServiceMock(): ActivationService {
  return {
    async verifierEmailPro(emailPro): Promise<ResultatVerificationEmail> {
      const cible = emailPro.trim().toLowerCase();
      const rat = RATTACHEMENTS.find(
        (r) => r.emailPro.toLowerCase() === cible && r.statut === 'actif',
      );
      if (!rat) {
        return {
          ok: false,
          erreur: 'Adresse inconnue ou compte inactif. Contactez votre employeur.',
        };
      }
      return { ok: true, rattachementId: rat.id, entrepriseNom: rat.entrepriseNom };
    },

    async activerCompte(donnees: DonneesActivation): Promise<ResultatActivation> {
      // INVARIANT JURIDIQUE — CGU bloquante. Aucune autre vérification ne
      // doit être faite avant ce refus.
      if (!donnees.cguAcceptees) return { ok: false, raison: 'cgu_non_acceptees' };

      const rat = RATTACHEMENTS.find(
        (r) =>
          r.emailPro.toLowerCase() === donnees.emailPro.trim().toLowerCase() &&
          r.statut === 'actif',
      );
      if (!rat) return { ok: false, raison: 'email_inconnu' };

      const tel = normaliserTel(donnees.telPerso);
      const existant = COMPTES_PERSONNELS.find(
        (c) => normaliserTel(c.telephonePerso) === tel,
      );
      if (existant) {
        return { ok: false, raison: 'compte_existant' };
      }

      // En mock on ne persiste pas de nouveau compte ; on retourne juste un
      // identifiant fictif pour permettre à l'UI de basculer sur l'écran
      // « Compte personnel créé ». L'HTTP en Phase 1 retournera l'id réel.
      return {
        ok: true,
        comptePersonnelId: `cp-nouveau-${tel.slice(-4)}`,
        rattachementId: rat.id,
      };
    },
  };
}
