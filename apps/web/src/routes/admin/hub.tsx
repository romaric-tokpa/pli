// AdminHub — placeholder Phase 0. La vraie console opérateur est portée à
// l'étape 12. Pour l'instant, on confirme juste que la route répond, et que
// le noindex injecté par AdminLayout est bien posé.

import { Link } from 'react-router-dom';
import { Button, Logo, StatusPill } from '@pli/ui';

export function AdminHub() {
  return (
    <div className="min-h-screen bg-encre text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Logo size={32} variant="blanc" withWordmark />
          <StatusPill tone="info" icon="Shield">
            Console opérateur
          </StatusPill>
        </div>

        <h1 className="text-h1 mb-2">Console opérateur</h1>
        <p className="text-[14px] text-white/70 mb-8">
          Surface réservée à l'équipe Pli. Migration prévue à l'étape 12 du plan de Phase 0. La
          vraie console sera déployée séparément en Phase 5 (cf.{' '}
          <code className="px-1 rounded bg-white/10">public/_redirects</code>).
        </p>

        <Link to="/">
          <Button variant="secondary" icon="ArrowLeft">
            Retour au hub
          </Button>
        </Link>
      </div>
    </div>
  );
}
