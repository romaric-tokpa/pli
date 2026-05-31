// AdminLayout — shell de la console opérateur (sub-lot 12a).
// Porté de _wireframe/src/admin-layout.jsx.
//
// ─── INVARIANT CLAUDE.md (rappel) ─────────────────────────────────────────
// « La console opérateur n'est jamais exposée sur le site public ni le hub ;
//   en production, déploiement séparé, non indexé. Toute impersonation est
//   journalisée. »
//
// En Phase 0 :
//   1. Le `<meta name="robots" content="noindex, nofollow">` est INJECTÉ
//      dynamiquement à l'arrivée sur /admin et RETIRÉ au démontage. Couvert
//      par 4 tests (`admin-noindex.test.tsx`) qui claquent si la balise
//      manque sur /admin ou traîne après navigation.
//   2. Aucun lien depuis le site public, le hub /preview, ou un layout
//      tenant (Pro / cabinet / mobile) ne pointe sur /admin (vérifié au
//      grep — voir test admin-isole-du-public).
//   3. Le réflexe « UI seule ne protège pas » : les méthodes d'AdminService
//      n'acceptent QUE ContexteAdmin (typé) — impossible par construction
//      de les appeler depuis un autre contexte.
//
// En Phase 5 : la console basculera sur un sous-domaine séparé avec une
// authentification distincte (cf. `public/_redirects` + WAF). En attendant,
// `public/robots.txt` interdit déjà /admin* et le noindex dynamique tient.

import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Icon, SealIcon, SearchField, type IconName } from '@pli/ui';

const ROBOTS_SELECTOR = 'meta[name="robots"][data-pli-admin="1"]';

// ─── Wiring contexte / badges plateforme — TODO(phase-1) ──────────────────
// En Phase 1 les badges seront branchés à `AdminService.obtenirEtatPlateforme`
// (incident en cours + tickets support ouverts). Pour la démo Phase 0, on
// les hardcode comme tous les contextes de sous-surfaces.
const UTILISATEUR_NOM = 'Drissa Diomandé';
const UTILISATEUR_ROLE = 'Super Admin · Pli';
const INITIALES = 'DD';
const INCIDENT_ACTIF = true;
const INCIDENT_TITRE = 'Notifications e-mail dégradées';
const INCIDENT_DESC =
  'Délai de livraison ~5 min sur les notifications. Aucune perte. Cause : fournisseur SMTP.';
const INCIDENT_DEPUIS = '11/02/2026 06:24';
const TICKETS_OUVERTS = 4;

interface ItemNav {
  to: string;
  label: string;
  icon: IconName;
  /** Source du badge dynamique : tickets support ouverts ou incident actif. */
  badge?: 'support' | 'incident';
}
type Divider = { divider: string };

const ADMIN_NAV: (ItemNav | Divider)[] = [
  { to: '/admin', label: "Vue d'ensemble", icon: 'Gauge' },
  { to: '/admin/entreprises', label: 'Entreprises', icon: 'Building2' },
  { to: '/admin/cabinets', label: 'Cabinets', icon: 'Briefcase' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'Users' },
  { divider: 'Activité commerciale' },
  { to: '/admin/revenus', label: 'Revenus', icon: 'Receipt' },
  { to: '/admin/plans', label: 'Plans & tarifs', icon: 'Tags' },
  { to: '/admin/modules', label: 'Modules', icon: 'ToggleRight' },
  { divider: 'Opérations' },
  { to: '/admin/support', label: 'Support', icon: 'LifeBuoy', badge: 'support' },
  { to: '/admin/conformite', label: 'Conformité', icon: 'ShieldCheck' },
  { to: '/admin/sante', label: 'Santé système', icon: 'Activity', badge: 'incident' },
  { to: '/admin/communications', label: 'Communications', icon: 'Megaphone' },
  { divider: 'Système' },
  { to: '/admin/parametres', label: 'Paramètres', icon: 'Settings' },
  { to: '/admin/audit', label: "Journal d'audit", icon: 'ScrollText' },
];

function isDivider(item: ItemNav | Divider): item is Divider {
  return 'divider' in item;
}

