// ProLayout — shell Pli Pro (sidebar + topbar + bandeau essai + notifications).
// Port verbatim de _wireframe/src/pro-layout.jsx.
//
// Données entreprise et essai : hardcodées en constantes pour la Sub-étape 9a
// (« shell d'abord »). Wiring au service entreprise + auth en Phase 1.

import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Avatar,
  Drawer,
  Icon,
  SealIcon,
  SearchField,
  STATUS_STYLES,
  type IconName,
  type StatusTone,
} from '@pli/ui';

// ─── Données de chrome — points de wiring Phase 1 ──────────────────────────
// Tous les constantes ci-dessous sont marquées `TODO(phase-1)` pour être
// retrouvées d'un seul `grep -rn "TODO(phase-1)"` quand on branchera le
// contexte d'auth + les services en Phase 1.

// TODO(phase-1) — remplacer par EntrepriseService.obtenirCourante(ctx)
const ENTREPRISE_NOM = 'Groupe Atlantique CI';
const ENTREPRISE_EFFECTIF = 24;
const ENTREPRISE_INITIALES = 'GA';

// TODO(phase-1) — remplacer par AuthService.contexteCourant() (admin RH)
const UTILISATEUR_NOM = 'Sylvie Aké';
const UTILISATEUR_ROLE = 'Administratrice RH';

// TODO(phase-1) — remplacer par AbonnementService.obtenirCourant(ctx)
const ESSAI_BULLETINS_RESTANTS = 14;
const ESSAI_BULLETINS_TOTAL = 20;
const ABONNEMENT_EN_ESSAI = true;

interface ItemNav {
  to: string;
  label: string;
  icon: IconName;
  badge?: number;
}

const PRO_NAV: ItemNav[] = [
  { to: '/pro', label: 'Tableau de bord', icon: 'LayoutDashboard' },
  { to: '/pro/salaries', label: 'Salariés', icon: 'Users' },
  { to: '/pro/bulletins', label: 'Bulletins', icon: 'FileText' },
  { to: '/pro/suivi', label: 'Suivi', icon: 'Eye' },
  { to: '/pro/reclamations', label: 'Réclamations', icon: 'MessageSquareWarning', badge: 2 },
  { to: '/pro/facturation', label: 'Facturation', icon: 'CreditCard' },
  { to: '/pro/securite', label: 'Sécurité', icon: 'ShieldCheck' },
  { to: '/pro/parametres', label: 'Paramètres', icon: 'Settings' },
];

interface Notification {
  titre: string;
  desc: string;
  date: string;
  tone: StatusTone;
  icon: IconName;
}

const NOTIFICATIONS: Notification[] = [
  {
    titre: 'Nouvelle réclamation',
    desc: 'Awa Bamba — prime non versée',
    date: 'il y a 2 h',
    tone: 'attente',
    icon: 'MessageSquareWarning',
  },
  {
    titre: 'Bulletin signé',
    desc: 'Aya Koffi a signé son bulletin',
    date: 'il y a 1 h',
    tone: 'succes',
    icon: 'PenLine',
  },
  {
    titre: '18 bulletins distribués',
    desc: 'Période février 2026',
    date: 'il y a 4 h',
    tone: 'info',
    icon: 'FileText',
  },
  {
    titre: '5 salariés non-consultés',
    desc: 'Bulletins de février, à relancer',
    date: 'hier',
    tone: 'attente',
    icon: 'TriangleAlert',
  },
];

