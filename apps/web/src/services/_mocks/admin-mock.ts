// Implémentation mock de AdminService.
//
// Sub-lot 12c : ajoute santé système, journal d'audit append-only et
// coffres dormants. Impersonation / suspension persistent désormais dans le
// journal interne — vérifié par un test e2e qui appelle impersonnerEntreprise
// puis lit le journal via listerJournalAdmin.

import type {
  ContexteAdmin,
} from '../contexte.js';
import type { AdminService } from '../admin-service.js';
import type {
  AnnoncePlateforme,
  Conformite,
  EntreeAuditAdmin,
  IdEntite,
  TicketSupport,
  UtilisateurPlateforme,
} from '@pli/types';
import { CABINETS } from './data-cabinets.js';
import {
  ACTIVITE_PLATEFORME,
  ANNONCES_PLATEFORME,
  AUDIT_ADMIN_SEED,
  COFFRES_DORMANTS_DEMO,
  CONFORMITE_DEMO,
  ENTREPRISES_PLATEFORME,
  EVOLUTION_MRR_12M,
  IMPAYES,
  INCIDENTS_HISTORIQUE,
  METRIQUES_CABINETS_PLATEFORME,
  METRIQUES_ENTREPRISES_PLATEFORME,
  MODELES_EMAIL,
  PARAMETRES_PLATEFORME_DEMO,
  REVENU_PAR_SOURCE,
  SERVICES_SANTE,
  TICKETS_SUPPORT,
  UTILISATEURS_PLATEFORME,
  VOLUMETRIE_30J,
} from './data-admin.js';

let compteurJournal = 1;
function nouveauJournalId(): string {
  return `la-${String(compteurJournal++).padStart(4, '0')}`;
}

/**
 * Horodatage figé pour les nouvelles entrées d'audit en démo (l'environnement
 * de mock interdit Date.now côté workflows — voir tests). On garde un format
 * `JJ/MM/AAAA HH:MM` cohérent avec le seed.
 */
const HORODATE_DEMO = '27/02/2026 14:08';
const IP_OPERATEUR_DEMO = '196.207.62.18';
const ACTEUR_OPERATEUR_DEMO = 'Drissa Diomandé';

