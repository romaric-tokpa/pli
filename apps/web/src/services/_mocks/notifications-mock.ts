// Implémentation mock de NotificationsService.
//
// Indexé par compte personnel — Aya a son flux, Fatou le sien (vide pour
// la démo). L'état mutable persiste dans la durée de vie de l'instance.

import type { IdEntite } from '@pli/types';
import type { ContextePersonnel } from '../contexte.js';
import type {
  Notification,
  NotificationsService,
} from '../notifications-service.js';

const NOTIFICATIONS_PAR_COMPTE: Record<IdEntite, Notification[]> = {
  'cp-aya': [
    {
      id: 'n1',
      type: 'nouveau_bulletin',
      titre: 'Nouveau bulletin disponible',
      description: 'Votre bulletin de février 2026 est dans votre coffre-fort.',
      date: 'il y a 2 h',
      lu: false,
      icon: 'FileText',
    },
    {
      id: 'n2',
      type: 'rappel_signature',
      titre: 'Signature requise',
      description: 'Pensez à signer votre bulletin de février 2026.',
      date: 'il y a 2 h',
      lu: false,
      icon: 'PenLine',
    },
    {
      id: 'n3',
      type: 'reclamation',
      titre: 'Réclamation mise à jour',
      description: 'Sylvie Aké a répondu à votre demande.',
      date: 'hier',
      lu: true,
      icon: 'MessagesSquare',
    },
    {
      id: 'n4',
      type: 'nouveau_bulletin',
      titre: 'Nouveau bulletin disponible',
      description: 'Votre bulletin de janvier 2026 est dans votre coffre-fort.',
      date: '29/01/2026',
      lu: true,
      icon: 'FileText',
    },
    {
      id: 'n5',
      type: 'securite',
      titre: 'Nouvel appareil connecté',
      description: 'Connexion depuis Samsung Galaxy A54, Abidjan.',
      date: '20/01/2026',
      lu: true,
      icon: 'ShieldCheck',
    },
  ],
  'cp-fatou': [],
};

export function creerNotificationsServiceMock(): NotificationsService {
  const etat: Record<IdEntite, Notification[]> = {};
  for (const [id, liste] of Object.entries(NOTIFICATIONS_PAR_COMPTE)) {
    etat[id] = liste.map((n) => ({ ...n }));
  }

  function flux(ctx: ContextePersonnel): Notification[] {
    if (!etat[ctx.comptePersonnelId]) etat[ctx.comptePersonnelId] = [];
    return etat[ctx.comptePersonnelId]!;
  }

  return {
    async lister(ctx) {
      return flux(ctx).map((n) => ({ ...n }));
    },

    async compterNonLues(ctx) {
      return flux(ctx).filter((n) => !n.lu).length;
    },

    async marquerLue(ctx, id) {
      const liste = flux(ctx);
      const idx = liste.findIndex((n) => n.id === id);
      if (idx >= 0) liste[idx] = { ...liste[idx]!, lu: true };
      return { ok: true };
    },

    async marquerToutesLues(ctx) {
      const liste = flux(ctx);
      let touchees = 0;
      for (let i = 0; i < liste.length; i++) {
        if (!liste[i]!.lu) {
          liste[i] = { ...liste[i]!, lu: true };
          touchees++;
        }
      }
      return { ok: true, touchees };
    },
  };
}
