// SitePageHero — bande d'en-tête Encre pleine largeur.
// Port verbatim de _wireframe/src/site-pages.jsx (SitePageHero).
//
// Pattern partagé par TOUTES les pages publiques internes (légales,
// sous-landings, ressources) — invariant CLAUDE.md « Pages légales :
// bande d'en-tête Encre pleine largeur (fil d'Ariane, surtitre, icône
// en carré ocre, titre blanc, sous-titre, sceau filigrané) ».

import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Icon, SealIcon, type IconName } from '@pli/ui';

export interface SitePageHeroBreadcrumb {
  label: string;
  to?: string;
}

export interface SitePageHeroProps {
  eyebrow?: string;
  titre: string;
  sousTitre?: string;
  icon?: IconName;
  breadcrumbs?: SitePageHeroBreadcrumb[];
}

export function SitePageHero({
  eyebrow,
  titre,
  sousTitre,
  icon = 'FileText',
  breadcrumbs,
}: SitePageHeroProps) {
  return (
    <section className="bg-encre text-white relative overflow-hidden">
      <div className="absolute -right-24 -bottom-24 opacity-[0.06] pointer-events-none">
        <SealIcon size={380} variant="blanc" />
      </div>
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-16 relative">
        {breadcrumbs && (
          <nav
            className="flex items-center gap-1.5 text-[12.5px] text-white/55 mb-4"
            aria-label="Fil d'ariane"
          >
            <Link to="/" className="hover:text-white">
              Accueil
            </Link>
            {breadcrumbs.map((b, i) => (
              <Fragment key={`${b.label}-${i}`}>
                <Icon name="ChevronRight" size={11} />
                {b.to ? (
                  <Link to={b.to} className="hover:text-white">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-white/85">{b.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-md bg-cachet/15 border border-cachet/30 flex items-center justify-center text-cachet">
            <Icon name={icon} size={22} />
          </div>
          <div>
            {eyebrow && (
              <div
                className="text-[11.5px] uppercase tracking-wide text-cachet font-semibold"
                style={{ letterSpacing: '.08em' }}
              >
                {eyebrow}
              </div>
            )}
            <h1 className="mt-0.5 text-[28px] md:text-[34px] font-semibold leading-tight">
              {titre}
            </h1>
          </div>
        </div>
        {sousTitre && (
          <p className="mt-4 text-[14.5px] text-white/70 max-w-2xl">{sousTitre}</p>
        )}
      </div>
    </section>
  );
}
