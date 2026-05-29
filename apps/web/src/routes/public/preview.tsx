// PreviewHub — bascule de surfaces (Pro / mobile salarié / cabinet).
// Port verbatim de _wireframe/src/home.jsx (route ancienne #/preview).
//
// La landing publique vit à `/` ; ce hub n'a pas vocation à être l'entrée du
// site marketing — il sert d'index dev pour parcourir les 3 surfaces pendant
// la migration.

import { useNavigate } from 'react-router-dom';
import { Icon, Logo, SealIcon } from '@pli/ui';

const ROUTES_PROTOTYPE: Array<readonly [chemin: string, libelle: string]> = [
  ['/pro/connexion', 'Connexion Pli Pro'],
  ['/pro', 'Tableau de bord'],
  ['/pro/salaries/import', "Assistant d'import"],
  ['/pro/bulletins/upload', 'Upload + appairage'],
  ['/pro/reclamations', 'Réclamations'],
  ['/app', 'Accueil salarié'],
  ['/app/coffre', 'Coffre-fort'],
  ['/app/bulletin/b-s1-2026-02', 'Visionneuse bulletin'],
  ['/cabinet/connexion', 'Connexion gestionnaire cabinet'],
  ['/cabinet', 'Tableau de bord portefeuille'],
  ['/cabinet/entreprises/ec-cacao', 'Espace entreprise scellé'],
  ['/cabinet/facturation', 'Facturation cabinet'],
];

