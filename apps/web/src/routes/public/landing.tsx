// SiteLanding — port verbatim des 14 sections de _wireframe/src/site-landing.jsx.
//
// Toutes les sections : Hero, Valeur (problème → promesse), ValeurEntreprise
// (bento 6 raisons), Fonctionnalités (lignes alternées), CommentCaMarche
// (timeline 4 étapes), PourQui (3 cibles), Tarifs (toggle mensuel/annuel),
// Sécurité (dark encre), Cabinets (bandeau), PourVosSalaries (encre + mockup),
// FAQ (6 accordéons), Preuve (marquee témoignages), CTAFinal.
//
// Adaptations TS minimales :
//   - hash routes (#/...) → React Router <Link to="/...">
//   - hash sections (#fonctionnalites) → <a href="#..."> conservés pour scroll
//   - icônes legacy renommées (AlertTriangle → TriangleAlert,
//     UploadCloud → CloudUpload, CheckCircle2 → CircleCheckBig)
//   - hook `useInView` typed
//
// Libellés juridiques verbatim : « validation horodatée », « Conformité ARTCI »,
// « tant que son compte est actif », « 275 FCFA / salarié actif / mois »,
// « 20 bulletins offerts ». Aucune mention de « valeur probante » ni « à vie ».

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Icon, SealIcon, type IconName } from '@pli/ui';
import { SitePageShell } from './_layout.js';

// -----------------------------------------------------------------------------
// useInView — ajoute la classe `in-view` à un élément quand il entre dans le viewport.
// -----------------------------------------------------------------------------
function useInView<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('in-view');
            io.unobserve(el);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

