// Routes publiques à capturer pour l'audit de parité étape 8.
// Le mapping wireframe (hash routing) ↔ build (path routing) est explicite.

export const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 390, height: 844 }, // iPhone 14 portrait
};

export const ROUTES = [
  { slug: '01-landing', wireframeHash: '#/', buildPath: '/' },
  { slug: '02-connexion', wireframeHash: '#/connexion', buildPath: '/connexion' },
  { slug: '03-inscription-entreprise', wireframeHash: '#/inscription', buildPath: '/inscription' },
  {
    slug: '04-devenir-partenaire',
    wireframeHash: '#/devenir-partenaire',
    buildPath: '/devenir-partenaire',
  },
  {
    slug: '05-mot-de-passe-oublie',
    wireframeHash: '#/mot-de-passe-oublie',
    buildPath: '/mot-de-passe-oublie',
  },
  // ─── A.1 : 2FA standalone + landing email récupération mdp ───────────────
  {
    slug: '05b-verification',
    wireframeHash: '#/verification',
    buildPath: '/verification',
  },
  {
    slug: '05c-reinitialiser-mot-de-passe',
    wireframeHash: '#/reinitialiser-mot-de-passe',
    buildPath: '/reinitialiser-mot-de-passe',
  },
  { slug: '06-mentions-legales', wireframeHash: '#/mentions-legales', buildPath: '/mentions-legales' },
  { slug: '07-confidentialite', wireframeHash: '#/confidentialite', buildPath: '/confidentialite' },
  { slug: '08-cgu', wireframeHash: '#/cgu', buildPath: '/cgu' },
  { slug: '09-conformite-artci', wireframeHash: '#/conformite-artci', buildPath: '/conformite-artci' },
  { slug: '10-cabinets', wireframeHash: '#/cabinets', buildPath: '/cabinets' },
  { slug: '11-salaries', wireframeHash: '#/salaries', buildPath: '/salaries' },
  { slug: '12-documentation', wireframeHash: '#/documentation', buildPath: '/documentation' },
  { slug: '13-centre-aide', wireframeHash: '#/centre-aide', buildPath: '/centre-aide' },
  { slug: '14-blog', wireframeHash: '#/blog', buildPath: '/blog' },
  { slug: '15-contact', wireframeHash: '#/contact', buildPath: '/contact' },
  // ─── Pli Pro (étape 9) ────────────────────────────────────────────────────
  { slug: '20-pro-dashboard', wireframeHash: '#/pro', buildPath: '/pro' },
  { slug: '21-pro-salaries', wireframeHash: '#/pro/salaries', buildPath: '/pro/salaries' },
  {
    slug: '22-pro-salarie-detail',
    wireframeHash: '#/pro/salaries/s1',
    buildPath: '/pro/salaries/s1',
  },
  {
    slug: '23-pro-salaries-import',
    wireframeHash: '#/pro/salaries/import',
    buildPath: '/pro/salaries/import',
  },
  { slug: '24-pro-bulletins', wireframeHash: '#/pro/bulletins', buildPath: '/pro/bulletins' },
  {
    slug: '25-pro-bulletins-upload',
    wireframeHash: '#/pro/bulletins/upload',
    buildPath: '/pro/bulletins/upload',
  },
  {
    slug: '25b-pro-bulletins-depot-individuel',
    wireframeHash: '#/pro/bulletins/depot-individuel',
    buildPath: '/pro/bulletins/depot-individuel',
  },
  { slug: '26-pro-suivi', wireframeHash: '#/pro/suivi', buildPath: '/pro/suivi' },
  {
    slug: '27-pro-reclamations',
    wireframeHash: '#/pro/reclamations',
    buildPath: '/pro/reclamations',
  },
  {
    slug: '28-pro-facturation',
    wireframeHash: '#/pro/facturation',
    buildPath: '/pro/facturation',
  },
  { slug: '29-pro-securite', wireframeHash: '#/pro/securite', buildPath: '/pro/securite' },
  {
    slug: '30-pro-parametres',
    wireframeHash: '#/pro/parametres',
    buildPath: '/pro/parametres',
  },
  // ─── Mobile salarié (étape 10) — shell d'abord, écrans aux sub-lots 10b+ ─
  { slug: '31-app-accueil', wireframeHash: '#/app', buildPath: '/app' },
  { slug: '32-app-coffre', wireframeHash: '#/app/coffre', buildPath: '/app/coffre' },
  {
    slug: '33-app-bulletin',
    wireframeHash: '#/app/bulletin/b-atlantique-2026-02',
    buildPath: '/app/bulletin/b-atlantique-2026-02',
  },
  {
    slug: '34-app-signature',
    wireframeHash: '#/app/bulletin/b-atlantique-2026-02/signer',
    buildPath: '/app/bulletin/b-atlantique-2026-02/signer',
  },
  {
    slug: '35-app-notifications',
    wireframeHash: '#/app/notifications',
    buildPath: '/app/notifications',
  },
  { slug: '36-app-profil', wireframeHash: '#/app/profil', buildPath: '/app/profil' },
  { slug: '37-app-activation', wireframeHash: '#/activation', buildPath: '/activation' },
  // ─── Espace cabinet (étape 11) — shell d'abord (11a), écrans aux sub-lots
  { slug: '38-cabinet-portefeuille', wireframeHash: '#/cabinet', buildPath: '/cabinet' },
  {
    slug: '39-cabinet-entreprise-scellee',
    wireframeHash: '#/cabinet/entreprises/ec-cacao',
    buildPath: '/cabinet/entreprises/ec-cacao',
  },
  { slug: '40-cabinet-suivi', wireframeHash: '#/cabinet/suivi', buildPath: '/cabinet/suivi' },
  {
    slug: '41-cabinet-statistiques',
    wireframeHash: '#/cabinet/statistiques',
    buildPath: '/cabinet/statistiques',
  },
  {
    slug: '42-cabinet-gestionnaires',
    wireframeHash: '#/cabinet/gestionnaires',
    buildPath: '/cabinet/gestionnaires',
  },
  {
    slug: '43-cabinet-facturation',
    wireframeHash: '#/cabinet/facturation',
    buildPath: '/cabinet/facturation',
  },
  {
    slug: '44-cabinet-parametres',
    wireframeHash: '#/cabinet/parametres',
    buildPath: '/cabinet/parametres',
  },
  // ─── Console opérateur (étape 12) — shell d'abord (12a), écrans aux sub-lots
  { slug: '45-admin-vue-ensemble', wireframeHash: '#/admin', buildPath: '/admin' },
  {
    slug: '46-admin-entreprises',
    wireframeHash: '#/admin/entreprises',
    buildPath: '/admin/entreprises',
  },
  {
    slug: '47-admin-cabinets',
    wireframeHash: '#/admin/cabinets',
    buildPath: '/admin/cabinets',
  },
  { slug: '48-admin-revenus', wireframeHash: '#/admin/revenus', buildPath: '/admin/revenus' },
  { slug: '49-admin-plans', wireframeHash: '#/admin/plans', buildPath: '/admin/plans' },
  { slug: '50-admin-sante', wireframeHash: '#/admin/sante', buildPath: '/admin/sante' },
  { slug: '51-admin-audit', wireframeHash: '#/admin/audit', buildPath: '/admin/audit' },
  // ─── 12d : porter les 6 entrées sidebar admin manquantes ─────────────────
  {
    slug: '52-admin-utilisateurs',
    wireframeHash: '#/admin/utilisateurs',
    buildPath: '/admin/utilisateurs',
  },
  { slug: '53-admin-modules', wireframeHash: '#/admin/modules', buildPath: '/admin/modules' },
  { slug: '54-admin-support', wireframeHash: '#/admin/support', buildPath: '/admin/support' },
  {
    slug: '55-admin-conformite',
    wireframeHash: '#/admin/conformite',
    buildPath: '/admin/conformite',
  },
  {
    slug: '56-admin-communications',
    wireframeHash: '#/admin/communications',
    buildPath: '/admin/communications',
  },
  {
    slug: '57-admin-parametres',
    wireframeHash: '#/admin/parametres',
    buildPath: '/admin/parametres',
  },
];