export function creerAdminServiceMock(): AdminService {
  // ─── État interne (mutable) ──────────────────────────────────────────────
  // Le journal admin est INITIALISÉ avec le seed et persiste les nouvelles
  // entrées d'impersonation/suspension dans l'ORDRE D'AJOUT.
  // Append-only : l'API publique n'expose AUCUNE méthode de suppression.
  const journal: EntreeAuditAdmin[] = [...AUDIT_ADMIN_SEED];

  function nommerEntreprise(id: IdEntite): string {
    return ENTREPRISES_PLATEFORME.find((e) => e.id === id)?.nom ?? id;
  }

  function poserEntree(entree: Omit<EntreeAuditAdmin, 'id'>): string {
    const id = nouveauJournalId();
    journal.push({ id, ...entree });
    return id;
  }

  return {
    async obtenirMetriquesPlateforme(_ctx: ContexteAdmin) {
      const actives = ENTREPRISES_PLATEFORME.filter((e) => e.statut === 'active');
      const idsActives = new Set(actives.map((e) => e.id));
      const metsActives = METRIQUES_ENTREPRISES_PLATEFORME.filter((m) =>
        idsActives.has(m.entrepriseId),
      );
      const mrrTotal = METRIQUES_ENTREPRISES_PLATEFORME.reduce((s, m) => s + m.mrr, 0);
      const salariesCumules = metsActives.reduce((s, m) => s + m.salaries, 0);
      const bulletinsMois = metsActives.reduce((s, m) => s + m.bulletinsMois, 0);
      const tauxConsultationMoyen = metsActives.length
        ? metsActives.reduce((s, m) => s + m.consultation, 0) / metsActives.length
        : 0;
      return {
        entreprisesActives: actives.length,
        salariesCumules,
        bulletinsMois,
        mrrTotal,
        arrProjete: mrrTotal * 12,
        tauxConsultationMoyen,
      };
    },

    async obtenirEvolutionMrr(_ctx) {
      return EVOLUTION_MRR_12M;
    },

    async obtenirRevenuParSource(_ctx) {
      return REVENU_PAR_SOURCE;
    },

    async listerActivitePlateforme(_ctx) {
      return ACTIVITE_PLATEFORME;
    },

    async listerImpayes(_ctx) {
      return IMPAYES;
    },

    async listerEntreprises(_ctx: ContexteAdmin) {
      return ENTREPRISES_PLATEFORME;
    },

    async listerMetriquesEntreprises(_ctx) {
      return METRIQUES_ENTREPRISES_PLATEFORME;
    },

    async listerCabinets(_ctx) {
      return CABINETS;
    },

    async listerMetriquesCabinets(_ctx) {
      return METRIQUES_CABINETS_PLATEFORME;
    },

    async listerServicesSante(_ctx) {
      return SERVICES_SANTE;
    },

    async obtenirVolumetrie30j(_ctx) {
      return VOLUMETRIE_30J;
    },

    async listerIncidents(_ctx) {
      return INCIDENTS_HISTORIQUE;
    },

    async obtenirCoffresDormants(_ctx) {
      return COFFRES_DORMANTS_DEMO;
    },

    async listerJournalAdmin(_ctx, filtre) {
      // Append-only ⇒ retour DESCENDANT (plus récent d'abord), sans mutation.
      const tous = [...journal].reverse();
      if (!filtre) return tous;
      return tous.filter((e) => {
        if (filtre.type && e.type !== filtre.type) return false;
        if (filtre.recherche) {
          const hay = `${e.acteur} ${e.cible} ${e.action}`.toLowerCase();
          if (!hay.includes(filtre.recherche.toLowerCase())) return false;
        }
        return true;
      });
    },

    async listerUtilisateursPlateforme(_ctx): Promise<UtilisateurPlateforme[]> {
      return UTILISATEURS_PLATEFORME;
    },

    async reinitialiserMotDePasseUtilisateur(_ctx, utilisateurId) {
      const u = UTILISATEURS_PLATEFORME.find((x) => x.id === utilisateurId);
      const journalId = poserEntree({
        date: HORODATE_DEMO,
        acteur: ACTEUR_OPERATEUR_DEMO,
        cible: u?.nom ?? utilisateurId,
        action: 'Réinitialisation du mot de passe utilisateur',
        ip: IP_OPERATEUR_DEMO,
        type: 'donnees',
      });
      return { journalId };
    },

    async listerTicketsSupport(_ctx): Promise<TicketSupport[]> {
      return TICKETS_SUPPORT;
    },

    async marquerTicketResolu(_ctx, ticketId) {
      const t = TICKETS_SUPPORT.find((x) => x.id === ticketId);
      const journalId = poserEntree({
        date: HORODATE_DEMO,
        acteur: ACTEUR_OPERATEUR_DEMO,
        cible: t?.numero ?? ticketId,
        action: 'Ticket support marqué comme résolu',
        ip: IP_OPERATEUR_DEMO,
        type: 'support',
      });
      return { journalId };
    },

    async obtenirConformite(_ctx): Promise<Conformite> {
      return CONFORMITE_DEMO;
    },

    async traiterDemandeRgpd(_ctx, demandeId) {
      const d = CONFORMITE_DEMO.demandesRgpd.find((x) => x.id === demandeId);
      const journalId = poserEntree({
        date: HORODATE_DEMO,
        acteur: ACTEUR_OPERATEUR_DEMO,
        cible: d ? `Demande RGPD ${d.type} — ${d.demandeur}` : `Demande RGPD ${demandeId}`,
        action: 'Traitement d\'une demande RGPD',
        ip: IP_OPERATEUR_DEMO,
        type: 'donnees',
      });
      return { journalId };
    },

    async listerAnnonces(_ctx): Promise<AnnoncePlateforme[]> {
      return ANNONCES_PLATEFORME;
    },

    async listerModelesEmail(_ctx) {
      return MODELES_EMAIL;
    },

    async programmerAnnonce(_ctx, titre, segment, canal) {
      const journalId = poserEntree({
        date: HORODATE_DEMO,
        acteur: ACTEUR_OPERATEUR_DEMO,
        cible: titre,
        action: `Programmation d'une annonce (${segment}, ${canal})`,
        ip: IP_OPERATEUR_DEMO,
        type: 'communication',
      });
      return { journalId };
    },

    async obtenirParametresPlateforme(_ctx) {
      return PARAMETRES_PLATEFORME_DEMO;
    },

    async basculerIntegration(_ctx, integrationId, actif) {
      const i = PARAMETRES_PLATEFORME_DEMO.integrations.find((x) => x.id === integrationId);
      const journalId = poserEntree({
        date: HORODATE_DEMO,
        acteur: ACTEUR_OPERATEUR_DEMO,
        cible: i?.nom ?? integrationId,
        action: `Intégration ${actif ? 'activée' : 'désactivée'}`,
        ip: IP_OPERATEUR_DEMO,
        type: 'module',
      });
      return { journalId };
    },

    async impersonnerEntreprise(_ctx, entrepriseId) {
      const journalId = poserEntree({
        date: HORODATE_DEMO,
        acteur: ACTEUR_OPERATEUR_DEMO,
        cible: nommerEntreprise(entrepriseId),
        action: 'Connexion en tant que (impersonation)',
        ip: IP_OPERATEUR_DEMO,
        type: 'impersonation',
      });
      return { journalId };
    },

    async suspendreEntreprise(_ctx, entrepriseId, motif) {
      const journalId = poserEntree({
        date: HORODATE_DEMO,
        acteur: ACTEUR_OPERATEUR_DEMO,
        cible: nommerEntreprise(entrepriseId),
        action: `Suspension de l'entreprise (${motif})`,
        ip: IP_OPERATEUR_DEMO,
        type: 'suspension',
      });
      return { journalId };
    },
  };
}
