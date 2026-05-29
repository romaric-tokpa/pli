// Notifications mobile — port verbatim simplifié de _wireframe/src/mobile-other.jsx
// (MobileNotifications). Onglet « Mes alertes » uniquement ; l'onglet
// « Réglages » sera porté à un prochain sub-lot (non bloquant).

import { useEffect, useMemo, useState } from 'react';
import { Icon, type IconName } from '@pli/ui';
import type {
  ContextePersonnel,
  Notification,
  TypeNotification,
} from '../../services/index.js';
import { creerNotificationsServiceMock } from '../../services/index.js';

const CONTEXTE_SALARIE: ContextePersonnel = {
  type: 'personnel',
  comptePersonnelId: 'cp-aya',
};

const TON_PAR_TYPE: Record<TypeNotification, { color: string }> = {
  nouveau_bulletin: { color: '#2C6FB3' },
  rappel_signature: { color: '#D9A227' },
  reclamation: { color: '#5B6577' },
  securite: { color: '#2F8F5B' },
};

export function MobileNotifications() {
  const services = useMemo(() => ({ notifs: creerNotificationsServiceMock() }), []);
  const [liste, setListe] = useState<Notification[]>([]);

  useEffect(() => {
    void (async () => {
      const n = await services.notifs.lister(CONTEXTE_SALARIE);
      setListe(n);
    })();
  }, [services]);

  async function marquerToutesLues() {
    await services.notifs.marquerToutesLues(CONTEXTE_SALARIE);
    const n = await services.notifs.lister(CONTEXTE_SALARIE);
    setListe(n);
  }

  return (
    <>
      <div className="px-5 pt-4 pb-3 shrink-0 bg-white border-b border-bordure">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-encre">Notifications</h1>
          <button
            type="button"
            onClick={marquerToutesLues}
            className="text-[12px] text-encre hover:underline"
          >
            Tout marquer lu
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {liste.map((n) => {
          const tm = TON_PAR_TYPE[n.type] ?? TON_PAR_TYPE.reclamation;
          return (
            <div
              key={n.id}
              className={`px-5 py-4 border-b border-bordure flex items-start gap-3 ${
                !n.lu ? 'bg-papier/40' : 'bg-white'
              }`}
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${tm.color}15`, color: tm.color }}
              >
                <Icon name={n.icon as IconName} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[13.5px] font-semibold text-encre">{n.titre}</div>
                  {!n.lu && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cachet shrink-0" />
                  )}
                </div>
                <div className="text-[12.5px] text-texte-secondaire mt-0.5">
                  {n.description}
                </div>
                <div className="text-[11px] text-texte-secondaire mt-1">{n.date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
