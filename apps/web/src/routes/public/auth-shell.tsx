// AuthShell — gabarit deux colonnes pour les écrans d'auth.
// Port verbatim de _wireframe/src/site-auth-v2.jsx (AuthLayout).
//
// Pattern CLAUDE.md « Auth : mise en page deux colonnes (panneau gauche
// Encre — sceau filigrané, badge ocre, hero "Bien reçu. Bien gardé.",
// 3 preuves, © Pli SARL — + colonne droite Papier avec le formulaire) ».
//
// Cassé sur mobile : la colonne gauche devient un en-tête encre compact,
// le formulaire occupe le reste.

import { Link } from 'react-router-dom';
import { Icon, Logo, SealIcon, type IconName } from '@pli/ui';
import type { ReactNode } from 'react';

interface AuthShellProps {
  children: ReactNode;
  /** Surtitre cachet en haut du formulaire (ex. « CONNEXION »). */
  eyebrow?: string;
  /** Titre h1 du formulaire. */
  title?: string;
  /** Sous-titre sous le h1. */
  subtitle?: string;
  /** Note sous le formulaire (ex. « Déjà un compte ? Se connecter »). */
  footerNote?: ReactNode;
}

const PREUVES: Array<{ icon: IconName; titre: string; desc: string }> = [
  {
    icon: 'ShieldCheck',
    titre: 'Conforme ARTCI',
    desc: "Hébergement Côte d'Ivoire, validation horodatée.",
  },
  {
    icon: 'Vault',
    titre: 'Coffre-fort durable',
    desc: 'Le salarié conserve son historique, même après son départ.',
  },
  {
    icon: 'BadgeCheck',
    titre: 'Preuve de remise',
    desc: 'Accusé horodaté et certificat numérique pour chaque bulletin.',
  },
];

export function AuthShell({ children, eyebrow, title, subtitle, footerNote }: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-papier">
      {/* === Colonne de marque (encre) — desktop === */}
      <aside
        className="hidden lg:flex w-[44%] xl:w-2/5 flex-col p-10 xl:p-14 text-white relative overflow-hidden"
        style={{ backgroundColor: '#15294E' }}
      >
        <div className="absolute -right-32 -bottom-32 opacity-[0.06] pointer-events-none">
          <SealIcon size={520} variant="blanc" />
        </div>
        <div className="absolute right-10 top-10 opacity-[0.08] pointer-events-none">
          <SealIcon size={180} variant="blanc" />
        </div>

        <div className="relative">
          <Link to="/" className="inline-flex focus-ring rounded">
            <Logo size={36} variant="blanc" />
          </Link>
        </div>

        <div className="relative mt-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cachet/15 border border-cachet/30 text-[12px] text-cachet font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-cachet" />
            Le coffre-fort de paie
          </div>
          <h2 className="mt-5 text-[40px] xl:text-[46px] font-semibold leading-[1.05] tracking-tight">
            Bien reçu.
            <br />
            Bien gardé.
          </h2>
          <p className="mt-4 text-[14.5px] text-white/70 max-w-md leading-relaxed">
            Distribuez vos bulletins, prouvez la remise, et offrez à vos salariés un coffre-fort
            durable. Hébergement et conformité ARTCI, Abidjan.
          </p>

          <ul className="mt-8 space-y-3.5">
            {PREUVES.map((p) => (
              <li key={p.titre} className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-white/10 border border-white/15 flex items-center justify-center text-cachet shrink-0">
                  <Icon name={p.icon} size={16} />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">{p.titre}</div>
                  <div className="text-[12px] text-white/65">{p.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-12 text-[11.5px] text-white/40">
          © 2026 Pli SARL — Le coffre-fort de paie
        </div>
      </aside>

      {/* === En-tête mobile compact (encre) === */}
      <header className="lg:hidden px-5 py-5 border-b border-bordure bg-encre text-white">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex focus-ring rounded">
            <Logo size={28} variant="blanc" />
          </Link>
          <Link
            to="/"
            className="text-[12px] text-white/70 inline-flex items-center gap-1 focus-ring rounded"
          >
            <Icon name="ArrowLeft" size={11} />
            Retour
          </Link>
        </div>
        <div className="mt-3 text-[15px] font-semibold">Bien reçu. Bien gardé.</div>
        <div className="text-[11.5px] text-white/65">
          Le coffre-fort de paie pour les entreprises ivoiriennes.
        </div>
      </header>

      {/* === Colonne formulaire (papier) === */}
      <main className="flex-1 flex items-center justify-center px-5 md:px-8 py-10">
        <div className="w-full max-w-[440px]">
          <div className="hidden lg:flex items-center justify-end mb-6">
            <Link
              to="/"
              className="text-[13px] text-encre/70 hover:text-encre inline-flex items-center gap-1.5 focus-ring rounded"
            >
              <Icon name="ArrowLeft" size={13} />
              Retour au site
            </Link>
          </div>

          {(eyebrow || title) && (
            <div className="mb-7">
              {eyebrow && (
                <div
                  className="text-[11.5px] uppercase tracking-wide text-cachet font-semibold"
                  style={{ letterSpacing: '.08em' }}
                >
                  {eyebrow}
                </div>
              )}
              {title && (
                <h1 className="mt-1.5 text-[26px] md:text-[28px] font-semibold text-encre leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-[13.5px] text-texte-secondaire">{subtitle}</p>
              )}
            </div>
          )}

          {children}

          {footerNote && (
            <div className="mt-6 text-center text-[12.5px] text-texte-secondaire">
              {footerNote}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/** Footer ARTCI commun à la connexion / récupération de mot de passe. */
export function AuthFooterArtci() {
  return (
    <>
      <Icon name="ShieldCheck" size={11} className="inline mr-1" />
      Connexion chiffrée · hébergement ARTCI Côte d'Ivoire
    </>
  );
}
