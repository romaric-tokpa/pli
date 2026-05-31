// CabinetLayout — shell de l'espace cabinet (sidebar + topbar / barre de
// contexte). Porté verbatim de _wireframe/src/cabinet-layout.jsx.
//
// Deux modes d'affichage (CLAUDE.md « parité visuelle ») :
//
//   1. Mode portefeuille — pas d'entreprise active. Topbar standard
//      (recherche d'entreprise + cloche + avatar gestionnaire + déconnexion).
//
//   2. Mode entreprise scellée — entrepriseActive est posée par la route
//      enfant via `useCabinetOutletContext().setEntrepriseActive()`. La
//      topbar est remplacée par une bande Encre « Revenir au portefeuille
//      — Vous gérez : <Nom> ». Le badge CABINET reste visible.
//
// Sous-routes : pour passer en mode entreprise scellée, faire :
//
//   const { setEntrepriseActive } = useCabinetOutletContext();
//   useEffect(() => {
//     setEntrepriseActive(entreprise);
//     return () => setEntrepriseActive(null);
//   }, [entreprise, setEntrepriseActive]);

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import type { Cabinet, Entreprise, GestionnaireCabinet } from '@pli/types';
import {
  Avatar,
  Icon,
  SealIcon,
  SearchField,
  type IconName,
} from '@pli/ui';
import {
  creerCabinetsServiceMock,
  type ContextePortefeuilleCabinet,
} from '../../services/index.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant() ; ces deux constantes
// définissent le cabinet et le gestionnaire connectés en démo Phase 0.
const CABINET_COURANT_ID = 'cab-ebrie';
const GESTIONNAIRE_COURANT_ID = 'uc-1';

const CONTEXTE_DEMO: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: CABINET_COURANT_ID,
};

interface ItemNav {
  to: string;
  label: string;
  icon: IconName;
}

const CABINET_NAV: ItemNav[] = [
  { to: '/cabinet', label: 'Portefeuille', icon: 'LayoutGrid' },
  { to: '/cabinet/suivi', label: 'Suivi', icon: 'Eye' },
  { to: '/cabinet/statistiques', label: 'Statistiques', icon: 'ChartBarBig' },
  { to: '/cabinet/gestionnaires', label: 'Gestionnaires', icon: 'UserCog' },
  { to: '/cabinet/facturation', label: 'Facturation', icon: 'Receipt' },
  { to: '/cabinet/parametres', label: 'Paramètres', icon: 'Settings' },
];

export interface CabinetOutletContext {
  /**
   * À appeler par une route enfant qui entre dans l'espace d'une entreprise
   * scellée — passe la layout en mode contextbar « Vous gérez : <Nom> ».
   * Repasser `null` au démontage pour revenir au mode portefeuille.
   */
  setEntrepriseActive: (entreprise: Entreprise | null) => void;
}

export function useCabinetOutletContext(): CabinetOutletContext {
  return useOutletContext<CabinetOutletContext>();
}

function libelleRole(role: GestionnaireCabinet['role']): string {
  return role === 'responsable' ? 'Responsable' : 'Gestionnaire';
}

