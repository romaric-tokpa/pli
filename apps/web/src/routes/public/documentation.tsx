// PageDocumentation — index de la documentation produit.

import { Link } from 'react-router-dom';
import { Card, Icon } from '@pli/ui';
import type { IconName } from '@pli/ui';
import { SitePageShell } from './_layout.js';
import { SitePageHero } from './_page-hero.js';

interface CategorieDoc {
  icone: IconName;
  titre: string;
  description: string;
  articles: string[];
}

const CATEGORIES: CategorieDoc[] = [
  {
    icone: 'Rocket',
    titre: 'Démarrer avec Pli',
    description: 'Onboarding entreprise et premiers pas.',
    articles: [
      'Créer un compte entreprise',
      "Activer l'essai de 20 bulletins",
      'Inviter votre premier administrateur',
    ],
  },
  {
    icone: 'Send',
    titre: 'Distribution des bulletins',
    description: 'Dépôt en masse, appairage, distribution.',
    articles: [
      'Importer un fichier de correspondance',
      'Convention de nommage des PDF',
      'Réconcilier un lot en réception',
    ],
  },
  {
    icone: 'FileCheck2',
    titre: 'Suivi et signatures',
    description: 'Taux de consultation, validation horodatée.',
    articles: [
      'Lire le tableau de suivi',
      'Comprendre la validation horodatée',
      "Relancer un salarié qui n'a pas consulté",
    ],
  },
  {
    icone: 'Briefcase',
    titre: 'Espace cabinet',
    description: 'Gestion de portefeuille et facturation.',
    articles: [
      'Ajouter une entreprise au portefeuille',
      'Affecter un gestionnaire à un client',
      'Choisir le mode de facturation',
    ],
  },
  {
    icone: 'Smartphone',
    titre: 'Application salarié',
    description: 'Accès, biométrie, coffre durable.',
    articles: [
      "Activer l'app salarié",
      'Récupérer un compte personnel',
      "Changer d'employeur sans perdre l'historique",
    ],
  },
  {
    icone: 'ShieldCheck',
    titre: 'Conformité et sécurité',
    description: 'ARTCI, audit, chiffrement.',
    articles: [
      'Comprendre la conformité ARTCI',
      "Exporter le journal d'audit",
      'Activer la 2FA pour les administrateurs',
    ],
  },
];

export function PageDocumentation() {
  return (
    <SitePageShell>
      <SitePageHero
        breadcrumbs={[{ label: 'Ressources' }, { label: 'Documentation' }]}
        eyebrow="Ressources"
        titre="Documentation Pli"
        sousTitre="Tout ce qu'il faut pour démarrer, déployer et exploiter Pli au quotidien."
        icon="BookOpen"
      />
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((c) => (
            <Card key={c.titre} interactive>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-papier text-cachet flex items-center justify-center shrink-0">
                  <Icon name={c.icone} size={20} />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-encre">{c.titre}</div>
                  <p className="mt-1 text-[12.5px] text-texte-secondaire">{c.description}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5 text-[13px]">
                {c.articles.map((a) => (
                  <li key={a} className="flex items-center gap-1.5">
                    <Icon name="ChevronRight" size={11} className="text-texte-secondaire" />
                    <span className="text-encre">{a}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Link
            to="/centre-aide"
            className="inline-flex h-10 px-4 items-center rounded border border-bordure bg-white text-encre text-[13.5px] hover:border-encre focus-ring"
          >
            <Icon name="LifeBuoy" size={14} className="mr-2" />
            Centre d'aide
          </Link>
          <Link
            to="/contact"
            className="inline-flex h-10 px-4 items-center rounded bg-encre text-white text-[13.5px] font-medium hover:bg-[#0F1F3D] focus-ring"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </SitePageShell>
  );
}
