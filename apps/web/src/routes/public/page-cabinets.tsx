// PageCabinets — sous-landing pour cabinets comptables / intérim.

import { Link } from 'react-router-dom';
import { Card, Icon } from '@pli/ui';
import { SitePageShell } from './_layout.js';
import { SitePageHero } from './_page-hero.js';

const BENEFICES = [
  {
    icone: 'LayoutGrid' as const,
    titre: 'Portefeuille consolidé',
    description:
      'Tous vos clients en un seul espace. Tableau de bord global, alertes par entreprise.',
  },
  {
    icone: 'ShieldCheck' as const,
    titre: 'Entrée scellée par client',
    description:
      'Cloisonnement strict : chaque entreprise est isolée des autres. Vos clients ne se voient jamais.',
  },
  {
    icone: 'UserCog' as const,
    titre: 'Gestionnaires multiples',
    description:
      'Affectez des gestionnaires par client. Délégation fine, traçabilité, 2FA obligatoire.',
  },
  {
    icone: 'Receipt' as const,
    titre: 'Facturation au choix',
    description: 'Mode consolidé (−10 % cabinet) ou commission par entreprise (15 %).',
  },
];

export function PageCabinets() {
  return (
    <SitePageShell>
      <SitePageHero
        breadcrumbs={[{ label: 'Cabinets partenaires' }]}
        eyebrow="Cabinets partenaires"
        titre="Un seul espace pour tous vos clients."
        sousTitre="Cloisonnement strict, plusieurs gestionnaires, facturation transparente. L'espace cabinet Pli est conçu pour les cabinets comptables et d'intérim qui gèrent plusieurs entreprises."
        icon="Briefcase"
      />
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-12">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/devenir-partenaire"
            className="inline-flex h-12 px-6 items-center rounded bg-encre text-white text-[14.5px] font-medium hover:bg-[#0F1F3D] focus-ring shadow-sm btn-lift"
          >
            Devenir partenaire
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex h-12 px-5 items-center rounded text-encre text-[14.5px] font-medium hover:bg-white focus-ring"
          >
            Demander une démo
          </Link>
        </div>

        {/* KPI */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl">
          <Card>
            <div className="text-[12.5px] text-texte-secondaire">Portefeuille</div>
            <div className="mt-1.5 text-[28px] font-semibold text-encre tabular-nums">1 espace</div>
          </Card>
          <Card>
            <div className="text-[12.5px] text-texte-secondaire">Tarif consolidé</div>
            <div className="mt-1.5 text-[28px] font-semibold text-cachet tabular-nums">−10 %</div>
          </Card>
          <Card>
            <div className="text-[12.5px] text-texte-secondaire">Commission</div>
            <div className="mt-1.5 text-[28px] font-semibold text-cachet tabular-nums">15 %</div>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <h2 className="text-h2 text-encre mb-8">Quatre raisons d'opter pour l'espace cabinet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENEFICES.map((b) => (
            <Card key={b.titre} interactive>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-md bg-papier text-cachet flex items-center justify-center shrink-0">
                  <Icon name={b.icone} size={20} />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-encre">{b.titre}</div>
                  <p className="mt-1 text-[13.5px] text-texte-secondaire">{b.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </SitePageShell>
  );
}
