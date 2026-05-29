// LegalShell — page légale avec bande d'en-tête Encre + corps sectionné +
// pages liées en bas. Le SitePageHero est porté de site-pages.jsx.

import { Link } from 'react-router-dom';
import { Icon, type IconName } from '@pli/ui';
import type { ReactNode } from 'react';
import { SitePageShell } from './_layout.js';
import { SitePageHero } from './_page-hero.js';

export interface LegalSection {
  titre: string;
  contenu: ReactNode;
}

interface LegalShellProps {
  titre: string;
  sousTitre: string;
  icone: IconName;
  sections: LegalSection[];
  liees?: Array<{ to: string; titre: string }>;
}

export function LegalShell({ titre, sousTitre, icone, sections, liees }: LegalShellProps) {
  return (
    <SitePageShell>
      <SitePageHero
        breadcrumbs={[{ label: 'Légal' }, { label: titre }]}
        eyebrow="Légal"
        titre={titre}
        sousTitre={sousTitre}
        icon={icone}
      />
      <article className="max-w-3xl mx-auto px-6 lg:px-8 py-10 lg:py-14 space-y-10">
        {sections.map((s) => (
          <section key={s.titre}>
            <h2 className="text-h3 text-encre mb-3">{s.titre}</h2>
            <div className="text-[14.5px] text-encre/85 leading-[1.7] space-y-3">{s.contenu}</div>
          </section>
        ))}
        {liees && liees.length > 0 && (
          <section className="pt-8 border-t border-bordure">
            <h2 className="text-[14px] font-semibold text-encre mb-3">Pages liées</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {liees.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center justify-between px-3 py-2.5 rounded border border-bordure bg-white hover:border-cachet transition focus-ring text-[13.5px] text-encre"
                >
                  {l.titre}
                  <Icon name="ArrowRight" size={14} className="text-texte-secondaire" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </SitePageShell>
  );
}
