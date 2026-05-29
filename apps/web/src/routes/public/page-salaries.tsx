// PageSalaries — sous-landing pour salariés (B2C).

import { Card, Icon } from '@pli/ui';
import { SitePageShell } from './_layout.js';
import { SitePageHero } from './_page-hero.js';

const AVANTAGES = [
  {
    icone: 'Vault' as const,
    titre: 'Coffre-fort personnel',
    description:
      "Vos bulletins restent accessibles tant que votre compte est actif, même après votre départ d'une entreprise.",
  },
  {
    icone: 'Infinity' as const,
    titre: "Suit vos changements d'employeur",
    description:
      'Le coffre est rattaché à vous, pas à votre employeur. Chaque nouvel employeur ajoute ses bulletins ; les anciens restent.',
  },
  {
    icone: 'Fingerprint' as const,
    titre: 'Accès biométrique sécurisé',
    description: 'Empreinte ou Face ID sur mobile. Mot de passe et code OTP en repli.',
  },
  {
    icone: 'PenLine' as const,
    titre: 'Validation horodatée en un clic',
    description:
      "Confirmez la réception d'un bulletin en un tap. Certificat horodaté conservé dans votre coffre.",
  },
  {
    icone: 'MessageSquareWarning' as const,
    titre: 'Signaler une anomalie à votre RH',
    description: "Une erreur de montant ? Ouvrez une réclamation depuis l'app, votre RH répond.",
  },
];

export function PageSalaries() {
  return (
    <SitePageShell>
      <SitePageHero
        breadcrumbs={[{ label: 'Salariés' }]}
        eyebrow="App salarié"
        titre="Votre paie. Toujours avec vous."
        sousTitre="Gratuit pour les salariés. Coffre-fort personnel, accès biométrique, validation horodatée en un clic."
        icon="Smartphone"
      />
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex h-12 px-5 items-center rounded bg-encre text-white text-[14px] font-medium hover:bg-[#0F1F3D] focus-ring btn-lift"
              >
                <Icon name="Apple" size={16} className="mr-2" />
                Télécharger sur l'App Store
              </button>
              <button
                type="button"
                className="inline-flex h-12 px-5 items-center rounded bg-encre text-white text-[14px] font-medium hover:bg-[#0F1F3D] focus-ring btn-lift"
              >
                <Icon name="Play" size={16} className="mr-2" />
                Disponible sur Google Play
              </button>
            </div>
          </div>

          {/* Mockup mobile */}
          <div className="flex justify-center">
            <div className="w-[260px] h-[520px] rounded-[40px] bg-encre p-3 shadow-float">
              <div className="w-full h-full rounded-[32px] bg-white p-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-encre">Bonjour, Aya</div>
                  <Icon name="BellRing" size={14} className="text-cachet" />
                </div>
                <div className="mt-4 rounded-md border border-cachet/30 bg-cachet/5 p-3">
                  <div className="text-[10px] font-medium text-cachet">Nouveau bulletin</div>
                  <div className="text-[13px] text-encre font-semibold mt-1">Février 2026</div>
                  <div className="text-[11px] text-texte-secondaire mt-1">Groupe Atlantique CI</div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-8 bg-surface rounded" />
                  <div className="h-8 bg-surface rounded" />
                  <div className="h-8 bg-surface rounded" />
                </div>
                <div className="mt-auto pt-3 border-t border-bordure flex items-center justify-around text-texte-secondaire">
                  <Icon name="House" size={18} className="text-encre" />
                  <Icon name="Vault" size={18} />
                  <Icon name="Bell" size={18} />
                  <Icon name="User" size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 lg:px-8 pb-20">
        <h2 className="text-h2 text-encre mb-8">Tout ce que l'app vous offre</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVANTAGES.map((a) => (
            <Card key={a.titre} interactive>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-md bg-papier text-cachet flex items-center justify-center shrink-0">
                  <Icon name={a.icone} size={20} />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-encre">{a.titre}</div>
                  <p className="mt-1 text-[13.5px] text-texte-secondaire">{a.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </SitePageShell>
  );
}
