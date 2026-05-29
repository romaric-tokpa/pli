// 404 — page de repli pour toute route non déclarée. Garde un retour explicite
// vers le hub d'accueil.

import { useLocation, Link } from 'react-router-dom';
import { Button, Logo } from '@pli/ui';

export function NotFound() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-papier flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <Logo size={48} withWordmark />
        <h1 className="mt-8 text-h2 text-encre">Page introuvable</h1>
        <p className="mt-2 text-[14px] text-texte-secondaire">
          La route{' '}
          <code className="px-1.5 py-0.5 rounded bg-white border border-bordure font-mono text-[12px]">
            {location.pathname}
          </code>{' '}
          n'existe pas encore dans cette phase de migration.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-block">
            <Button variant="primary" icon="House">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
