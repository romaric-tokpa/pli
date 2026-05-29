// PageBlog — index articles Pli (stubs avec titres verbatim wireframe).

import { Card, Icon } from '@pli/ui';
import { SitePageShell } from './_layout.js';
import { SitePageHero } from './_page-hero.js';

interface Article {
  categorie: string;
  titre: string;
  resume: string;
  auteur: string;
  dureeLecture: string;
  date: string;
}

const ARTICLES: Article[] = [
  {
    categorie: 'Conformité',
    titre: 'Conformité ARTCI : ce que cela change pour votre DAF',
    resume:
      "L'hébergement souverain, la signature OneCI et la convention ARTCI : implications concrètes pour la paie d'entreprise.",
    auteur: 'Aïcha Bamba',
    dureeLecture: '7 min',
    date: '18 février 2026',
  },
  {
    categorie: 'Produit',
    titre: "Comment Pli gère le changement d'employeur des salariés",
    resume:
      'Compte personnel durable, rattachements multiples, coffre qui survit aux transitions. Le modèle technique expliqué.',
    auteur: 'Drissa Diomandé',
    dureeLecture: '5 min',
    date: '12 février 2026',
  },
  {
    categorie: 'Partenaires',
    titre: 'Cabinet comptable : pourquoi un espace partenaire change tout',
    resume:
      'Portefeuille consolidé, cloisonnement strict, facturation flexible. Pourquoi Pli a investi un espace dédié.',
    auteur: 'Pli Équipe',
    dureeLecture: '6 min',
    date: '05 février 2026',
  },
  {
    categorie: 'Stratégie',
    titre: "Pourquoi le bulletin de paie reste un point de friction en Afrique de l'Ouest",
    resume:
      "Distribution papier, perte d'historique, suspicion de falsification : la dématérialisation comme socle de confiance.",
    auteur: 'Aïcha Bamba',
    dureeLecture: '8 min',
    date: '28 janvier 2026',
  },
  {
    categorie: "Cas d'usage",
    titre: 'Comoé Industries : 287 salariés, 4 minutes de distribution mensuelle',
    resume: "Retour d'expérience d'un grand industriel ivoirien sur 6 mois d'usage Pli.",
    auteur: 'Karim Touré',
    dureeLecture: '5 min',
    date: '14 janvier 2026',
  },
  {
    categorie: 'Produit',
    titre: 'Comprendre la validation horodatée vs signature avancée',
    resume:
      'Pourquoi nous parlons de validation horodatée et pas de signature avancée. Et ce qui change quand OneCI sera branché.',
    auteur: 'Drissa Diomandé',
    dureeLecture: '4 min',
    date: '03 janvier 2026',
  },
];

export function PageBlog() {
  return (
    <SitePageShell>
      <SitePageHero
        breadcrumbs={[{ label: 'Ressources' }, { label: 'Blog' }]}
        eyebrow="Ressources"
        titre="Blog Pli"
        sousTitre="Réflexions sur la dématérialisation, la conformité ARTCI, et le quotidien des équipes paie."
        icon="Newspaper"
      />
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARTICLES.map((a) => (
            <Card key={a.titre} interactive>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-cachet/10 text-[11px] text-cachet font-medium">
                {a.categorie}
              </span>
              <h3 className="mt-3 text-[16px] font-semibold text-encre leading-snug">{a.titre}</h3>
              <p className="mt-2 text-[13px] text-texte-secondaire">{a.resume}</p>
              <div className="mt-4 pt-3 border-t border-bordure flex items-center justify-between text-[12px] text-texte-secondaire">
                <span>{a.auteur}</span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="Clock" size={11} />
                  {a.dureeLecture}
                </span>
              </div>
              <div className="mt-1 text-[11.5px] text-texte-secondaire">{a.date}</div>
            </Card>
          ))}
        </div>
      </section>
    </SitePageShell>
  );
}
