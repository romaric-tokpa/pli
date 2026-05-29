// Shell partagé des pages publiques — port verbatim de site-landing.jsx
// (SiteNav et SiteFooter). Utilisé par la landing et par toutes les pages
// publiques pour parité visuelle stricte.

import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Logo, SealIcon } from '@pli/ui';

interface ShellProps {
  children: ReactNode;
}

export function SitePageShell({ children }: ShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-papier">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

// -----------------------------------------------------------------------------
// SiteNav — port verbatim de site-landing.jsx (sticky avec menu mobile).
// Les liens d'ancres (#fonctionnalites, #tarifs…) fonctionnent sur la landing
// et restent inertes sur les autres pages — comportement attendu.
// -----------------------------------------------------------------------------
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const links: Array<readonly [string, string]> = [
    ['#fonctionnalites', 'Fonctionnalités'],
    ['#pour-qui', 'Pour qui'],
    ['#tarifs', 'Tarifs'],
    ['#securite', 'Sécurité'],
    ['#faq', 'FAQ'],
  ];
  return (
    <header className="sticky top-0 z-40 bg-papier/85 backdrop-blur border-b border-bordure">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center focus-ring rounded">
          <Logo size={32} withWordmark />
        </Link>
        <nav className="hidden md:flex items-center gap-6 ml-4">
          {links.map(([h, l]) => (
            <a
              key={h}
              href={h}
              className="nav-link text-[13.5px] text-encre/85 hover:text-encre font-medium transition"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/connexion"
            className="hidden sm:inline-flex items-center h-9 px-3.5 text-[13.5px] text-encre font-medium hover:bg-white/60 rounded-md transition focus-ring"
          >
            Se connecter
          </Link>
          <Link
            to="/inscription"
            className="inline-flex items-center gap-1.5 h-9 px-4 text-[13.5px] bg-encre text-white font-medium rounded-md hover:bg-[#0F1F3D] transition focus-ring"
          >
            Démarrer l'essai
            <Icon name="ArrowRight" size={13} />
          </Link>
          <button
            type="button"
            className="md:hidden h-9 w-9 rounded-md flex items-center justify-center text-encre hover:bg-white/60 focus-ring"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <Icon name="Menu" size={18} />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-bordure bg-papier/95">
          <div className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-1">
            {links.map(([h, l]) => (
              <a
                key={h}
                href={h}
                onClick={() => setOpen(false)}
                className="px-2 py-2 rounded-md text-[14px] text-encre hover:bg-white/60"
              >
                {l}
              </a>
            ))}
            <Link
              to="/connexion"
              onClick={() => setOpen(false)}
              className="px-2 py-2 rounded-md text-[14px] text-encre hover:bg-white/60"
            >
              Se connecter
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// -----------------------------------------------------------------------------
// SiteFooter — port verbatim avec newsletter, watermark sceau, réassurance.
// -----------------------------------------------------------------------------
const FOOTER_COLS: Array<{
  titre: string;
  liens: Array<readonly [to: string, label: string]>;
}> = [
  {
    titre: 'Produit',
    liens: [
      ['/#fonctionnalites', 'Fonctionnalités'],
      ['/#tarifs', 'Tarifs'],
      ['/#securite', 'Sécurité'],
      ['/#faq', 'FAQ'],
      ['/inscription', "Démarrer l'essai"],
    ],
  },
  {
    titre: 'Pour qui',
    liens: [
      ['/#pour-qui', 'Entreprises & RH'],
      ['/cabinets', 'Cabinets partenaires'],
      ['/salaries', 'Salariés'],
    ],
  },
  {
    titre: 'Ressources',
    liens: [
      ['/documentation', 'Documentation'],
      ['/centre-aide', "Centre d'aide"],
      ['/blog', 'Blog'],
      ['/contact', 'Contact commercial'],
    ],
  },
  {
    titre: 'Légal',
    liens: [
      ['/mentions-legales', 'Mentions légales'],
      ['/confidentialite', 'Confidentialité'],
      ['/cgu', 'CGU'],
      ['/conformite-artci', 'Conformité ARTCI'],
    ],
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState('');
  const [abonne, setAbonne] = useState(false);

  return (
    <footer className="bg-encre text-white relative overflow-hidden">
      <style>{`
        .footer-link { position: relative; transition: color .25s ease, transform .25s ease; display: inline-flex; align-items: center; gap: 6px; }
        .footer-link::before { content: ""; width: 0; height: 1px; background: var(--pli-cachet); transition: width .35s cubic-bezier(.16,1,.3,1); }
        .footer-link:hover { color: #ffffff; }
        .footer-link:hover::before { width: 16px; }
        .footer-social { width: 38px; height: 38px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); transition: background-color .25s ease, transform .25s ease, border-color .25s ease; color: rgba(255,255,255,.7); }
        .footer-social:hover { background: rgb(from var(--pli-cachet) r g b / 0.15); border-color: rgb(from var(--pli-cachet) r g b / 0.4); color: #fff; transform: translateY(-2px); }
        @media (prefers-reduced-motion: reduce) {
          .footer-link, .footer-link::before, .footer-social { transition: none !important; }
        }
      `}</style>

      <div className="absolute -left-32 -top-32 opacity-[0.05] pointer-events-none">
        <SealIcon size={520} variant="blanc" />
      </div>
      <div className="absolute right-0 bottom-0 opacity-[0.04] pointer-events-none">
        <SealIcon size={380} variant="blanc" />
      </div>

      <div className="relative border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-14 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cachet/15 border border-cachet/30 text-[12px] text-cachet font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-cachet pulse-dot" />
              Prêt à basculer ?
            </div>
            <h3 className="mt-4 text-[28px] md:text-[34px] font-semibold leading-tight">
              Distribuez votre prochaine paie avec Pli.
            </h3>
            <p className="mt-3 text-[14.5px] text-white/65 max-w-xl">
              20 bulletins offerts à l'essai. Sans engagement. Activation immédiate.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) {
                setAbonne(true);
                setEmail('');
              }
            }}
            className="rounded-xl bg-white/[0.04] border border-white/10 p-5"
          >
            <div
              className="block text-[12px] uppercase tracking-wide text-white/55 font-semibold mb-2.5"
              style={{ letterSpacing: '.08em' }}
            >
              Recevez la lettre Pli
            </div>
            {abonne ? (
              <div className="flex items-center gap-2.5 px-3 py-3 rounded-md bg-succes/10 border border-succes/30 text-[13px]">
                <Icon name="CircleCheckBig" size={16} className="text-succes shrink-0" />
                <span>Merci ! Vous recevrez nos prochaines actualités.</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex items-center gap-2 flex-1 px-3 h-11 bg-white/[0.06] rounded-md border border-white/15 focus-within:border-cachet transition">
                  <Icon name="Mail" size={14} className="text-white/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@entreprise.ci"
                    aria-label="E-mail"
                    className="flex-1 bg-transparent outline-none text-[13.5px] text-white placeholder:text-white/35"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-4 rounded-md bg-cachet text-white text-[13.5px] font-semibold hover:bg-[#9F4A2F] transition inline-flex items-center gap-1.5"
                >
                  S'abonner
                  <Icon name="ArrowRight" size={13} />
                </button>
              </div>
            )}
            <p className="mt-2.5 text-[11px] text-white/45">
              Une lettre par mois. Désabonnement en un clic.
            </p>
          </form>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-14 grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-10">
        <div className="col-span-2">
          <svg
            viewBox="0 0 64 64"
            width={88}
            height={88}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Pli"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--pli-cachet)"
              strokeWidth="2"
              strokeDasharray="1.3 3.3"
            />
            <circle cx="32" cy="32" r="22" fill="none" stroke="#FFFFFF" strokeWidth="1" />
          </svg>
          <p className="mt-4 text-[13px] text-white/65 max-w-xs leading-relaxed">
            Pli est le coffre-fort de paie des entreprises ivoiriennes. Bien reçu. Bien gardé.
          </p>

          <div className="mt-5 space-y-2 text-[12.5px] text-white/65">
            <a
              href="mailto:contact@pli.ci"
              className="footer-link inline-flex items-center gap-2 hover:text-white"
            >
              <Icon name="Mail" size={12} className="text-cachet" />
              <span>contact@pli.ci</span>
            </a>
            <a
              href="tel:+22527203040"
              className="footer-link flex items-center gap-2 hover:text-white"
            >
              <Icon name="Phone" size={12} className="text-cachet" />
              <span>+225 27 20 30 40 50</span>
            </a>
            <div className="flex items-start gap-2">
              <Icon name="MapPin" size={12} className="text-cachet mt-0.5 shrink-0" />
              <span>Plateau, Abidjan — Côte d'Ivoire</span>
            </div>
          </div>

          <div className="mt-6">
            <div
              className="text-[10.5px] uppercase tracking-wide text-white/40 mb-2.5 font-semibold"
              style={{ letterSpacing: '.08em' }}
            >
              Suivez-nous
            </div>
            <div className="flex items-center gap-2">
              {(
                [
                  { icon: 'Linkedin', label: 'LinkedIn' },
                  { icon: 'Send', label: 'X' },
                  { icon: 'Globe', label: 'Site' },
                  { icon: 'Github', label: 'GitHub' },
                ] as const
              ).map((s) => (
                <button key={s.label} type="button" aria-label={s.label} className="footer-social">
                  <Icon name={s.icon} size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {FOOTER_COLS.map((c) => (
          <div key={c.titre}>
            <div
              className="text-[10.5px] uppercase tracking-wide text-white/45 font-semibold mb-3.5"
              style={{ letterSpacing: '.08em' }}
            >
              {c.titre}
            </div>
            <ul className="space-y-2.5">
              {c.liens.map(([to, label]) => (
                <li key={label}>
                  {to.startsWith('/#') ? (
                    <a href={to} className="footer-link text-[13px] text-white/70 hover:text-white">
                      {label}
                    </a>
                  ) : (
                    <Link
                      to={to}
                      className="footer-link text-[13px] text-white/70 hover:text-white"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10 bg-black/10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11.5px] text-white/55">
          <span className="inline-flex items-center gap-2">
            <Icon name="ShieldCheck" size={12} className="text-succes" />
            Conformité ARTCI
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="Lock" size={12} className="text-cachet" />
            Chiffrement de bout en bout
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="BadgeCheck" size={12} className="text-cachet" />
            Validation horodatée
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="MapPin" size={12} className="text-cachet" />
            Hébergement Abidjan
          </span>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-white/55">
          <div className="flex items-center gap-2">
            <SealIcon size={18} variant="blanc" />
            <span>© 2026 Pli SARL — Tous droits réservés.</span>
            <span className="text-cachet">·</span>
            <span className="italic">Bien reçu. Bien gardé.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/mentions-legales" className="footer-link hover:text-white">
              Mentions légales
            </Link>
            <Link to="/confidentialite" className="footer-link hover:text-white">
              Confidentialité
            </Link>
            <Link to="/preview" className="text-white/35 hover:text-white/65 text-[10.5px]">
              Navigation prototype
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
