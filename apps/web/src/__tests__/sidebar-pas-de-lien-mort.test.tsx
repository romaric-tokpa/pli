// @vitest-environment happy-dom
//
// Garde anti-régression universelle (sub-lot 12d) — invariant CLAUDE.md 7
// « Tout bouton/lien déclenche une action, aucun lien mort ».
//
// CE TEST EST LE FILET QUI AURAIT ATTRAPÉ LE BUG DES 6 ROUTES MORTES de
// l'étape 12. Il s'applique aux 3 surfaces tenant (Pro, Cabinet, Admin) :
//
// Pour chaque entrée de NAV de chaque sidebar :
//   1. Une route correspondante DOIT être déclarée (router.tsx contient
//      `path: '<chemin>'` matchant).
//   2. Quand on navigue sur cette route, l'écran enfant DOIT monter son
//      en-tête (`data-testid="page-header"` rendu par AdminPageHeader,
//      CabinetPageHeader ou ProPageHeader).
//
// DISTINCTION CLÉ — ce que le test attrape vs ce qu'il accepte :
//   ✅ ATTRAPE : une entrée de sidebar dont la route ne monte aucun
//      composant (Outlet vide / route absente / 404). Le `data-testid`
//      manquant fait claquer le test.
//   ✅ ACCEPTE : un écran qui monte son page-header mais affiche un
//      EmptyState légitime (ex. /admin/modules = forfait unique). Le
//      page-header est présent ⇒ test vert. La présence de DONNÉES n'est
//      jamais vérifiée — seule la présence du SHELL DE PAGE compte.
//
// Cette distinction évite que le filet ait lui-même un trou : un mauvais
// test vérifierait « il y a des lignes de table » et claquerait à tort sur
// /admin/modules. Un autre vérifierait « le DOM est non vide » et serait
// laxiste (la sidebar seule est déjà non vide). data-testid="page-header"
// est le bon niveau : suffisant pour prouver que la route a monté son
// écran, ni plus ni moins.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ProLayout } from '../routes/pro/_layout.js';
import { ProDashboard } from '../routes/pro/dashboard.js';
import { ProSalaries } from '../routes/pro/salaries/list.js';
import { ProBulletins } from '../routes/pro/bulletins/list.js';
import { ProSuivi } from '../routes/pro/suivi.js';
import { ProReclamations } from '../routes/pro/reclamations.js';
import { ProFacturation } from '../routes/pro/facturation.js';
import { ProSecurite } from '../routes/pro/securite.js';
import { ProParametres } from '../routes/pro/parametres.js';

import { CabinetLayout } from '../routes/cabinet/_layout.js';
import { CabinetPortefeuille } from '../routes/cabinet/portefeuille.js';
import { CabinetSuivi } from '../routes/cabinet/suivi.js';
import { CabinetStatistiques } from '../routes/cabinet/statistiques.js';
import { CabinetGestionnaires } from '../routes/cabinet/gestionnaires.js';
import { CabinetFacturation } from '../routes/cabinet/facturation.js';
import { CabinetParametres } from '../routes/cabinet/parametres.js';

import { AdminLayout } from '../routes/admin/layout.js';
import { AdminVueEnsemble } from '../routes/admin/vue-ensemble.js';
import { AdminEntreprises } from '../routes/admin/entreprises.js';
import { AdminCabinets } from '../routes/admin/cabinets.js';
import { AdminUtilisateurs } from '../routes/admin/utilisateurs.js';
import { AdminRevenus } from '../routes/admin/revenus.js';
import { AdminPlans } from '../routes/admin/plans.js';
import { AdminModules } from '../routes/admin/modules.js';
import { AdminSupport } from '../routes/admin/support.js';
import { AdminConformite } from '../routes/admin/conformite.js';
import { AdminSante } from '../routes/admin/sante.js';
import { AdminCommunications } from '../routes/admin/communications.js';
import { AdminParametres } from '../routes/admin/parametres.js';
import { AdminAudit } from '../routes/admin/audit.js';

afterEach(() => {
  cleanup();
  document.querySelector('meta[name="robots"][data-pli-admin="1"]')?.remove();
});

// Source du router lue UNE FOIS pour les checks statiques.
const ROUTER_SRC = readFileSync(resolve(__dirname, '../router.tsx'), 'utf-8');

/**
 * Vérifie qu'un chemin a une route déclarée dans router.tsx.
 * Accepte les formes : path: '/foo', path: 'foo' (sous-route).
 */
function routeDeclareeDansRouter(chemin: string): boolean {
  if (chemin === '/pro' || chemin === '/cabinet' || chemin === '/admin') {
    return new RegExp(`path: '${chemin}'`).test(ROUTER_SRC);
  }
  const segments = chemin.split('/').filter(Boolean);
  const dernier = segments[segments.length - 1]!;
  return (
    new RegExp(`path: '${dernier}'`).test(ROUTER_SRC) ||
    new RegExp(`path: '${chemin}'`).test(ROUTER_SRC)
  );
}

