// AdminModules — page « Modules & feature flags » (sub-lot 12d).
// Porté de _wireframe/src/admin-business.jsx (AdminModules) :
//   - MODULES_ADMIN du wireframe est VOLONTAIREMENT VIDE
//   - L'écran rend un EmptyState pédagogique expliquant le forfait unique
//     275 FCFA / salarié actif / mois (composition 150 + 75 + 50)
//   - Lien direct vers /admin/plans pour le détail tarifaire
//
// C'est une vraie page (h1, sous-titre, contenu informatif) — pas une 404,
// pas un placeholder. Le test anti-régression vérifie la présence du
// `data-testid="page-header"`, qui est rendu par AdminPageHeader.

import { Card, Icon } from '@pli/ui';
import { Link } from 'react-router-dom';
import { AdminPageHeader } from './_page-header.js';

export function AdminModules() {
  return (
    <>
      <AdminPageHeader
        title="Modules & feature flags"
        subtitle="Activation globale, déploiement progressif et expérimentations"
      />

      <div className="p-8 space-y-4">
        <Card padding="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-md bg-papier border border-bordure flex items-center justify-center text-cachet">
              <Icon name="Wallet" size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-[16px] font-semibold text-encre">
                Modèle forfaitaire — toutes les fonctionnalités incluses
              </h2>
              <p className="mt-1.5 text-[13.5px] text-texte-secondaire">
                Le forfait Pli à{' '}
                <strong className="text-encre">
                  275 FCFA / salarié actif / mois
                </strong>{' '}
                inclut la distribution, la signature électronique (validation horodatée) et
                les réclamations. Plus aucune fonctionnalité n'est vendue séparément.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ['Distribution', 150] as const,
                  ['Signature électronique', 75] as const,
                  ['Réclamations', 50] as const,
                ].map(([l, p]) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-papier border border-bordure text-[12px] text-encre"
                  >
                    <Icon name="Check" size={11} className="text-succes" />
                    {l} <span className="text-texte-secondaire">· {p} FCFA</span>
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  to="/admin/plans"
                  className="inline-flex items-center gap-1.5 text-[13px] text-encre font-medium hover:underline"
                >
                  Voir la tarification
                  <Icon name="ArrowRight" size={12} />
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="p-5" bg="bg-papier" className="border-bordure">
          <div className="flex items-start gap-3 text-[12.5px] text-texte-secondaire">
            <Icon name="Info" size={14} className="text-info shrink-0 mt-0.5" />
            <div>
              <strong className="text-encre">
                Pourquoi cette page existe-t-elle ?
              </strong>{' '}
              Cet espace est conservé pour pouvoir éventuellement réintroduire des
              modules expérimentaux (déploiement progressif, A/B tests) sans modifier
              la sidebar. Pour l'instant le modèle reste forfaitaire — c'est une
              décision produit, pas un oubli.
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