export function AdminLayout() {
  const location = useLocation();

  // ─── Injection dynamique de la balise noindex ─────────────────────────
  // (Inchangée depuis étape 6 — toujours couverte par admin-noindex.test.tsx)
  useEffect(() => {
    if (document.querySelector(ROBOTS_SELECTOR)) return undefined;

    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    meta.setAttribute('data-pli-admin', '1');
    document.head.appendChild(meta);

    return () => {
      meta.remove();
    };
  }, []);

  const incidentBadge = INCIDENT_ACTIF ? 1 : 0;

  const isActive = (to: string): boolean => {
    if (to === '/admin')
      return location.pathname === '/admin' || location.pathname === '/admin/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen flex bg-papier">
      <aside
        className="w-64 shrink-0 flex flex-col h-screen sticky top-0"
        style={{ backgroundColor: '#0F1F3D' }}
        data-testid="admin-sidebar"
      >
        <div className="px-5 h-16 flex items-center border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5 focus-ring rounded">
            <SealIcon size={30} variant="blanc" />
            <div className="leading-tight">
              <div className="text-[17px] font-semibold text-white">Pli</div>
              <div
                className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-medium text-cachet"
                style={{ backgroundColor: 'rgba(184,87,55,0.15)', letterSpacing: '.03em' }}
              >
                CONSOLE OPÉRATEUR
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map((item, i) => {
            if (isDivider(item)) {
              return (
                <div
                  key={`d${i}`}
                  className="pt-4 pb-1 px-3 text-[10px] uppercase text-white/40"
                  style={{ letterSpacing: '.08em' }}
                >
                  {item.divider}
                </div>
              );
            }
            const active = isActive(item.to);
            const badge =
              item.badge === 'support'
                ? TICKETS_OUVERTS
                : item.badge === 'incident'
                  ? incidentBadge
                  : 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 h-9 px-3 rounded-md text-[13.5px] font-medium transition group focus-ring ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon name={item.icon} size={15} className={active ? 'text-cachet' : ''} />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span
                    className={`inline-flex items-center justify-center h-5 min-w-[18px] px-1.5 rounded-full text-[10.5px] font-semibold ${
                      item.badge === 'incident' ? 'bg-attente text-white' : 'bg-cachet text-white'
                    }`}
                  >
                    {item.badge === 'incident' ? '!' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/5 transition cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-cachet text-white flex items-center justify-center text-[12px] font-semibold">
              {INITIALES}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-white truncate">
                {UTILISATEUR_NOM}
              </div>
              <div className="text-[10.5px] text-white/55 truncate">{UTILISATEUR_ROLE}</div>
            </div>
            <Icon name="LogOut" size={14} className="text-white/50" />
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-bordure sticky top-0 z-30 flex items-center px-6 gap-4">
          <div className="flex-1 max-w-md">
            <SearchField
              value=""
              onChange={() => {}}
              placeholder="Rechercher une entreprise, un utilisateur, un ticket…"
              size="sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/admin/sante"
              aria-label="Santé système"
              className="relative h-9 w-9 rounded-md flex items-center justify-center text-texte-secondaire hover:bg-surface hover:text-encre transition focus-ring"
            >
              <Icon name="Activity" size={18} />
              {INCIDENT_ACTIF && (
                <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-attente" />
              )}
            </Link>
            <Link
              to="/admin/support"
              aria-label="Support"
              className="relative h-9 w-9 rounded-md flex items-center justify-center text-texte-secondaire hover:bg-surface hover:text-encre transition focus-ring"
            >
              <Icon name="LifeBuoy" size={18} />
              {TICKETS_OUVERTS > 0 && (
                <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-cachet" />
              )}
            </Link>
            <button
              type="button"
              aria-label="Notifications"
              className="h-9 w-9 rounded-md flex items-center justify-center text-texte-secondaire hover:bg-surface hover:text-encre transition focus-ring"
            >
              <Icon name="Bell" size={18} />
            </button>
            <div className="w-px h-6 bg-bordure mx-1" />
            <div className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-md hover:bg-surface cursor-pointer transition">
              <div className="h-7 w-7 rounded-full bg-cachet text-white flex items-center justify-center text-[11px] font-semibold">
                {INITIALES}
              </div>
              <div className="hidden lg:block leading-tight">
                <div className="text-[13px] font-medium text-encre">{UTILISATEUR_NOM}</div>
                <div className="text-[11px] text-texte-secondaire">Super Admin</div>
              </div>
              <Icon name="ChevronDown" size={12} className="text-texte-secondaire" />
            </div>
            <Link
              to="/"
              aria-label="Se déconnecter"
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md text-texte-secondaire hover:bg-surface hover:text-erreur transition focus-ring border border-transparent hover:border-erreur/20"
            >
              <Icon name="LogOut" size={15} />
              <span className="hidden md:inline text-[12.5px] font-medium">Déconnexion</span>
            </Link>
          </div>
        </header>

        {INCIDENT_ACTIF && (
          <div
            className="bg-attente/10 border-b border-attente/30 px-6 py-2.5 flex items-center gap-3"
            data-testid="admin-incident-banner"
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#D9A227', color: 'white' }}
            >
              <Icon name="TriangleAlert" size={14} />
            </div>
            <div className="flex-1 text-[13px]">
              <strong className="text-encre">{INCIDENT_TITRE}</strong>
              <span className="text-texte-secondaire"> — {INCIDENT_DESC}</span>
            </div>
            <div className="text-[12px] text-texte-secondaire">
              Depuis le {INCIDENT_DEPUIS}
            </div>
            <Link
              to="/admin/sante"
              className="text-[12px] text-encre font-medium hover:underline"
            >
              Voir l'incident
            </Link>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