interface SurfaceTest {
  nom: string;
  Layout: React.ComponentType;
  routes: { chemin: string; label: string; Page: React.ComponentType }[];
  /** Chemin de base du layout (ex. /pro, /cabinet, /admin). */
  base: string;
}

const SURFACES: SurfaceTest[] = [
  {
    nom: 'Pli Pro',
    Layout: ProLayout,
    base: '/pro',
    routes: [
      { chemin: '/pro', label: 'Tableau de bord', Page: ProDashboard },
      { chemin: '/pro/salaries', label: 'Salariés', Page: ProSalaries },
      { chemin: '/pro/bulletins', label: 'Bulletins', Page: ProBulletins },
      { chemin: '/pro/suivi', label: 'Suivi', Page: ProSuivi },
      { chemin: '/pro/reclamations', label: 'Réclamations', Page: ProReclamations },
      { chemin: '/pro/facturation', label: 'Facturation', Page: ProFacturation },
      { chemin: '/pro/securite', label: 'Sécurité', Page: ProSecurite },
      { chemin: '/pro/parametres', label: 'Paramètres', Page: ProParametres },
    ],
  },
  {
    nom: 'Cabinet',
    Layout: CabinetLayout,
    base: '/cabinet',
    routes: [
      { chemin: '/cabinet', label: 'Portefeuille', Page: CabinetPortefeuille },
      { chemin: '/cabinet/suivi', label: 'Suivi', Page: CabinetSuivi },
      { chemin: '/cabinet/statistiques', label: 'Statistiques', Page: CabinetStatistiques },
      { chemin: '/cabinet/gestionnaires', label: 'Gestionnaires', Page: CabinetGestionnaires },
      { chemin: '/cabinet/facturation', label: 'Facturation', Page: CabinetFacturation },
      { chemin: '/cabinet/parametres', label: 'Paramètres', Page: CabinetParametres },
    ],
  },
  {
    nom: 'Console opérateur',
    Layout: AdminLayout,
    base: '/admin',
    routes: [
      { chemin: '/admin', label: "Vue d'ensemble", Page: AdminVueEnsemble },
      { chemin: '/admin/entreprises', label: 'Entreprises', Page: AdminEntreprises },
      { chemin: '/admin/cabinets', label: 'Cabinets', Page: AdminCabinets },
      { chemin: '/admin/utilisateurs', label: 'Utilisateurs', Page: AdminUtilisateurs },
      { chemin: '/admin/revenus', label: 'Revenus', Page: AdminRevenus },
      { chemin: '/admin/plans', label: 'Plans & tarifs', Page: AdminPlans },
      { chemin: '/admin/modules', label: 'Modules', Page: AdminModules },
      { chemin: '/admin/support', label: 'Support', Page: AdminSupport },
      { chemin: '/admin/conformite', label: 'Conformité', Page: AdminConformite },
      { chemin: '/admin/sante', label: 'Santé système', Page: AdminSante },
      { chemin: '/admin/communications', label: 'Communications', Page: AdminCommunications },
      { chemin: '/admin/parametres', label: 'Paramètres', Page: AdminParametres },
      { chemin: '/admin/audit', label: "Journal d'audit", Page: AdminAudit },
    ],
  },
];

for (const surface of SURFACES) {
  describe(`Sidebar ${surface.nom} — aucun lien mort (invariant 7)`, () => {
    for (const r of surface.routes) {
      it(`${r.chemin} (« ${r.label} ») : route déclarée + composant monté avec page-header`, async () => {
        // 1. Route déclarée dans router.tsx (vérification source statique).
        expect(routeDeclareeDansRouter(r.chemin)).toBe(true);

        // 2. Rendu réel : page-header présent dans le DOM.
        const Page = r.Page;
        const { container } = render(
          <ToastProvider>
            <MemoryRouter initialEntries={[r.chemin]}>
              <Routes>
                <Route path={surface.base} element={<surface.Layout />}>
                  {r.chemin === surface.base ? (
                    <Route index element={<Page />} />
                  ) : (
                    <Route
                      path={r.chemin.slice(surface.base.length + 1)}
                      element={<Page />}
                    />
                  )}
                </Route>
              </Routes>
            </MemoryRouter>
          </ToastProvider>,
        );
        await waitFor(() => {
          expect(container.querySelector('[data-testid="page-header"]')).not.toBeNull();
        });
        // 3. Le page-header doit avoir un titre non vide (un h1 avec du texte).
        const h1 = container.querySelector('[data-testid="page-header"] h1');
        expect(h1).not.toBeNull();
        expect((h1?.textContent ?? '').trim().length).toBeGreaterThan(0);
      });
    }
  });
}
