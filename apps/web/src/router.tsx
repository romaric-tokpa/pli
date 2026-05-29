// Router central — createBrowserRouter (URLs propres, pas de hash).
//
// Code-splitting par route via `lazy()` : chaque page publique devient un
// chunk séparé chargé à la demande. Premier pas d'allègement du bundle
// principal (cf. README — étape 8+).
//
// Le hub d'accueil (PreviewHub) est lazy lui aussi — il sert seulement à
// la navigation dev, pas à la première impression utilisateur.
// La landing à `/` reste EAGER : c'est l'entrée du site marketing.

import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';

// La landing reste EAGER (entrée du site, pas de flash de chargement).
import { SiteLanding } from './routes/public/landing.js';

import { NotFound } from './routes/not-found.js';
import { AdminLayout } from './routes/admin/layout.js';
import { AdminHub } from './routes/admin/hub.js';

// ─── Lazy chunks par route publique ───────────────────────────────────────
const PreviewHub = lazy(() =>
  import('./routes/public/preview.js').then((m) => ({ default: m.PreviewHub })),
);
const SiteConnexion = lazy(() =>
  import('./routes/public/connexion.js').then((m) => ({ default: m.SiteConnexion })),
);
const SiteInscription = lazy(() =>
  import('./routes/public/inscription.js').then((m) => ({ default: m.SiteInscription })),
);
const SiteDevenirPartenaire = lazy(() =>
  import('./routes/public/devenir-partenaire.js').then((m) => ({
    default: m.SiteDevenirPartenaire,
  })),
);
const SiteMotDePasseOublie = lazy(() =>
  import('./routes/public/mot-de-passe-oublie.js').then((m) => ({
    default: m.SiteMotDePasseOublie,
  })),
);
const SiteOnboarding = lazy(() =>
  import('./routes/public/onboarding-entreprise.js').then((m) => ({ default: m.SiteOnboarding })),
);
const MentionsLegales = lazy(() =>
  import('./routes/public/mentions-legales.js').then((m) => ({ default: m.MentionsLegales })),
);
const Confidentialite = lazy(() =>
  import('./routes/public/confidentialite.js').then((m) => ({ default: m.Confidentialite })),
);
const CGU = lazy(() => import('./routes/public/cgu.js').then((m) => ({ default: m.CGU })));
const ConformiteARTCI = lazy(() =>
  import('./routes/public/conformite-artci.js').then((m) => ({ default: m.ConformiteARTCI })),
);
const PageCabinets = lazy(() =>
  import('./routes/public/page-cabinets.js').then((m) => ({ default: m.PageCabinets })),
);
const PageSalaries = lazy(() =>
  import('./routes/public/page-salaries.js').then((m) => ({ default: m.PageSalaries })),
);
const PageDocumentation = lazy(() =>
  import('./routes/public/documentation.js').then((m) => ({ default: m.PageDocumentation })),
);
const PageCentreAide = lazy(() =>
  import('./routes/public/centre-aide.js').then((m) => ({ default: m.PageCentreAide })),
);
const PageBlog = lazy(() =>
  import('./routes/public/blog.js').then((m) => ({ default: m.PageBlog })),
);
const PageContact = lazy(() =>
  import('./routes/public/contact.js').then((m) => ({ default: m.PageContact })),
);

