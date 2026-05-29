// Cadre téléphone + status bar + bottom tab bar — port verbatim de
// _wireframe/src/mobile-layout.jsx (PhoneFrame + MobileTabBar + MobileHeader).
//
// Le cadre est dessiné même quand l'app est servie en viewport mobile :
// c'est l'esthétique du wireframe (un téléphone posé sur le brand) et c'est
// ce qui est verrouillé dans les captures `03-mobile-accueil.png` /
// `04-mobile-coffre.png` à l'origine.

import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icon, Logo, type IconName } from '@pli/ui';

export type StatusBarTone = 'dark' | 'light';

export interface PhoneFrameProps {
  children: ReactNode;
  statusBarTone?: StatusBarTone;
}

export function PhoneFrame({ children, statusBarTone = 'dark' }: PhoneFrameProps) {
  return (
    <div className="min-h-screen bg-papier flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to="/" className="inline-flex">
          <Logo size={28} withWordmark />
        </Link>
        <div className="flex items-center gap-3 text-[12px] text-texte-secondaire">
          <span className="hidden md:inline-flex items-center gap-1.5">
            <Icon name="Smartphone" size={12} />
            Pli mobile — application salarié
          </span>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-white border border-bordure text-encre hover:bg-surface transition"
          >
            <Icon name="ArrowLeft" size={12} />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 pb-10">
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="phone-notch" />
            <div
              className={`flex items-center justify-between px-6 pt-3 pb-1 text-[12px] font-semibold shrink-0 ${
                statusBarTone === 'light' ? 'text-white' : 'text-encre'
              }`}
            >
              <span className="tabular-nums">9:41</span>
              <div className="flex items-center gap-1.5">
                <Icon name="Signal" size={12} />
                <Icon name="Wifi" size={12} />
                <Icon name="BatteryFull" size={14} />
              </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Header générique d'écran mobile (back + titre + slot droit) ──────────

export interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  transparent?: boolean;
}

export function MobileHeader({ title, onBack, right, transparent }: MobileHeaderProps) {
  return (
    <div
      className={`px-4 py-3 flex items-center gap-2 shrink-0 ${
        transparent ? '' : 'border-b border-bordure bg-white'
      }`}
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="h-9 w-9 rounded-full flex items-center justify-center text-encre hover:bg-surface"
          aria-label="Retour"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
      ) : (
        <div className="h-9 w-9" aria-hidden />
      )}
      <div className="flex-1 text-center text-[15px] font-semibold text-encre truncate">
        {title}
      </div>
      <div className="h-9 w-9 flex items-center justify-center">{right}</div>
    </div>
  );
}

// ─── Bottom Tab Bar (4 onglets) ──────────────────────────────────────────

export interface MobileTab {
  path: string;
  icon: IconName;
  label: string;
}

export const MOBILE_TABS: MobileTab[] = [
  { path: '/app', icon: 'House', label: 'Accueil' },
  { path: '/app/coffre', icon: 'Vault', label: 'Coffre-fort' },
  { path: '/app/notifications', icon: 'Bell', label: 'Notifications' },
  { path: '/app/profil', icon: 'User', label: 'Profil' },
];

export interface MobileTabBarProps {
  /** Chemin de l'onglet actif. */
  activePath: string;
  /** Nombre de notifications non lues (badge). */
  notificationsCount?: number;
}

export function MobileTabBar({ activePath, notificationsCount = 0 }: MobileTabBarProps) {
  return (
    <nav className="shrink-0 bg-white border-t border-bordure pb-2 pt-2 px-2 grid grid-cols-4 gap-1">
      {MOBILE_TABS.map((t) => {
        const isActive = activePath === t.path;
        const showBadge = t.path === '/app/notifications' && notificationsCount > 0;
        return (
          <Link
            key={t.path}
            to={t.path}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-md transition relative ${
              isActive ? 'text-encre' : 'text-texte-secondaire'
            }`}
          >
            <div className="relative">
              <Icon name={t.icon} size={20} strokeWidth={isActive ? 2.25 : 1.75} />
              {showBadge && (
                <span className="absolute -top-1 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-cachet text-white text-[10px] font-semibold flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}
            >
              {t.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
