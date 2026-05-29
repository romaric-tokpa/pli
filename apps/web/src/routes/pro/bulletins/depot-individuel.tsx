// Dépôt individuel d'un bulletin — stub Phase 0 (port verbatim à venir).

import { Link } from 'react-router-dom';
import { Button, Card, Icon } from '@pli/ui';
import { ProPageHeader } from '../_page-header.js';

export function ProBulletinDepotIndividuel() {
  return (
    <>
      <ProPageHeader
        breadcrumbs={[
          { label: 'Bulletins', href: '/pro/bulletins' },
          { label: 'Dépôt individuel' },
        ]}
        title="Dépôt individuel d'un bulletin"
        subtitle="Cœur du système : appairage par matricule pour un seul fichier PDF."
      />
      <div className="p-8">
        <Card padding="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-md bg-papier text-cachet flex items-center justify-center shrink-0">
              <Icon name="Construction" size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-encre">Port à venir</div>
              <p className="mt-1 text-[13px] text-texte-secondaire">
                Le dépôt individuel (3 étapes : PDF → matricule + période → récap) est porté à un
                prochain sub-lot. Pour la Phase 0, utilisez le dépôt en masse depuis l'écran
                Bulletins.
              </p>
              <div className="mt-4">
                <Link to="/pro/bulletins/upload">
                  <Button variant="primary" icon="CloudUpload">
                    Aller au dépôt en masse
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