export function ProLayout() {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const isActive = (to: string) => {
    if (to === '/pro') return location.pathname === '/pro' || location.pathname === '/pro/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-papier flex">
      {/* ─── Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-white border-r border-bordure flex flex-col h-screen sticky top-0">
        <div className="px-5 h-16 flex items-center border-b border-bordure">
          <Link to="/" className="flex items-center gap-2.5 focus-ring rounded">
            <SealIcon size={30} />
            <div className="leading-none">
              <div className="text-[18px] font-semibold text-encre">
                Pli <span className="text-cachet font-medium">Pro</span>
              </div>
              <div className="text-[10.5px] text-texte-secondaire mt-0.5">
                le coffre-fort de paie
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {PRO_NAV.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 h-10 px-3 rounded-md text-[14px] font-medium transition group focus-ring ${
                  active ? 'bg-encre text-white' : 'text-encre hover:bg-surface'
                }`}
              >
                <Icon
                  name={item.icon}
                  size={16}
                  className={
                    active ? 'text-white' : 'text-texte-secondaire group-hover:text-encre'
                  }
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-semibold ${
                      active ? 'bg-white text-encre' : 'bg-cachet text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-bordure p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface transition cursor-pointer">
            <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre font-semibold text-[12px]">
              {ENTREPRISE_INITIALES}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-encre truncate">{ENTREPRISE_NOM}</div>
              <div className="text-[11px] text-texte-secondaire truncate">
                {ENTREPRISE_EFFECTIF} salariés
              </div>
            </div>
            <Icon name="ChevronsUpDown" size={14} className="text-texte-secondaire" />
          </div>
        </div>
      </aside>

      {/* ─── Main ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-bordure sticky top-0 z-30 flex items-center px-6 gap-4">
          <div className="flex-1 max-w-md">
            <SearchField
              value=""
              onChange={() => {}}
              placeholder="Rechercher un salarié, un bulletin…"
              size="sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              aria-label="Notifications"
              className="relative h-9 w-9 rounded-md flex items-center justify-center text-texte-secondaire hover:bg-surface hover:text-encre transition focus-ring"
            >
              <Icon name="Bell" size={18} />
              <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-cachet" />
            </button>
            <Link
              to="/pro/securite"
              aria-label="Sécurité"
              className="h-9 w-9 rounded-md flex items-center justify-center text-texte-secondaire hover:bg-surface hover:text-encre transition focus-ring"
            >
              <Icon name="ShieldCheck" size={18} />
            </Link>
            <div className="w-px h-6 bg-bordure mx-1" />
            <div className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-md hover:bg-surface cursor-pointer transition">
              <Avatar name={UTILISATEUR_NOM} size={30} />
              <div className="hidden lg:block leading-tight">
                <div className="text-[13px] font-medium text-encre">{UTILISATEUR_NOM}</div>
                <div className="text-[11px] text-texte-secondaire">{UTILISATEUR_ROLE}</div>
              </div>
              <Icon name="ChevronDown" size={12} className="text-texte-secondaire" />
            </div>
            <Link
              to="/connexion"
              aria-label="Se déconnecter"
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md text-texte-secondaire hover:bg-surface hover:text-erreur transition focus-ring border border-transparent hover:border-erreur/20"
            >
              <Icon name="LogOut" size={15} />
              <span className="hidden md:inline text-[12.5px] font-medium">Déconnexion</span>
            </Link>
          </div>
        </header>

        {ABONNEMENT_EN_ESSAI && (
          <Link
            to="/pro/facturation"
            className="block bg-cachet text-white px-6 py-2 hover:bg-[#9F4A2F] transition"
          >
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
              <Icon name="Sparkles" size={14} />
              <div className="flex-1 text-[13px]">
                <strong>Essai gratuit :</strong> {ESSAI_BULLETINS_RESTANTS} /{' '}
                {ESSAI_BULLETINS_TOTAL} bulletins restants. Souscrivez avant épuisement pour
                continuer à distribuer.
              </div>
              <div className="hidden md:flex items-center gap-1 text-[12px] font-medium">
                Voir la facturation
                <Icon name="ArrowRight" size={12} />
              </div>
            </div>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>

        <Drawer
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          title="Notifications"
          width={400}
        >
          <div className="divide-y divide-bordure">
            {NOTIFICATIONS.map((n, i) => {
              const s = STATUS_STYLES[n.tone];
              return (
                <div
                  key={i}
                  className="p-4 hover:bg-surface/60 transition cursor-pointer flex items-start gap-3"
                >
                  <div
                    className="h-8 w-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: s.bg, color: s.fg }}
                  >
                    <Icon name={n.icon} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-encre">{n.titre}</div>
                    <div className="text-[12px] text-texte-secondaire">{n.desc}</div>
                    <div className="text-[11px] text-texte-secondaire mt-1">{n.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Drawer>
      </div>
    </div>
  );
}