// -----------------------------------------------------------------------------
// Hero — visuel + tableau de bord RH simulé + bandeau « Bien reçu. Bien gardé. »
// -----------------------------------------------------------------------------
function SiteHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div>
          <span className="hero-fade-up hero-fade-up-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-bordure text-[12px] text-encre">
            <Icon name="Building2" size={11} className="text-cachet" />
            Pour les entreprises ivoiriennes
          </span>
          <h1 className="hero-fade-up hero-fade-up-2 mt-5 text-[40px] md:text-[54px] leading-[1.05] font-semibold text-encre tracking-tight">
            Distribuez les bulletins de paie
            <br />
            de vos salariés <span className="text-cachet">en quelques clics</span>.
          </h1>
          <p className="hero-fade-up hero-fade-up-3 mt-5 text-[16px] md:text-[17px] text-texte-secondaire max-w-2xl leading-relaxed">
            Pli industrialise la remise des bulletins, scelle chaque distribution avec une preuve
            horodatée, et offre à chaque salarié un coffre-fort durable — un argument de marque
            employeur en plus. Conformité ARTCI, suivi des consultations, fini la distribution
            manuelle.
          </p>
          <div className="hero-fade-up hero-fade-up-4 mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/inscription"
              className="inline-flex items-center gap-2 h-12 px-5 bg-encre text-white text-[15px] font-medium rounded-md hover:bg-[#0F1F3D] transition shadow-card btn-lift"
            >
              Démarrer l'essai gratuit — 20 bulletins
              <Icon name="ArrowRight" size={15} />
            </Link>
            <a
              href="#valeur-entreprise"
              className="inline-flex items-center gap-2 h-12 px-5 bg-white text-encre text-[15px] font-medium rounded-md border border-bordure hover:bg-surface transition btn-lift"
            >
              Voir une démo
            </a>
          </div>
          <div className="mt-5 flex items-center gap-4 text-[12.5px] text-texte-secondaire flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="Check" size={13} className="text-succes" />
              Sans engagement
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="Check" size={13} className="text-succes" />
              Paiement Chèque ou Wave
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="Check" size={13} className="text-succes" />
              Hébergement ARTCI Abidjan
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative bg-white rounded-2xl border border-bordure shadow-float p-5 max-w-md mx-auto float-y">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SealIcon size={28} />
                <div>
                  <div
                    className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.06em' }}
                  >
                    Période
                  </div>
                  <div className="text-[13px] font-semibold text-encre">Février 2026</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-succes/10 border border-succes/30 text-[11px] text-succes font-medium">
                <Icon name="Send" size={10} />
                Distribué
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {(
                [
                  ['Distribués', '22'],
                  ['Consultés', '19'],
                  ['Signés', '16'],
                ] as const
              ).map(([l, v]) => (
                <div key={l} className="rounded-md bg-papier border border-bordure p-2.5">
                  <div
                    className="text-[10px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.05em' }}
                  >
                    {l}
                  </div>
                  <div className="text-[18px] font-semibold text-encre tabular-nums">{v}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-md border border-bordure p-2.5">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-encre">Taux de consultation</span>
                <span className="text-encre font-semibold">86%</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-encre rounded-full" style={{ width: '86%' }} />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-bordure space-y-1.5">
              {(
                [
                  ['Aya Koffi · MAT-00112', 'Signé', 'succes'],
                  ["Kouadio N'Guessan · MAT-00118", 'Consulté', 'neutre'],
                  ['Fatou Diallo · MAT-00120', 'Non consulté', 'attente'],
                ] as const
              ).map(([l, s, t]) => (
                <div key={l} className="flex items-center justify-between text-[11px]">
                  <span className="text-encre truncate">{l}</span>
                  <span
                    className={`px-1.5 h-5 inline-flex items-center rounded-full font-medium ${
                      t === 'succes'
                        ? 'bg-succes/10 text-succes'
                        : t === 'attente'
                          ? 'bg-attente/10 text-attente'
                          : 'bg-surface text-texte-secondaire'
                    }`}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -left-3 md:-left-8 -bottom-4 bg-cachet text-white px-4 py-2 rounded-lg shadow-float rotate-[-3deg] hidden sm:block wiggle-stamp">
            <div
              className="text-[10px] uppercase tracking-wide opacity-80"
              style={{ letterSpacing: '.06em' }}
            >
              Signature
            </div>
            <div className="text-[14px] font-semibold">Bien reçu. Bien gardé.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SiteValeur — Problème → Promesse Pli
// -----------------------------------------------------------------------------
function SiteValeur() {
  const problems: Array<{ icon: IconName; titre: string; desc: string }> = [
    {
      icon: 'TriangleAlert',
      titre: 'Remise manuelle pénible',
      desc: 'Imprimer, signer, distribuer chaque bulletin coûte du temps RH sans laisser de preuve.',
    },
    {
      icon: 'FileX',
      titre: 'Historique perdu',
      desc: "À chaque changement d'employeur, le salarié perd l'accès à ses anciens bulletins.",
    },
    {
      icon: 'EyeOff',
      titre: 'Aucune traçabilité',
      desc: "Sans accusé de réception ni signature, impossible de prouver qu'un bulletin a été remis.",
    },
  ];
  return (
    <section className="py-16 md:py-20 bg-white border-y border-bordure">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl">
          <div
            className="text-[12px] uppercase tracking-wide text-cachet font-medium"
            style={{ letterSpacing: '.08em' }}
          >
            Le problème
          </div>
          <h2 className="reveal mt-2 text-[28px] md:text-[36px] font-semibold text-encre leading-tight">
            La paie papier n'a plus sa place en 2026.
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map((p) => (
            <div key={p.titre} className="rounded-lg border border-bordure p-5 bg-papier/40">
              <div className="h-10 w-10 rounded-md bg-erreur/10 text-erreur flex items-center justify-center">
                <Icon name={p.icon} size={18} />
              </div>
              <h3 className="mt-3 text-[15px] font-semibold text-encre">{p.titre}</h3>
              <p className="mt-1 text-[13.5px] text-texte-secondaire">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-xl bg-encre text-white p-6 md:p-8 flex items-start gap-5 flex-wrap">
          <SealIcon size={48} variant="blanc" />
          <div className="flex-1 min-w-[260px]">
            <div
              className="text-[12px] uppercase tracking-wide text-cachet"
              style={{ letterSpacing: '.06em' }}
            >
              La promesse Pli
            </div>
            <h3 className="mt-1 text-[24px] font-semibold leading-tight">
              Chaque bulletin remis. Chaque réception prouvée. Chaque salarié servi durablement.
            </h3>
            <p className="mt-2 text-[14px] text-white/75 max-w-2xl">
              Pli industrialise la distribution, scelle chaque document avec horodatage, et confie
              le coffre-fort à la personne — pas à l'employeur. Le salarié garde tout, l'entreprise
              prouve tout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SiteValeurEntreprise — Bento grid 6 raisons
// -----------------------------------------------------------------------------
function SiteValeurEntreprise() {
  const ref = useInView<HTMLDivElement>();
  return (
    <section id="valeur-entreprise" className="py-16 md:py-24 bg-white border-y border-bordure">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-10">
          <div
            className="text-[12px] uppercase tracking-wide text-cachet font-medium"
            style={{ letterSpacing: '.08em' }}
          >
            Pour votre entreprise
          </div>
          <h2 className="reveal mt-2 text-[28px] md:text-[40px] font-semibold text-encre leading-tight">
            Six raisons de basculer sur Pli ce mois-ci.
          </h2>
          <p className="mt-3 text-[15.5px] text-texte-secondaire">
            Le quotidien de vos équipes RH change dès le premier mois de distribution.
          </p>
        </div>

        <div ref={ref} className="bento">
          <div className="b1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-[0.08] pointer-events-none">
              <SealIcon size={260} variant="blanc" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-2.5 h-7 rounded-full bg-cachet/15 border border-cachet/30 text-[11px] text-cachet font-medium">
                <Icon name="Clock" size={11} />
                Bénéfice n°1
              </div>
              <h3 className="mt-5 text-[28px] md:text-[34px] font-semibold leading-tight">
                Reprenez votre temps RH.
              </h3>
              <p className="mt-3 text-[14px] text-white/70 max-w-md">
                Fini la remise manuelle en main propre. Quelques clics suffisent pour distribuer
                toute la paie du mois — preuve incluse.
              </p>
            </div>
            <div className="relative flex items-center gap-3 mt-6">
              <div className="text-[44px] font-semibold leading-none tabular-nums">-87%</div>
              <div className="text-[12px] text-white/60 leading-tight">
                de temps passé
                <br />
                sur la remise
              </div>
            </div>
          </div>

          <div className="b2 flex flex-col justify-between">
            <Icon name="ShieldCheck" size={20} className="text-encre" />
            <div>
              <h3 className="text-[15px] font-semibold text-encre">Preuve &amp; conformité</h3>
              <p className="mt-1 text-[12.5px] text-texte-secondaire">
                Accusé horodaté + validation horodatée. Conformité ARTCI.
              </p>
            </div>
          </div>

          <div className="b3 flex flex-col justify-between">
            <Icon name="Eye" size={20} className="text-cachet" />
            <div>
              <h3 className="text-[15px] font-semibold text-encre">Suivi en temps réel</h3>
              <p className="mt-1 text-[12.5px] text-texte-secondaire">
                Qui a consulté, qui a signé. Relances en un clic.
              </p>
            </div>
          </div>

          <div className="b4 flex flex-col justify-between relative overflow-hidden">
            <Icon name="MessageSquareWarning" size={20} className="text-white/95" />
            <div className="relative">
              <h3 className="text-[15px] font-semibold">Réclamations centralisées</h3>
              <p className="mt-1 text-[12.5px] text-white/80">
                Tous les échanges salariés ↔ RH tracés au même endroit.
              </p>
            </div>
          </div>

          <div className="b5 flex flex-col justify-between">
            <Icon name="PhoneOff" size={20} className="text-encre" />
            <div>
              <h3 className="text-[15px] font-semibold text-encre">Moins de sollicitations</h3>
              <p className="mt-1 text-[12.5px] text-texte-secondaire">
                Les salariés accèdent seuls à leur historique de paie.
              </p>
            </div>
          </div>

          <div className="b6 flex flex-col justify-between">
            <Icon name="Sparkles" size={20} className="text-cachet" />
            <div>
              <h3 className="text-[15px] font-semibold text-encre">Marque employeur</h3>
              <p className="mt-1 text-[12.5px] text-texte-secondaire">
                Un coffre-fort durable offert à chaque collaborateur.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/inscription"
            className="btn-lift inline-flex items-center gap-2 h-12 px-5 bg-encre text-white text-[15px] font-medium rounded-md hover:bg-[#0F1F3D] transition"
          >
            Démarrer l'essai gratuit
            <Icon name="ArrowRight" size={15} />
          </Link>
          <a
            href="#tarifs"
            className="btn-lift inline-flex items-center gap-2 h-12 px-5 bg-white text-encre text-[14.5px] font-medium rounded-md border border-bordure hover:bg-surface transition"
          >
            Voir les tarifs
          </a>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SiteFonctionnalites — 6 lignes alternées
// -----------------------------------------------------------------------------
function SiteFonctionnalites() {
  const ref = useInView<HTMLDivElement>(0.1);
  const feats: Array<{ icon: IconName; titre: string; desc: string }> = [
    {
      icon: 'FileCheck2',
      titre: 'Distribution en masse',
      desc: "Glissez vos PDF — Pli détecte automatiquement le matricule de chaque bulletin et l'apparie au salarié correspondant. Erreurs explicitement signalées avant validation.",
    },
    {
      icon: 'Vault',
      titre: 'Coffre-fort durable',
      desc: 'Chaque bulletin reste accessible au salarié tant que son compte est actif, même après son départ. Coffre rattaché à un téléphone personnel, agrégation multi-employeurs.',
    },
    {
      icon: 'PenLine',
      titre: 'Signature horodatée',
      desc: "Validation simple côté salarié. Certificat numérique délivré par OneCI, horodatage certifié pour l'employeur.",
    },
    {
      icon: 'MessageSquareWarning',
      titre: 'Réclamations tracées',
      desc: 'Fil de discussion bidirectionnel entre salarié et RH. Statuts (nouvelle / en cours / résolue), pièces jointes, horodatages clairs.',
    },
    {
      icon: 'Eye',
      titre: 'Suivi des consultations',
      desc: 'Tableau de bord en temps réel : qui a consulté, qui doit signer, qui est en retard. Relances individuelles ou en masse en un clic.',
    },
    {
      icon: 'ShieldCheck',
      titre: 'Conformité ARTCI',
      desc: "Hébergement Côte d'Ivoire, validation horodatée, cloisonnement strict, journal d'audit complet.",
    },
  ];
  return (
    <section id="fonctionnalites" className="py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-10">
          <div
            className="text-[12px] uppercase tracking-wide text-cachet font-medium"
            style={{ letterSpacing: '.08em' }}
          >
            Fonctionnalités clés
          </div>
          <h2 className="reveal mt-2 text-[28px] md:text-[36px] font-semibold text-encre leading-tight">
            Tout ce qu'il faut pour la paie. Rien de plus.
          </h2>
          <p className="mt-3 text-[15px] text-texte-secondaire">
            Une plateforme volontairement sobre, pensée pour le travail RH quotidien.
          </p>
        </div>

        <div ref={ref} className="space-y-2">
          {feats.map((f, i) => (
            <FeatRow key={f.titre} f={f} alt={i % 2 === 1} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatRow({
  f,
  alt,
  index,
}: {
  f: { icon: IconName; titre: string; desc: string };
  alt: boolean;
  index: number;
}) {
  const ref = useInView<HTMLDivElement>(0.25);
  return (
    <div
      ref={ref}
      className={`feat-row ${alt ? 'alt' : ''} in-view`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="feat-icon">
        <Icon name={f.icon} size={26} />
      </div>
      <div>
        <h3 className="text-[17px] font-semibold text-encre">{f.titre}</h3>
        <p className="mt-1.5 text-[13.5px] text-texte-secondaire leading-relaxed">{f.desc}</p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SiteCommentCaMarche — timeline 4 étapes
// -----------------------------------------------------------------------------
function SiteCommentCaMarche() {
  const ref = useInView<HTMLDivElement>(0.18);
  const etapes: Array<{ titre: string; desc: string; icon: IconName }> = [
    {
      titre: 'Importez vos salariés',
      desc: 'CSV, Excel, ou ajout manuel. Pli gère matricules, services et e-mails professionnels — référentiel propre à chaque entreprise.',
      icon: 'Users',
    },
    {
      titre: 'Déposez les bulletins',
      desc: "Upload en masse ou individuel. Pli détecte le matricule dans chaque PDF et l'apparie automatiquement.",
      icon: 'CloudUpload',
    },
    {
      titre: 'Le salarié consulte et signe',
      desc: "Application mobile. Accusé de réception automatique à l'ouverture, signature horodatée en option, certificat délivré.",
      icon: 'Smartphone',
    },
    {
      titre: 'Tout est conservé durablement',
      desc: "Coffre-fort durable côté salarié (clé personnelle). L'entreprise conserve la preuve horodatée de chaque remise.",
      icon: 'Vault',
    },
  ];
  return (
    <section className="py-16 md:py-20 bg-papier/60 border-y border-bordure">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-12">
          <div
            className="text-[12px] uppercase tracking-wide text-cachet font-medium"
            style={{ letterSpacing: '.08em' }}
          >
            Comment ça marche
          </div>
          <h2 className="reveal mt-2 text-[28px] md:text-[36px] font-semibold text-encre leading-tight">
            4 étapes. Une fois par mois. C'est tout.
          </h2>
        </div>

        <div ref={ref} className="timeline">
          {etapes.map((e, i) => (
            <div key={e.titre} className="timeline-step">
              <div className="timeline-num">{i + 1}</div>
              <div className="timeline-content">
                <div className="flex items-center gap-3 mb-1.5">
                  <Icon name={e.icon} size={18} className="text-cachet" />
                  <h3 className="text-[17px] font-semibold text-encre">{e.titre}</h3>
                </div>
                <p className="text-[13.5px] text-texte-secondaire leading-relaxed max-w-xl">
                  {e.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SitePourQui — 3 cibles (Entreprises principale, Cabinets, Salariés)
// -----------------------------------------------------------------------------
function SitePourQui() {
  const bullets = [
    'Distribution en masse — appairage automatique',
    'Suivi consultations & signatures en direct',
    'Réclamations bidirectionnelles tracées',
    'Conformité ARTCI & validation horodatée',
    'Aucun export à gérer — tout reste dans Pli',
    'Essai 20 bulletins offerts, sans engagement',
  ];
  return (
    <section id="pour-qui" className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl">
          <div
            className="text-[12px] uppercase tracking-wide text-cachet font-medium"
            style={{ letterSpacing: '.08em' }}
          >
            Pour qui
          </div>
          <h2 className="reveal mt-2 text-[28px] md:text-[36px] font-semibold text-encre leading-tight">
            Pli est conçu pour les acheteurs de paie.
          </h2>
          <p className="mt-3 text-[14.5px] text-texte-secondaire">
            Entreprises et cabinets sont au cœur de la plateforme. Vos salariés bénéficient
            gratuitement de l'expérience que vous leur offrez.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
          <div className="rounded-xl border-2 border-encre bg-encre/[0.02] p-6 md:p-7 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-md bg-encre text-white flex items-center justify-center">
                <Icon name="Building2" size={24} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full bg-cachet/10 border border-cachet/30 text-[11px] text-cachet font-medium">
                  <Icon name="Sparkles" size={10} />
                  Cible principale
                </div>
                <h3 className="mt-1 text-[20px] font-semibold text-encre">Entreprises &amp; RH</h3>
              </div>
            </div>
            <p className="mt-4 text-[14px] text-texte-secondaire max-w-2xl">
              Industrialisez la remise mensuelle de vos bulletins. Preuve horodatée, suivi en temps
              réel, relances en un clic. Reprenez votre temps RH.
            </p>
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[13.5px] text-encre">
                  <Icon name="Check" size={14} className="text-succes shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 h-12 px-5 bg-encre text-white text-[15px] font-medium rounded-md hover:bg-[#0F1F3D] transition shadow-card btn-lift"
              >
                Démarrer l'essai gratuit
                <Icon name="ArrowRight" size={14} />
              </Link>
              <a
                href="#tarifs"
                className="inline-flex items-center gap-2 h-12 px-4 bg-white text-encre text-[14px] font-medium rounded-md border border-bordure hover:bg-surface transition"
              >
                Voir les tarifs
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="rounded-xl border border-bordure bg-white p-5 flex flex-col">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-md bg-papier border border-bordure flex items-center justify-center text-cachet">
                  <Icon name="Briefcase" size={20} />
                </div>
                <h3 className="text-[16px] font-semibold text-encre">
                  Cabinets comptables &amp; intérim
                </h3>
              </div>
              <p className="mt-3 text-[13px] text-texte-secondaire">
                Gérez tout votre portefeuille depuis un seul espace, créez vos entreprises clientes,
                plusieurs gestionnaires.
              </p>
              <Link
                to="/devenir-partenaire"
                className="mt-4 inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-md bg-white text-encre text-[14px] font-medium border border-bordure hover:bg-surface transition"
              >
                Devenir partenaire
                <Icon name="ArrowRight" size={13} />
              </Link>
            </div>

            <div className="rounded-xl border border-bordure bg-papier/40 p-5 flex flex-col">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-md bg-white border border-bordure flex items-center justify-center text-cachet">
                  <Icon name="Smartphone" size={18} />
                </div>
                <div>
                  <div
                    className="text-[10px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.06em' }}
                  >
                    Bénéficiaire
                  </div>
                  <h3 className="text-[15px] font-semibold text-encre">Salariés</h3>
                </div>
              </div>
              <p className="mt-3 text-[12.5px] text-texte-secondaire">
                Un coffre-fort de paie durable, offert par leur employeur. Accessible depuis
                l'application mobile.
              </p>
              <Link
                to="/salaries"
                className="mt-4 inline-flex items-center justify-center gap-2 h-10 px-3.5 rounded-md bg-encre text-white text-[13px] font-medium hover:bg-[#0F1F3D] transition btn-lift"
              >
                <Icon name="Smartphone" size={13} />
                Accéder à l'application
              </Link>
              <a
                href="#pour-vos-salaries"
                className="mt-2 inline-flex items-center gap-1 text-[12px] text-encre font-medium hover:underline"
              >
                En savoir plus
                <Icon name="ChevronRight" size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SiteTarifs — toggle mensuel/annuel + carte 275/234 FCFA + composition
// -----------------------------------------------------------------------------
function SiteTarifs() {
  const [cycle, setCycle] = useState<'mensuel' | 'annuel'>('mensuel');
  const prix = cycle === 'mensuel' ? 275 : 234;
  const cycleLabel =
    cycle === 'mensuel'
      ? '/ salarié actif / mois'
      : '/ salarié actif / mois (facturé annuellement)';
  return (
    <section id="tarifs" className="py-16 md:py-20 bg-papier/60 border-y border-bordure">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div
            className="text-[12px] uppercase tracking-wide text-cachet font-medium"
            style={{ letterSpacing: '.08em' }}
          >
            Tarifs
          </div>
          <h2 className="reveal mt-2 text-[28px] md:text-[36px] font-semibold text-encre leading-tight">
            Un forfait, tout compris.
          </h2>
          <p className="mt-3 text-[15px] text-texte-secondaire">
            Pas de surprise, pas de modules à piles cocher. Composition affichée pour transparence.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex p-1 bg-white border border-bordure rounded-md">
            {(
              [
                ['mensuel', 'Mensuel'],
                ['annuel', 'Annuel — économisez 15 %'],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setCycle(k)}
                className={`h-9 px-4 text-[13px] rounded font-medium transition ${
                  cycle === k ? 'bg-encre text-white' : 'text-encre hover:bg-surface'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="reveal mt-8 max-w-2xl mx-auto rounded-2xl bg-white border border-bordure shadow-card overflow-hidden">
          <div
            className="p-7 md:p-8 text-center"
            style={{ background: 'linear-gradient(180deg, #ffffff 0%, #FDFAF4 100%)' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cachet/10 border border-cachet/30 text-[11.5px] text-cachet font-medium">
              <Icon name="Wallet" size={11} />
              Forfait Pli
            </div>
            <div className="mt-5 text-[56px] md:text-[64px] font-semibold text-encre leading-none tabular-nums">
              {prix}
              <span className="text-[18px] text-texte-secondaire font-normal ml-1">FCFA</span>
            </div>
            <div className="text-[13px] text-texte-secondaire mt-1">{cycleLabel}</div>
            {cycle === 'annuel' && (
              <div className="mt-2 inline-flex items-center gap-1 text-[12px] text-succes font-medium">
                <Icon name="Check" size={12} />≈ 2 mois offerts sur 12
              </div>
            )}
            <div
              className="mt-6 text-[12px] uppercase tracking-wide text-texte-secondaire"
              style={{ letterSpacing: '.05em' }}
            >
              Composition
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 max-w-lg mx-auto">
              {(
                [
                  ['Distribution', 150, 'Send'],
                  ['Signature', 75, 'PenLine'],
                  ['Réclamation', 50, 'MessageSquareWarning'],
                ] as const
              ).map(([l, p, ic]) => (
                <div key={l} className="rounded-md bg-white border border-bordure p-3">
                  <Icon name={ic} size={14} className="text-cachet mx-auto" />
                  <div className="mt-1.5 text-[11.5px] text-texte-secondaire">{l}</div>
                  <div className="text-[14px] font-semibold text-encre tabular-nums">
                    {p} <span className="text-[10px] text-texte-secondaire font-normal">FCFA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-7 md:px-8 py-5 border-t border-bordure bg-white">
            <ul className="space-y-2.5">
              {[
                "20 bulletins offerts à l'essai",
                'Paiement Chèque ou Wave',
                'Sans engagement (mensuel) — résiliable à tout moment',
                'Salariés inactifs et anciens : aucun coût',
                'Coffre-fort salarié inclus, durable',
              ].map((b) => (
                <li key={b} className="flex items-center gap-2 text-[13.5px] text-encre">
                  <Icon name="Check" size={14} className="text-succes shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              to="/inscription"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 h-12 px-5 bg-encre text-white text-[15px] font-medium rounded-md hover:bg-[#0F1F3D] transition"
            >
              Démarrer l'essai gratuit
              <Icon name="ArrowRight" size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SiteSecurite — section dark encre avec 6 items
// -----------------------------------------------------------------------------
function SiteSecurite() {
  const ref = useInView<HTMLUListElement>(0.16);
  const items: Array<{ icon: IconName; titre: string; desc: string }> = [
    {
      icon: 'ShieldCheck',
      titre: 'Conformité ARTCI',
      desc: "Données hébergées en Côte d'Ivoire, registre RGPD.",
    },
    {
      icon: 'PenLine',
      titre: 'Validation horodatée',
      desc: 'Certificat numérique horodaté délivré par OneCI.',
    },
    {
      icon: 'Building2',
      titre: 'Cloisonnement strict',
      desc: "Aucune entreprise ne voit les données d'une autre.",
    },
    {
      icon: 'KeyRound',
      titre: "2FA & journal d'audit",
      desc: 'Authentification forte, traçabilité complète.',
    },
    {
      icon: 'Vault',
      titre: 'Coffre-fort durable',
      desc: 'Le salarié possède son coffre — il survit aux changements.',
    },
    {
      icon: 'Lock',
      titre: 'Chiffrement de bout en bout',
      desc: 'Bulletins chiffrés au repos et en transit.',
    },
  ];
  return (
    <section id="securite" className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-10">
          <div
            className="text-[12px] uppercase tracking-wide text-cachet font-medium"
            style={{ letterSpacing: '.08em' }}
          >
            Sécurité & conformité
          </div>
          <h2 className="reveal mt-2 text-[28px] md:text-[36px] font-semibold text-encre leading-tight">
            La paie mérite mieux qu'un PDF dans une boîte mail.
          </h2>
        </div>

        <div className="sec-dark">
          <div className="absolute -right-24 -bottom-24 opacity-[0.06] pointer-events-none">
            <SealIcon size={420} variant="blanc" />
          </div>

          <div className="relative flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h3 className="text-[20px] md:text-[24px] font-semibold text-white">
                Sécurité de niveau institutionnel.
              </h3>
              <p className="mt-1.5 text-[13.5px] text-white/65 max-w-xl">
                Conçu pour répondre aux exigences des grandes entreprises et aux audits de
                conformité.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cachet/15 border border-cachet/30 text-[12px] text-cachet font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-cachet pulse-dot" />
              ARTCI — Abidjan
            </div>
          </div>

          <ul ref={ref} className="sec-list relative">
            {items.map((it) => (
              <li key={it.titre} className="sec-item">
                <div className="sec-item-icon">
                  <Icon name={it.icon} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-semibold text-white">{it.titre}</div>
                  <div className="text-[12.5px] text-white/65 mt-0.5">{it.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SiteCabinets — bandeau cabinets partenaires
// -----------------------------------------------------------------------------
function SiteCabinets() {
  const inclus = [
    'Portefeuille multi-entreprises',
    'Entrée scellée par client',
    'Facturation consolidée (−10 %) ou commission (15 %)',
    '2FA pour tous les gestionnaires',
    'Affectations granulaires par gestionnaire',
  ];
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="reveal rounded-2xl border border-bordure bg-white p-7 md:p-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <div
              className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-cachet font-medium"
              style={{ letterSpacing: '.08em' }}
            >
              <Icon name="Briefcase" size={13} />
              Espace cabinet
            </div>
            <h2 className="mt-2 text-[24px] md:text-[30px] font-semibold text-encre leading-tight">
              Vous êtes cabinet comptable ou d'intérim ?
            </h2>
            <p className="mt-3 text-[14.5px] text-texte-secondaire max-w-xl">
              Un seul espace pour gérer tous vos clients. Portefeuille consolidé, entrée scellée
              dans chaque entreprise, facturation unique au tarif partenaire, plusieurs
              gestionnaires avec affectations.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/devenir-partenaire"
                className="inline-flex items-center gap-2 h-11 px-4 bg-encre text-white text-[14px] font-medium rounded-md hover:bg-[#0F1F3D] transition"
              >
                Devenir partenaire
                <Icon name="ArrowRight" size={13} />
              </Link>
              <Link
                to="/connexion"
                className="inline-flex items-center gap-2 h-11 px-4 bg-white text-encre text-[14px] font-medium rounded-md border border-bordure hover:bg-surface transition"
              >
                J'ai déjà un compte
              </Link>
            </div>
          </div>
          <div className="rounded-xl bg-papier/70 border border-bordure p-5">
            <div
              className="text-[11px] uppercase tracking-wide text-texte-secondaire"
              style={{ letterSpacing: '.06em' }}
            >
              Inclus
            </div>
            <ul className="mt-2 space-y-2.5 text-[13.5px] text-encre">
              {inclus.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="text-succes mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SitePourVosSalaries — section encre avec mockup mobile
// -----------------------------------------------------------------------------
function SitePourVosSalaries() {
  return (
    <section id="pour-vos-salaries" className="py-14 md:py-20 bg-encre text-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <div
            className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-cachet font-medium"
            style={{ letterSpacing: '.08em' }}
          >
            <Icon name="Sparkles" size={13} />
            Un avantage offert par votre entreprise
          </div>
          <h2 className="reveal mt-2 text-[26px] md:text-[34px] font-semibold leading-tight">
            Vos salariés gardent leur paie
            <br />
            tant que leur compte est actif.
          </h2>
          <p className="mt-3 text-[14.5px] text-white/75 max-w-xl">
            En souscrivant à Pli, vous offrez à chacun de vos salariés un coffre-fort de paie
            personnel, qui les suit même après leur départ. Un argument de{' '}
            <strong className="text-white">marque employeur</strong> concret, sans coût
            supplémentaire pour eux.
          </p>
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(
              [
                ['Vault', 'Coffre-fort durable'],
                ['Smartphone', 'Accès mobile, partout'],
                ['Fingerprint', 'Biométrie + sécurité'],
                ['Eye', 'Transparence totale'],
              ] as const
            ).map(([ic, l]) => (
              <li key={l} className="flex items-center gap-2 text-[13.5px]">
                <Icon name={ic} size={14} className="text-cachet" />
                {l}
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-md bg-white/5 border border-white/10 p-3.5 text-[12.5px] text-white/75">
            <Icon name="Info" size={12} className="inline mr-1 text-cachet" />
            <strong className="text-white">Pour les salariés.</strong> Téléchargez l'application Pli
            quand votre employeur l'aura activée. Connexion par e-mail pro + code + téléphone
            personnel.
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2.5 h-11 px-4 bg-white text-encre text-[13.5px] font-medium rounded-md hover:bg-papier transition"
            >
              <Icon name="Smartphone" size={15} />
              <div className="text-left">
                <div className="text-[9.5px] uppercase tracking-wide opacity-70">
                  Télécharger sur
                </div>
                <div className="text-[12.5px] font-semibold leading-tight">App Store</div>
              </div>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2.5 h-11 px-4 bg-white text-encre text-[13.5px] font-medium rounded-md hover:bg-papier transition"
            >
              <Icon name="Smartphone" size={15} />
              <div className="text-left">
                <div className="text-[9.5px] uppercase tracking-wide opacity-70">
                  Disponible sur
                </div>
                <div className="text-[12.5px] font-semibold leading-tight">Google Play</div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-[200px] h-[390px] rounded-[32px] bg-[#0A1730] p-2.5 shadow-float relative">
            <div className="w-full h-full rounded-[24px] bg-white p-3.5 flex flex-col">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0A1730] rounded-full" />
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-texte-secondaire">Bonjour,</div>
                  <div className="text-[14px] font-semibold text-encre">Aya</div>
                </div>
                <Avatar name="Aya Koffi" size={26} />
              </div>
              <div
                className="mt-2.5 rounded-lg p-2.5 text-white"
                style={{ background: 'linear-gradient(135deg, #B85737, #9F4A2F)' }}
              >
                <div className="text-[8px] uppercase tracking-wide opacity-80">
                  Nouveau bulletin
                </div>
                <div className="text-[12px] font-semibold mt-0.5">Février 2026</div>
                <div className="text-[9px] opacity-85">Groupe Atlantique CI</div>
              </div>
              <div
                className="mt-2.5 text-[8.5px] uppercase tracking-wide text-texte-secondaire"
                style={{ letterSpacing: '.05em' }}
              >
                Anciens employeurs
              </div>
              <div className="mt-1 rounded-md border border-bordure p-2 flex items-center gap-1.5">
                <Icon name="Archive" size={10} className="text-texte-secondaire" />
                <div className="flex-1 text-[9px] text-encre">Comoé Industries</div>
                <span className="text-[8px] text-texte-secondaire">12 bulletins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SiteFAQ — 6 accordéons
// -----------------------------------------------------------------------------
function SiteFAQ() {
  const [open, setOpen] = useState<number>(0);
  const faqs = [
    {
      q: "Que se passe-t-il à la fin de l'essai ?",
      a: "À l'épuisement des 20 bulletins offerts, vous souscrivez un plan (mensuel ou annuel). Sans souscription, la distribution est bloquée mais vos données restent intactes.",
    },
    {
      q: 'Comment Pli apparie-t-il les bulletins ?',
      a: "Pli détecte automatiquement le matricule dans chaque PDF déposé et l'apparie au salarié correspondant. Les erreurs (matricule introuvable, bulletin déjà présent) sont explicitement signalées avant validation.",
    },
    {
      q: "Que devient mon coffre si je change d'employeur ?",
      a: 'Votre coffre-fort vous appartient. Il est rattaché à votre téléphone personnel (clé durable). En cas de changement, votre nouveau RH crée un nouveau rattachement avec votre consentement OTP — vos deux employeurs apparaîtront dans votre coffre, sans se voir.',
    },
    {
      q: 'Mes données sont-elles protégées ?',
      a: "Oui. Hébergement en Côte d'Ivoire (ARTCI), chiffrement de bout en bout, 2FA pour les comptes administrateurs, cloisonnement strict entre entreprises, journal d'audit complet de toute action sensible.",
    },
    {
      q: 'Comment payer ?',
      a: "Par Chèque (à l'ordre de Pli SARL) ou par Wave (Mobile Money). Vous configurez votre mode de paiement à l'inscription, et pouvez le changer à tout moment.",
    },
    {
      q: "Le salarié voit-il l'existence du cabinet ?",
      a: "Non. Quand un cabinet opère pour son employeur, l'identité affichée sur le bulletin et dans le coffre reste celle de l'entreprise. Le cabinet est totalement transparent pour le salarié.",
    },
  ];
  return (
    <section id="faq" className="py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="text-center">
          <div
            className="text-[12px] uppercase tracking-wide text-cachet font-medium"
            style={{ letterSpacing: '.08em' }}
          >
            FAQ
          </div>
          <h2 className="reveal mt-2 text-[28px] md:text-[36px] font-semibold text-encre leading-tight">
            Vos questions, nos réponses.
          </h2>
        </div>
        <div className="mt-10 space-y-2">
          {faqs.map((f, i) => {
            const isOpen = i === open;
            return (
              <div
                key={f.q}
                className={`reveal rounded-lg border border-bordure bg-white overflow-hidden card-lift ${
                  isOpen ? 'faq-open border-encre/30' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-[14.5px] font-semibold text-encre pr-4">{f.q}</span>
                  <Icon
                    name="ChevronDown"
                    size={16}
                    className="faq-caret text-texte-secondaire shrink-0"
                  />
                </button>
                <div
                  className="faq-body px-5 text-[13.5px] text-texte-secondaire leading-relaxed"
                  style={{ paddingBottom: isOpen ? 20 : 0 }}
                >
                  {f.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SitePreuve — marquee témoignages (boucle CSS infinie)
// -----------------------------------------------------------------------------
function SitePreuve() {
  const temoignages = [
    {
      citation:
        'Depuis Pli, on ne court plus après les bulletins en fin de mois. Tout est tracé, tout est signé — et nos salariés sont autonomes.',
      auteur: 'Sylvie Aké',
      role: 'Responsable RH',
      entreprise: 'Groupe Atlantique CI',
    },
    {
      citation:
        'On gère cinq clients depuis un seul écran, avec un cloisonnement net. Le portefeuille consolidé a changé notre quotidien.',
      auteur: 'Edmond Kouassi',
      role: 'Associé fondateur',
      entreprise: 'Cabinet Comptable Ébrié',
    },
    {
      citation:
        "Distribuer 410 bulletins en quelques minutes avec preuve horodatée — c'était impensable avant. Nos équipes ont gagné des journées entières.",
      auteur: 'Olivier Méï',
      role: 'Directeur des opérations',
      entreprise: 'Yamoussoukro Énergie',
    },
    {
      citation:
        'Plus de questions « où est mon bulletin de mars ? ». Les salariés y accèdent seuls, à toute heure. La tranquillité.',
      auteur: 'Fatou Diallo',
      role: 'Chargée RH',
      entreprise: 'Comoé Industries',
    },
    {
      citation:
        'Le passage à la signature électronique a été immédiat. Aucune formation, aucun PDF perdu, juste un accusé pour chaque distribution.',
      auteur: 'Bernadette Aké',
      role: 'Admin RH',
      entreprise: 'Ivoire Logistique',
    },
    {
      citation:
        "Conformité ARTCI, hébergement local, certificat horodaté — nos audits passent en un quart d'heure.",
      auteur: 'Henri Béhi',
      role: 'Directeur Administratif & Financier',
      entreprise: 'Sucrivoire',
    },
  ];

  const loop = [...temoignages, ...temoignages];

  return (
    <section className="py-16 md:py-20 bg-[#F7F7F6] border-y border-bordure">
      <style>{`
        @keyframes marqueeLR {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marqueeLR 60s linear infinite;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.18em] text-texte-secondaire font-medium">
            Ils font confiance à Pli
          </div>
          <h2 className="reveal mt-3 text-[24px] md:text-[30px] font-medium text-encre/85 leading-tight">
            Ce qu'en disent les équipes qui l'utilisent.
          </h2>
        </div>
      </div>

      <div
        className="mt-10 relative overflow-hidden"
        style={{
          WebkitMaskImage:
            'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
        }}
      >
        <ul className="marquee-track flex gap-5 items-stretch">
          {loop.map((t, i) => (
            <li
              key={i}
              className="shrink-0 w-[340px] md:w-[380px] rounded-xl bg-white border border-[#E5E5E2] p-5 md:p-6"
            >
              <Icon name="Quote" size={16} className="text-[#C7C5BF]" />
              <blockquote className="mt-3 text-[13.5px] md:text-[14px] text-[#4B5260] leading-relaxed">
                {t.citation}
              </blockquote>
              <figcaption className="mt-5 pt-4 border-t border-[#EDEBE6]">
                <div className="text-[13px] font-medium text-encre/85">{t.auteur}</div>
                <div className="text-[11.5px] text-texte-secondaire">
                  {t.role} · {t.entreprise}
                </div>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SiteCTAFinal — CTA final
// -----------------------------------------------------------------------------
function SiteCTAFinal() {
  return (
    <section className="py-14 md:py-20">
      <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
        <SealIcon size={40} />
        <h2 className="reveal mt-4 text-[28px] md:text-[36px] font-semibold text-encre leading-tight">
          Prêt à dématérialiser vos bulletins ?
        </h2>
        <p className="mt-3 text-[15px] text-texte-secondaire">
          20 bulletins offerts. Sans carte bancaire. Sans engagement.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 h-12 px-5 bg-encre text-white text-[15px] font-medium rounded-md hover:bg-[#0F1F3D] transition shadow-card btn-lift"
          >
            Démarrer l'essai gratuit
            <Icon name="ArrowRight" size={15} />
          </Link>
          <Link
            to="/connexion"
            className="inline-flex items-center gap-2 h-12 px-5 bg-white text-encre text-[15px] font-medium rounded-md border border-bordure hover:bg-surface transition btn-lift"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// SiteLanding — assemblage des 14 sections + reveal au scroll
// -----------------------------------------------------------------------------
export function SiteLanding() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <SitePageShell>
      <SiteHero />
      <SiteValeur />
      <SiteValeurEntreprise />
      <SiteFonctionnalites />
      <SiteCommentCaMarche />
      <SitePourQui />
      <SiteTarifs />
      <SiteSecurite />
      <SiteCabinets />
      <SitePourVosSalaries />
      <SiteFAQ />
      <SitePreuve />
      <SiteCTAFinal />
    </SitePageShell>
  );
}