export function PreviewHub() {
  const navigate = useNavigate();
  const aller = (chemin: string) => navigate(chemin);

  return (
    <div className="min-h-screen bg-papier flex flex-col">
      {/* Bandeau */}
      <header className="px-8 py-5 flex items-center justify-between">
        <Logo size={36} withWordmark descripteur />
        <div className="hidden md:flex items-center gap-2 text-[13px] text-texte-secondaire">
          <Icon name="ShieldCheck" size={14} className="text-encre" />
          <span>Prototype haute-fidélité — données de démonstration</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-8 py-10 lg:py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-bordure text-[12px] text-encre">
            <span className="h-1.5 w-1.5 rounded-full bg-cachet" />
            Distribution sécurisée des bulletins de paie
          </span>
          <h1 className="mt-5 text-[44px] leading-[1.1] font-semibold text-encre tracking-tight">
            Le coffre-fort de paie
            <br />
            pour les entreprises ivoiriennes.
          </h1>
          <p className="mt-5 text-[16px] text-texte-secondaire max-w-2xl">
            Pli scelle, distribue et conserve les bulletins de vos salariés. Choisissez la surface à
            explorer : le back-office RH, ou l'application mobile du salarié.
          </p>
        </div>

        {/* Deux cartes principales : Pro & Mobile */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carte Pli Pro */}
          <button
            type="button"
            onClick={() => aller('/pro')}
            className="group text-left bg-white rounded-lg border border-bordure p-7 hover:border-encre transition shadow-card hover:shadow-float focus-ring"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-2.5 h-7 rounded-full bg-surface text-[12px] text-encre font-medium">
                <Icon name="Building2" size={12} />
                Back-office
              </span>
              <Icon
                name="ArrowUpRight"
                size={20}
                className="text-texte-secondaire group-hover:text-encre transition"
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Logo size={32} withWordmark={false} />
              <div className="text-[22px] font-semibold text-encre">
                Pli <span className="text-cachet">Pro</span>
              </div>
            </div>
            <p className="mt-3 text-[14px] text-texte-secondaire">
              Pour les équipes RH et les administrateurs : import des salariés, dépôt des bulletins,
              suivi des consultations, réclamations, audit.
            </p>
            <div className="mt-6 flex items-center gap-4 text-[12px] text-texte-secondaire">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="Monitor" size={12} />
                Desktop-first
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="Users" size={12} />
                24 salariés
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="FileText" size={12} />
                Février 2026
              </span>
            </div>
            {/* Aperçu illustratif */}
            <div className="mt-6 rounded-md border border-bordure overflow-hidden bg-surface/60">
              <div className="h-1.5 bg-encre" />
              <div className="grid grid-cols-12 gap-3 p-3">
                <div className="col-span-3 space-y-1.5">
                  <div className="h-2 bg-bordure rounded-full" />
                  <div className="h-2 bg-bordure rounded-full w-3/4" />
                  <div className="h-2 bg-encre rounded-full" />
                  <div className="h-2 bg-bordure rounded-full w-2/3" />
                </div>
                <div className="col-span-9 space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-9 bg-white rounded border border-bordure" />
                    <div className="h-9 bg-white rounded border border-bordure" />
                    <div className="h-9 bg-white rounded border border-bordure" />
                    <div className="h-9 bg-white rounded border border-bordure" />
                  </div>
                  <div className="h-16 bg-white rounded border border-bordure" />
                </div>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-encre font-medium">
              Ouvrir Pli Pro
              <Icon name="ArrowRight" size={14} />
            </div>
          </button>

          {/* Carte Pli mobile */}
          <button
            type="button"
            onClick={() => aller('/app')}
            className="group text-left bg-white rounded-lg border border-bordure p-7 hover:border-encre transition shadow-card hover:shadow-float focus-ring"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-2.5 h-7 rounded-full bg-surface text-[12px] text-encre font-medium">
                <Icon name="Smartphone" size={12} />
                Application salarié
              </span>
              <Icon
                name="ArrowUpRight"
                size={20}
                className="text-texte-secondaire group-hover:text-encre transition"
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Logo size={32} withWordmark={false} />
              <div className="text-[22px] font-semibold text-encre">Pli</div>
            </div>
            <p className="mt-3 text-[14px] text-texte-secondaire">
              Pour les salariés : recevoir, consulter et signer leurs bulletins, poser une
              réclamation, et conserver l'historique tant que leur compte est actif.
            </p>
            <div className="mt-6 flex items-center gap-4 text-[12px] text-texte-secondaire">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="Fingerprint" size={12} />
                Biométrie
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="Vault" size={12} />
                Coffre-fort
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="PenLine" size={12} />
                Signature
              </span>
            </div>
            {/* Aperçu illustratif : mini-phone */}
            <div className="mt-6 mx-auto w-[180px] h-[180px] rounded-3xl bg-encre p-2 shadow-float">
              <div className="w-full h-full rounded-2xl bg-white p-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold text-encre">Bonjour, Aya</div>
                  <Icon name="BellRing" size={12} className="text-cachet" />
                </div>
                <div className="mt-2 rounded-md border border-cachet/30 bg-cachet/5 p-2">
                  <div className="text-[9px] font-medium text-cachet">Nouveau bulletin</div>
                  <div className="text-[10px] text-encre font-semibold">Février 2026</div>
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="h-4 bg-surface rounded" />
                  <div className="h-4 bg-surface rounded" />
                  <div className="h-4 bg-surface rounded" />
                </div>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-encre font-medium">
              Ouvrir Pli mobile
              <Icon name="ArrowRight" size={14} />
            </div>
          </button>
        </div>

        {/* Carte Espace Cabinet */}
        <button
          type="button"
          onClick={() => aller('/cabinet')}
          className="group mt-6 w-full text-left rounded-lg p-6 bg-white border border-bordure hover:border-cachet transition shadow-card hover:shadow-float focus-ring relative overflow-hidden"
        >
          <div className="relative flex items-start gap-6 flex-wrap">
            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-2.5 h-7 rounded-full bg-cachet/10 border border-cachet/30 text-[12px] text-cachet font-medium">
                  <Icon name="Briefcase" size={12} />
                  Espace cabinet
                </span>
                <span
                  className="text-[11px] text-texte-secondaire uppercase tracking-wide"
                  style={{ letterSpacing: '.06em' }}
                >
                  Comptables & intérim
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <SealIcon size={28} />
                <div className="text-[22px] font-semibold text-encre">
                  Pli <span className="text-cachet">Cabinet</span>
                </div>
              </div>
              <p className="mt-2 text-[13.5px] text-texte-secondaire max-w-xl">
                Pour les cabinets qui gèrent plusieurs entreprises clientes : portefeuille
                consolidé, entrée scellée dans chaque entreprise, gestionnaires multiples avec
                affectations.
              </p>
              <div className="mt-4 flex items-center gap-4 text-[12px] text-texte-secondaire flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="LayoutGrid" size={12} />5 entreprises gérées
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="Users" size={12} />
                  146 salariés cumulés
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="UserCog" size={12} />3 gestionnaires
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="ShieldCheck" size={12} />
                  Cloisonnement strict
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <Icon
                name="ArrowUpRight"
                size={20}
                className="text-texte-secondaire group-hover:text-encre transition"
              />
              <div className="inline-flex items-center gap-1.5 text-[13px] text-encre font-medium">
                Ouvrir l'espace cabinet
                <Icon name="ArrowRight" size={14} />
              </div>
            </div>
          </div>
        </button>

        {/* Bandeau info routes */}
        <div className="mt-12 rounded-lg bg-white border border-bordure p-5">
          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-md bg-papier flex items-center justify-center text-cachet shrink-0">
              <Icon name="Compass" size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-encre">Routes du prototype</div>
              <p className="mt-1 text-[13px] text-texte-secondaire">
                Vous pouvez basculer à tout moment en modifiant l'URL. Quelques entrées utiles :
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[12.5px] font-mono text-texte-secondaire">
                {ROUTES_PROTOTYPE.map(([chemin, libelle]) => (
                  <a
                    key={chemin}
                    href={chemin}
                    className="flex items-center justify-between px-3 py-1.5 rounded bg-surface hover:bg-bordure/50 transition"
                  >
                    <span className="text-encre">{chemin}</span>
                    <span className="text-texte-secondaire">{libelle}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-8 py-6 text-center text-[12px] text-texte-secondaire">
        Prototype Pli — Données fictives. Aucun back-end, aucune authentification réelle.
      </footer>
    </div>
  );
}
