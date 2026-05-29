// Layout mobile salarié — rend le PhoneFrame autour du contenu de chaque
// route /app/*, suivi de la MobileTabBar.
//
// Sub-lot 10c : `notificationsCount` est branché à
// `NotificationsService.compterNonLues(ctx)` — règle UX vivant dans le
// service, miroir de l'invariant CLAUDE.md « tout bouton déclenche une
// action ». Le badge se met à jour quand l'écran Notifications appelle
// `marquerToutesLues`.

import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  creerNotificationsServiceMock,
  type ContextePersonnel,
} from '../../services/index.js';
import { MobileTabBar, PhoneFrame } from './_phone-shell.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant()
const CONTEXTE_SALARIE: ContextePersonnel = {
  type: 'personnel',
  comptePersonnelId: 'cp-aya',
};

const TAB_PATHS = ['/app', '/app/coffre', '/app/notifications', '/app/profil'];

function resoudreTabActif(pathname: string): string {
  let actif = '/app';
  for (const path of TAB_PATHS) {
    if (path === '/app') continue;
    if (pathname === path || pathname.startsWith(`${path}/`)) actif = path;
  }
  if (pathname === '/app') actif = '/app';
  return actif;
}

export function MobileLayout() {
  const { pathname } = useLocation();
  const activePath = resoudreTabActif(pathname);

  const services = useMemo(() => ({ notifs: creerNotificationsServiceMock() }), []);
  const [nonLues, setNonLues] = useState(0);

  useEffect(() => {
    void (async () => {
      const n = await services.notifs.compterNonLues(CONTEXTE_SALARIE);
      setNonLues(n);
    })();
  }, [services, pathname]);

  return (
    <PhoneFrame>
      <div className="flex-1 min-h-0 flex flex-col">
        <Outlet />
      </div>
      <MobileTabBar activePath={activePath} notificationsCount={nonLues} />
    </PhoneFrame>
  );
}
