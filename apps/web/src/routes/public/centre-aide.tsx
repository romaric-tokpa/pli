// PageCentreAide — catégories d'aide + FAQ populaires.

import { useState } from 'react';
import { Card, Icon, SearchField } from '@pli/ui';
import type { IconName } from '@pli/ui';
import { SitePageShell } from './_layout.js';
import { SitePageHero } from './_page-hero.js';

interface CategorieAide {
  icone: IconName;
  titre: string;
  nbArticles: number;
}

const CATEGORIES: CategorieAide[] = [
  { icone: 'Building2', titre: 'Pour les entreprises', nbArticles: 24 },
  { icone: 'Briefcase', titre: 'Pour les cabinets', nbArticles: 18 },
  { icone: 'Smartphone', titre: 'Pour les salariés', nbArticles: 32 },
  { icone: 'Receipt', titre: 'Facturation & paiements', nbArticles: 12 },
  { icone: 'ShieldCheck', titre: 'Sécurité & conformité', nbArticles: 16 },
  { icone: 'Settings', titre: 'Paramètres & compte', nbArticles: 10 },
];

const FAQ_POPULAIRES = [
  'Comment ajouter un salarié à mon registre ?',
  "Que se passe-t-il à la fin de l'essai gratuit ?",
  'Comment activer la signature électronique ?',
  'Mon salarié a perdu accès à son e-mail pro — que faire ?',
  'Comment changer de mode de paiement ?',
  "Comment exporter le journal d'audit ?",
];

export function PageCentreAide() {
  const [recherche, setRecherche] = useState('');

  return (
    <SitePageShell>
      <SitePageHero
        breadcrumbs={[{ label: 'Ressources' }, { label: "Centre d'aide" }]}
        eyebrow="Ressources"
        titre="Centre d'aide"
        sousTitre="Trouvez une réponse rapide ou contactez le support."
        icon="LifeBuoy"
      />
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-10 pb-12">
        <div className="max-w-xl">
          <SearchField
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher dans l'aide…"
          />
        </div>

        <div className="mt-10">
          <h2 className="text-h3 text-encre mb-4">Parcourir par catégorie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((c) => (
              <Card key={c.titre} interactive>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-md bg-papier text-cachet flex items-center justify-center shrink-0">
                    <Icon name={c.icone} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold text-encre">{c.titre}</div>
                    <div className="text-[12.5px] text-texte-secondaire">
                      {c.nbArticles} articles
                    </div>
                  </div>
                  <Icon name="ArrowRight" size={14} className="text-texte-secondaire mt-1.5" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-h3 text-encre mb-4">FAQ populaires</h2>
          <Card padding="p-0">
            <ul className="divide-y divide-bordure">
              {FAQ_POPULAIRES.map((q) => (
                <li
                  key={q}
                  className="flex items-center justify-between px-5 py-4 hover:bg-papier transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="CircleHelp" size={16} className="text-cachet" />
                    <span className="text-[13.5px] text-encre">{q}</span>
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-texte-secondaire" />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </SitePageShell>
  );
}
