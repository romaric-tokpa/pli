// AdminLayout — layout enveloppant TOUTES les routes /admin/*.
//
// Rôle critique pour l'invariant CLAUDE.md (« la console opérateur n'est jamais
// exposée sur le site public ni le hub ; en production, déploiement séparé,
// non indexé ») :
//
//   - INJECTE dynamiquement <meta name="robots" content="noindex, nofollow">
//     dans document.head dès le montage du layout
//   - LE RETIRE au démontage (quand l'utilisateur quitte /admin)
//
// Une balise statique dans index.html s'appliquerait à TOUT le site car SPA +
// fallback servent le même HTML. L'injection dynamique cible STRICTEMENT les
// routes /admin/*. Première barrière : public/robots.txt.

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

/** Sélecteur utilisé pour vérifier qu'on n'écrase pas une balise existante. */
const ROBOTS_SELECTOR = 'meta[name="robots"][data-pli-admin="1"]';

export function AdminLayout() {
  useEffect(() => {
    // Ne pas dupliquer si un layout admin parent en a déjà posé une.
    if (document.querySelector(ROBOTS_SELECTOR)) return undefined;

    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    meta.setAttribute('data-pli-admin', '1');
    document.head.appendChild(meta);

    return () => {
      meta.remove();
    };
  }, []);

  return <Outlet />;
}