export function CabinetLayout() {
  const location = useLocation();
  const services = useMemo(() => ({ cabinets: creerCabinetsServiceMock() }), []);

  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [gestionnaire, setGestionnaire] = useState<GestionnaireCabinet | null>(null);
  const [nbEntreprises, setNbEntreprises] = useState(0);
  const [entrepriseActive, setEntrepriseActive] = useState<Entreprise | null>(null);

  useEffect(() => {
    void (async () => {
      const [cab, gest, portefeuille] = await Promise.all([
        services.cabinets.obtenirCabinet(CONTEXTE_DEMO),
        services.cabinets.obtenirGestionnaire(CONTEXTE_DEMO, GESTIONNAIRE_COURANT_ID),
        services.cabinets.obtenirPortefeuille(CONTEXTE_DEMO),
      ]);
      setCabinet(cab);
      setGestionnaire(gest);
      setNbEntreprises(portefeuille.length);
    })();
  }, [services]);

  const setEntreprise = useCallback((e: Entreprise | null) => {
    setEntrepriseActive(e);
  }, []);

  const outletContext: CabinetOutletContext = useMemo(
    () => ({ setEntrepriseActive: setEntreprise }),
    [setEntreprise],
  );

  const isActive = (to: string): boolean => {
    if (to === '/cabinet') {
      return location.pathname === '/cabinet' || location.pathname === '/cabinet/';
    }
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-papier flex">
      <aside className="w-64 shrink-0 bg-white border-r border-bordure flex flex-col h-screen sticky top-0">
        <div className="px-5 h-16 flex items-center border-b border-bordure">
          <Link to="/" className="flex items-center gap-2.5 focus-ring rounded">
            <SealIcon size={30} />
            <div className="leading-tight">
              <div className="text-[17px] font-semibold text-encre">Pli</div>
              <div
                className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-medium text-cachet"
                style={{ backgroundColor: 'rgba(184,87,55,0.15)', letterSpacing: '.03em' }}
              >
                CABINET
              </div>
            </div>
          </Link>
        </div>

        <div className="px-3 pt-3">
          <div className="rounded-md bg-papier border border-bordure p-2.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-white border border-bordure flex items-center justify-center text-encre">
                <Icon name="Briefcase" size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-encre truncate">
                  {cabinet?.nom ?? '—'}
                </div>
                <div className="text-[10.5px] text-texte-secondaire">
                  {nbEntreprises} entreprise{nbEntreprises > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {CABINET_NAV.map((item) => {
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
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-bordure p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface transition cursor-pointer">
            <Avatar name={gestionnaire?.nom ?? ''} size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-encre truncate">
                {gestionnaire?.nom ?? '—'}
              </div>
              <div className="text-[11px] text-texte-secondaire truncate">
                {gestionnaire ? libelleRole(gestionnaire.role) : ''}
              </div>
            </div>
            <Icon name="ChevronsUpDown" size={14} className="text-texte-secondaire" />
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {entrepriseActive ? (
          <div
            className="h-12 bg-encre text-white border-b border-encre flex items-center px-6 gap-3 sticky top-0 z-30"
            data-testid="cabinet-contextbar"
          >
            <Link
              to="/cabinet"
              className="inline-flex items-center gap-1.5 text-[13px] text-white/85 hover:text-white"
            >
              <Icon name="ArrowLeft" size={14} />
              Revenir au portefeuille
            </Link>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2 text-[13px]">
              <Icon name="Building2" size={14} className="text-cachet" />
              <span className="text-white/70">Vous gérez :</span>
              <strong className="text-white">{entrepriseActive.nom}</strong>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[11.5px] text-white/65">
              <Icon name="Briefcase" size={11} />
              <span>Cabinet {cabinet?.nom ?? ''}</span>
            </div>
          </div>
        ) : (
          <header
            className="h-16 bg-white border-b border-bordure sticky top-0 z-30 flex items-center px-6 gap-4"
            data-testid="cabinet-topbar"
          >
            <div className="flex-1 max-w-md">
              <SearchField
                value=""
                onChange={() => {}}
                placeholder="Rechercher une entreprise du portefeuille…"
                size="sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Notifications"
                className="h-9 w-9 rounded-md flex items-center justify-center text-texte-secondaire hover:bg-surface hover:text-encre transition focus-ring"
              >
                <Icon name="Bell" size={18} />
              </button>
              <div className="w-px h-6 bg-bordure mx-1" />
              <div className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-md hover:bg-surface cursor-pointer transition">
                <Avatar name={gestionnaire?.nom ?? ''} size={30} />
                <div className="hidden lg:block leading-tight">
                  <div className="text-[13px] font-medium text-encre">
                    {gestionnaire?.nom ?? '—'}
                  </div>
                  <div className="text-[11px] text-texte-secondaire">
                    {gestionnaire ? libelleRole(gestionnaire.role) : ''}
                  </div>
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
        )}

        <div className="flex-1 min-w-0">
          <Outlet context={outletContext} />
        </div>
      </div>
    </div>
  );
}
