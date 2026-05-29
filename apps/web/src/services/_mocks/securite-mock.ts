// Implémentation mock de SecuriteService.
//
// Invariant CLAUDE.md « max 2 sessions par entreprise » : `obtenirSessions`
// applique systématiquement un slice(0, 2). C'est le miroir UX de la règle
// serveur Phase 1 (qui coupera la 3ème connexion). Si le mock dépasse, on
// veut quand même rendre exactement 2 — le test de contrat le verrouille.
//
// Le journal d'audit est en lecture seule (pas de méthode d'ajout). En
// Phase 1, les écritures viendront du serveur uniquement, chaînées par hash.

import type {
  EntreeAudit,
  IdEntite,
  ParametresAuthentification,
  Session,
} from '@pli/types';
import type {
  FiltreAudit,
  ResultatDeconnexion,
  SecuriteService,
} from '../securite-service.js';
import {
  AUDIT_LOG_PAR_ENTREPRISE,
  SESSIONS_PRO_PAR_ENTREPRISE,
} from './data-entreprises.js';

const MAX_SESSIONS_PRO = 2;

const PARAMETRES_PAR_DEFAUT: ParametresAuthentification = {
  a2f: true,
  dernierChangementMotDePasse: '12/01/2026',
  restrictionIP: false,
  restrictionHoraire: false,
  alertesSecurite: true,
};

function correspond(e: EntreeAudit, filtre?: FiltreAudit): boolean {
  if (!filtre) return true;
  if (filtre.type && e.type !== filtre.type) return false;
  if (filtre.recherche) {
    const aig = filtre.recherche.toLowerCase().trim();
    if (
      !e.action.toLowerCase().includes(aig) &&
      !e.utilisateur.toLowerCase().includes(aig)
    ) {
      return false;
    }
  }
  return true;
}

export function creerSecuriteServiceMock(): SecuriteService {
  // Sessions mutables par entreprise — permet de simuler la déconnexion.
  const sessions: Record<IdEntite, Session[]> = {};
  for (const [id, liste] of Object.entries(SESSIONS_PRO_PAR_ENTREPRISE)) {
    sessions[id] = liste.map((s) => ({ ...s }));
  }
  const parametres: Record<IdEntite, ParametresAuthentification> = {};

  function obtenirOuInit(id: IdEntite): ParametresAuthentification {
    if (!parametres[id]) parametres[id] = { ...PARAMETRES_PAR_DEFAUT };
    return parametres[id]!;
  }

  return {
    async obtenirSessions(ctx) {
      const toutes = sessions[ctx.entrepriseId] ?? [];
      // Invariant : on rend AU PLUS 2 sessions Pro.
      return toutes.slice(0, MAX_SESSIONS_PRO).map((s) => ({ ...s }));
    },

    async deconnecterSession(ctx, sessionId): Promise<ResultatDeconnexion> {
      const liste = sessions[ctx.entrepriseId];
      if (!liste) return { ok: false, raison: 'introuvable' };
      const idx = liste.findIndex((s) => s.id === sessionId);
      if (idx < 0) return { ok: false, raison: 'introuvable' };
      const cible = liste[idx]!;
      if (cible.actuel) return { ok: false, raison: 'session_actuelle' };
      liste.splice(idx, 1);
      return { ok: true };
    },

    async deconnecterAutresSessions(ctx) {
      const liste = sessions[ctx.entrepriseId];
      if (!liste) return 0;
      const avant = liste.length;
      const conservees = liste.filter((s) => s.actuel);
      sessions[ctx.entrepriseId] = conservees;
      return avant - conservees.length;
    },

    async obtenirParametres(ctx) {
      return { ...obtenirOuInit(ctx.entrepriseId) };
    },

    async basculerA2F(ctx, a2f) {
      const p = obtenirOuInit(ctx.entrepriseId);
      p.a2f = a2f;
      return { ok: true, a2f };
    },

    async listerJournal(ctx, filtre) {
      const liste = AUDIT_LOG_PAR_ENTREPRISE[ctx.entrepriseId] ?? [];
      return liste.filter((e) => correspond(e, filtre)).map((e) => ({ ...e }));
    },
  };
}