// ─── Surface Pli Pro — code-splitting par route ───────────────────────────
const ProLayout = lazy(() =>
  import('./routes/pro/_layout.js').then((m) => ({ default: m.ProLayout })),
);
const ProDashboard = lazy(() =>
  import('./routes/pro/dashboard.js').then((m) => ({ default: m.ProDashboard })),
);
const ProSalaries = lazy(() =>
  import('./routes/pro/salaries/list.js').then((m) => ({ default: m.ProSalaries })),
);
const ProSalarieDetail = lazy(() =>
  import('./routes/pro/salaries/detail.js').then((m) => ({ default: m.ProSalarieDetail })),
);
const ProSalariesImport = lazy(() =>
  import('./routes/pro/salaries/import.js').then((m) => ({ default: m.ProSalariesImport })),
);
const ProBulletins = lazy(() =>
  import('./routes/pro/bulletins/list.js').then((m) => ({ default: m.ProBulletins })),
);
const ProBulletinsUpload = lazy(() =>
  import('./routes/pro/bulletins/reconciliation.js').then((m) => ({
    default: m.ProBulletinsUpload,
  })),
);
const ProBulletinDepotIndividuel = lazy(() =>
  import('./routes/pro/bulletins/depot-individuel.js').then((m) => ({
    default: m.ProBulletinDepotIndividuel,
  })),
);
const ProSuivi = lazy(() =>
  import('./routes/pro/suivi.js').then((m) => ({ default: m.ProSuivi })),
);
const ProReclamations = lazy(() =>
  import('./routes/pro/reclamations.js').then((m) => ({ default: m.ProReclamations })),
);
const ProFacturation = lazy(() =>
  import('./routes/pro/facturation.js').then((m) => ({ default: m.ProFacturation })),
);
const ProSecurite = lazy(() =>
  import('./routes/pro/securite.js').then((m) => ({ default: m.ProSecurite })),
);
const ProParametres = lazy(() =>
  import('./routes/pro/parametres.js').then((m) => ({ default: m.ProParametres })),
);

// ─── Surface mobile salarié (étape 10) — shell + placeholders ────────────
const MobileLayout = lazy(() =>
  import('./routes/app/_layout.js').then((m) => ({ default: m.MobileLayout })),
);
const MobileAccueil = lazy(() =>
  import('./routes/app/accueil.js').then((m) => ({ default: m.MobileAccueil })),
);
const MobileCoffre = lazy(() =>
  import('./routes/app/coffre.js').then((m) => ({ default: m.MobileCoffre })),
);
const MobileNotifications = lazy(() =>
  import('./routes/app/notifications.js').then((m) => ({
    default: m.MobileNotifications,
  })),
);
const MobileProfil = lazy(() =>
  import('./routes/app/profil.js').then((m) => ({ default: m.MobileProfil })),
);
const MobileBulletin = lazy(() =>
  import('./routes/app/bulletin.js').then((m) => ({ default: m.MobileBulletin })),
);
const MobileSignature = lazy(() =>
  import('./routes/app/signature.js').then((m) => ({ default: m.MobileSignature })),
);
const MobileActivation = lazy(() =>
  import('./routes/app/activation.js').then((m) => ({ default: m.MobileActivation })),
);

/** Fallback de chargement minimal — fond papier pour éviter le flash blanc. */
function Chargement(): ReactNode {
  return <div className="min-h-screen bg-papier" aria-hidden />;
}

function WithSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Chargement />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Landing publique (entrée principale)
  { path: '/', element: <SiteLanding /> },

  // Hub dev (bascule entre surfaces)
  {
    path: '/preview',
    element: (
      <WithSuspense>
        <PreviewHub />
      </WithSuspense>
    ),
  },

  // Surface publique — auth
  {
    path: '/connexion',
    element: (
      <WithSuspense>
        <SiteConnexion />
      </WithSuspense>
    ),
  },
  {
    path: '/inscription',
    element: (
      <WithSuspense>
        <SiteInscription />
      </WithSuspense>
    ),
  },
  {
    path: '/devenir-partenaire',
    element: (
      <WithSuspense>
        <SiteDevenirPartenaire />
      </WithSuspense>
    ),
  },
  {
    path: '/mot-de-passe-oublie',
    element: (
      <WithSuspense>
        <SiteMotDePasseOublie />
      </WithSuspense>
    ),
  },
  {
    path: '/pro/onboarding',
    element: (
      <WithSuspense>
        <SiteOnboarding />
      </WithSuspense>
    ),
  },

  // Surface publique — légal
  {
    path: '/mentions-legales',
    element: (
      <WithSuspense>
        <MentionsLegales />
      </WithSuspense>
    ),
  },
  {
    path: '/confidentialite',
    element: (
      <WithSuspense>
        <Confidentialite />
      </WithSuspense>
    ),
  },
  {
    path: '/cgu',
    element: (
      <WithSuspense>
        <CGU />
      </WithSuspense>
    ),
  },
  {
    path: '/conformite-artci',
    element: (
      <WithSuspense>
        <ConformiteARTCI />
      </WithSuspense>
    ),
  },

  // Surface publique — sous-landings
  {
    path: '/cabinets',
    element: (
      <WithSuspense>
        <PageCabinets />
      </WithSuspense>
    ),
  },
  {
    path: '/salaries',
    element: (
      <WithSuspense>
        <PageSalaries />
      </WithSuspense>
    ),
  },

  // Surface publique — ressources
  {
    path: '/documentation',
    element: (
      <WithSuspense>
        <PageDocumentation />
      </WithSuspense>
    ),
  },
  {
    path: '/centre-aide',
    element: (
      <WithSuspense>
        <PageCentreAide />
      </WithSuspense>
    ),
  },
  {
    path: '/blog',
    element: (
      <WithSuspense>
        <PageBlog />
      </WithSuspense>
    ),
  },
  {
    path: '/contact',
    element: (
      <WithSuspense>
        <PageContact />
      </WithSuspense>
    ),
  },

  // Surface Pli Pro — sidebar + topbar via ProLayout
  {
    path: '/pro',
    element: (
      <WithSuspense>
        <ProLayout />
      </WithSuspense>
    ),
    children: [
      {
        index: true,
        element: (
          <WithSuspense>
            <ProDashboard />
          </WithSuspense>
        ),
      },
      {
        path: 'salaries',
        element: (
          <WithSuspense>
            <ProSalaries />
          </WithSuspense>
        ),
      },
      {
        path: 'salaries/import',
        element: (
          <WithSuspense>
            <ProSalariesImport />
          </WithSuspense>
        ),
      },
      {
        path: 'salaries/:id',
        element: (
          <WithSuspense>
            <ProSalarieDetail />
          </WithSuspense>
        ),
      },
      {
        path: 'bulletins',
        element: (
          <WithSuspense>
            <ProBulletins />
          </WithSuspense>
        ),
      },
      {
        path: 'bulletins/upload',
        element: (
          <WithSuspense>
            <ProBulletinsUpload />
          </WithSuspense>
        ),
      },
      {
        path: 'bulletins/depot-individuel',
        element: (
          <WithSuspense>
            <ProBulletinDepotIndividuel />
          </WithSuspense>
        ),
      },
      {
        path: 'suivi',
        element: (
          <WithSuspense>
            <ProSuivi />
          </WithSuspense>
        ),
      },
      {
        path: 'reclamations',
        element: (
          <WithSuspense>
            <ProReclamations />
          </WithSuspense>
        ),
      },
      {
        path: 'facturation',
        element: (
          <WithSuspense>
            <ProFacturation />
          </WithSuspense>
        ),
      },
      {
        path: 'securite',
        element: (
          <WithSuspense>
            <ProSecurite />
          </WithSuspense>
        ),
      },
      {
        path: 'parametres',
        element: (
          <WithSuspense>
            <ProParametres />
          </WithSuspense>
        ),
      },
    ],
  },

  // Surface mobile salarié — PhoneFrame + MobileTabBar via MobileLayout
  {
    path: '/app',
    element: (
      <WithSuspense>
        <MobileLayout />
      </WithSuspense>
    ),
    children: [
      {
        index: true,
        element: (
          <WithSuspense>
            <MobileAccueil />
          </WithSuspense>
        ),
      },
      {
        path: 'coffre',
        element: (
          <WithSuspense>
            <MobileCoffre />
          </WithSuspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <WithSuspense>
            <MobileNotifications />
          </WithSuspense>
        ),
      },
      {
        path: 'profil',
        element: (
          <WithSuspense>
            <MobileProfil />
          </WithSuspense>
        ),
      },
      {
        path: 'bulletin/:id',
        element: (
          <WithSuspense>
            <MobileBulletin />
          </WithSuspense>
        ),
      },
      {
        path: 'bulletin/:id/signer',
        element: (
          <WithSuspense>
            <MobileSignature />
          </WithSuspense>
        ),
      },
    ],
  },

  // Activation salarié — hors layout /app (le compte n'existe pas encore,
  // pas de TabBar à afficher).
  {
    path: '/activation',
    element: (
      <WithSuspense>
        <MobileActivation />
      </WithSuspense>
    ),
  },

  // Console opérateur — noindex injecté par AdminLayout
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [{ index: true, element: <AdminHub /> }],
  },

  // 404 catch-all
  { path: '*', element: <NotFound /> },
]);
