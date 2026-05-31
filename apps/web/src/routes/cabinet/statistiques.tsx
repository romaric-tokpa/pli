// CabinetStatistiques — analyse consolidée du portefeuille (sub-lot 11c).
//
// Porté de _wireframe/src/cabinet-suivi.jsx (CabinetStatistiques).
//
// CHUNKING : 3 graphiques recharts sont chargés en LAZY depuis ce fichier.
// Vérifié au build : ils tombent dans un chunk distinct du bundle cabinet
// initial, et recharts ne se charge que si l'utilisateur navigue sur cette
// page (les autres routes /cabinet n'en payent pas le coût).
//
// CLOISONNEMENT : toutes les valeurs sont dérivées de
// `obtenirMetriquesPortefeuille(ctx: ContextePortefeuilleCabinet)`. Aucune
// méthode cross-cabinet ne peut être appelée — vérifié par le test de
// contrat `suiteContratCloisonnementCabinet`. AUCUN MONTANT (invariant 1).

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  Cabinet,
  Entreprise,
  MetriquesPortefeuilleEntreprise,
} from '@pli/types';
import { Card, Icon, KPICard, Select } from '@pli/ui';
import {
  creerCabinetsServiceMock,
  type ContextePortefeuilleCabinet,
} from '../../services/index.js';
import { CabinetPageHeader } from './_page-header.js';

// ─── recharts en LAZY — chunks séparés ────────────────────────────────────
const ChartEvolutionConsultation = lazy(
  () => import('./charts/chart-evolution-consultation.js'),
);
const ChartBulletinsMois = lazy(() => import('./charts/chart-bulletins-mois.js'));
const ChartRepartitionEntreprises = lazy(
  () => import('./charts/chart-repartition-entreprises.js'),
);

// TODO(phase-1) — voir _layout.tsx
const CONTEXTE_DEMO: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: 'cab-ebrie',
};

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

// Évolution 12 mois — démo cohérente avec data-cabinets.jsx (taux Févr ←
// moyenne portefeuille courante). Constante figée pour Phase 0 — en Phase 1
// elle sera servie par le serveur (historique réel).
const EVOLUTION_12_MOIS_BASE = [
  'Mar.',
  'Avr.',
  'Mai',
  'Juin',
  'Juil.',
  'Août',
  'Sep.',
  'Oct.',
  'Nov.',
  'Déc.',
  'Jan.',
] as const;

const TAUX_HISTORIQUES = [74, 76, 78, 79, 80, 82, 83, 84, 85, 86, 84];

const COULEURS_REPARTITION = ['#15294E', '#B85737', '#2C6FB3', '#2F8F5B', '#D9A227'];

export function CabinetStatistiques() {
  const services = useMemo(() => ({ cabinets: creerCabinetsServiceMock() }), []);

  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [metriques, setMetriques] = useState<MetriquesPortefeuilleEntreprise[]>([]);
  const [periode, setPeriode] = useState('12m');

  useEffect(() => {
    void (async () => {
      const [cab, port, mets] = await Promise.all([
        services.cabinets.obtenirCabinet(CONTEXTE_DEMO),
        services.cabinets.obtenirPortefeuille(CONTEXTE_DEMO),
        services.cabinets.obtenirMetriquesPortefeuille(CONTEXTE_DEMO),
      ]);
      setCabinet(cab);
      setEntreprises(port);
      setMetriques(mets);
    })();
  }, [services]);

  const metsParId = useMemo(
    () => new Map(metriques.map((m) => [m.entrepriseId, m])),
    [metriques],
  );

  const tauxConsultMoyen = entreprises.length
    ? Math.round(
        (metriques.reduce((s, m) => s + m.consultation, 0) / entreprises.length) * 100,
      )
    : 0;

  const bulletinsMois = metriques.reduce((s, m) => s + m.bulletinsMois, 0);
  const signatures = Math.round(bulletinsMois * 0.42);
  const reclamationsOuvertes = entreprises.length * 2;

  const evolutionConsult = [
    ...EVOLUTION_12_MOIS_BASE.map((mois, i) => ({ mois, taux: TAUX_HISTORIQUES[i]! })),
    { mois: 'Fév.', taux: tauxConsultMoyen },
  ];

  const evolutionBulletins = evolutionConsult.map((m, i) => ({
    mois: m.mois,
    bulletins: Math.max(
      0,
      Math.round(bulletinsMois * (0.85 + i * 0.015 + (i % 3 === 0 ? -0.05 : 0))),
    ),
  }));

  const repartition = entreprises
    .map((e) => ({ nom: e.nom, value: metsParId.get(e.id)?.bulletinsMois ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((d, i) => ({ ...d, couleur: COULEURS_REPARTITION[i]! }));

  const reclamStats = [
    {
      statut: 'Nouvelles',
      count: Math.round(reclamationsOuvertes * 0.35),
      couleur: '#2C6FB3',
    },
    {
      statut: 'En cours',
      count: Math.round(reclamationsOuvertes * 0.5),
      couleur: '#D9A227',
    },
    {
      statut: 'Résolues',
      count: Math.round(reclamationsOuvertes * 0.85),
      couleur: '#2F8F5B',
    },
  ];

  const sorted = [...entreprises].sort(
    (a, b) =>
      (metsParId.get(b.id)?.consultation ?? 0) - (metsParId.get(a.id)?.consultation ?? 0),
  );
  const meilleures = sorted.slice(0, 3);
  const aRelancer = sorted.slice(-3).reverse();

  return (
    <>
      <CabinetPageHeader
        title="Statistiques du portefeuille"
        subtitle={
          cabinet ? `Analyse consolidée des ${entreprises.length} entreprises gérées` : '—'
        }
        actions={
          <Select
            size="md"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            icon="Calendar"
            options={[
              { value: '6m', label: '6 derniers mois' },
              { value: '12m', label: '12 derniers mois' },
              { value: 'ytd', label: 'Année en cours' },
            ]}
          />
        }
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            label="Taux de consultation"
            value={`${tauxConsultMoyen}%`}
            icon="Eye"
            tone="succes"
            trend={{ up: true, label: '+2 pts vs janv.' }}
          />
          <KPICard
            label="Bulletins distribués"
            value={formatNum(bulletinsMois)}
            icon="FileText"
            tone="neutre"
            hint="Sur la période"
          />
          <KPICard
            label="Signatures réalisées"
            value={signatures}
            icon="PenLine"
            tone="info"
          />
          <KPICard
            label="Réclamations ouvertes"
            value={reclamationsOuvertes}
            icon="MessageSquareWarning"
            tone="attente"
          />
        </div>

        {/* Évolution + bulletins par mois (recharts lazy) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[16px] font-semibold text-encre">
                  Évolution du taux de consultation
                </h2>
                <p className="text-[12px] text-texte-secondaire">
                  Moyenne du portefeuille — 12 mois
                </p>
              </div>
              <Icon name="ChartLine" size={14} className="text-texte-secondaire" />
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <Suspense fallback={<div className="h-full bg-surface/30 rounded animate-pulse" />}>
                <ChartEvolutionConsultation data={evolutionConsult} />
              </Suspense>
            </div>
          </Card>

          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[16px] font-semibold text-encre">
                  Bulletins distribués par mois
                </h2>
                <p className="text-[12px] text-texte-secondaire">
                  Volume mensuel — tout le portefeuille
                </p>
              </div>
              <Icon name="ChartBarBig" size={14} className="text-texte-secondaire" />
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <Suspense fallback={<div className="h-full bg-surface/30 rounded animate-pulse" />}>
                <ChartBulletinsMois data={evolutionBulletins} />
              </Suspense>
            </div>
          </Card>
        </div>

        {/* Répartition + réclamations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[16px] font-semibold text-encre">
                  Top 5 entreprises (volume)
                </h2>
                <p className="text-[12px] text-texte-secondaire">
                  Répartition des bulletins du mois
                </p>
              </div>
              <Icon name="ChartPie" size={14} className="text-texte-secondaire" />
            </div>
            <div style={{ width: '100%', height: 220 }}>
              <Suspense fallback={<div className="h-full bg-surface/30 rounded animate-pulse" />}>
                <ChartRepartitionEntreprises data={repartition} />
              </Suspense>
            </div>
            <ul className="mt-3 space-y-1.5">
              {repartition.map((d) => (
                <li
                  key={d.nom}
                  className="flex items-center justify-between text-[12.5px]"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: d.couleur }}
                    />
                    <span className="text-encre">{d.nom}</span>
                  </span>
                  <span className="text-texte-secondaire tabular-nums">{d.value}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[16px] font-semibold text-encre">Réclamations</h2>
                <p className="text-[12px] text-texte-secondaire">
                  Par statut — tout le portefeuille
                </p>
              </div>
              <Icon name="ChartBarBig" size={14} className="text-texte-secondaire" />
            </div>
            <div className="space-y-3">
              {reclamStats.map((r) => {
                const total = reclamStats.reduce((s, x) => s + x.count, 0);
                const pct = total ? Math.round((r.count / total) * 100) : 0;
                return (
                  <div key={r.statut}>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-encre font-medium">{r.statut}</span>
                      <span className="text-texte-secondaire tabular-nums">
                        {r.count} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: r.couleur }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-bordure">
              <div
                className="text-[11px] uppercase tracking-wide text-texte-secondaire mb-2"
                style={{ letterSpacing: '.05em' }}
              >
                Délais
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <div>
                  <div className="text-texte-secondaire">Première réponse</div>
                  <div className="text-encre font-semibold tabular-nums">4 h 12</div>
                </div>
                <div>
                  <div className="text-texte-secondaire">Résolution</div>
                  <div className="text-encre font-semibold tabular-nums">2,3 j</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Classement meilleures / à relancer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card padding="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="TrendingUp" size={16} className="text-succes" />
              <h2 className="text-[16px] font-semibold text-encre">Meilleures consultations</h2>
            </div>
            <div className="divide-y divide-bordure">
              {meilleures.map((e, i) => (
                <Link
                  key={e.id}
                  to={`/cabinet/entreprises/${e.id}`}
                  className="flex items-center gap-3 py-2.5 px-1 hover:bg-surface/50 rounded transition -mx-1"
                >
                  <span className="w-6 text-center text-[12px] font-semibold text-texte-secondaire tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-encre truncate">{e.nom}</div>
                    <div className="text-[11.5px] text-texte-secondaire">
                      {metsParId.get(e.id)?.salaries ?? 0} salariés
                    </div>
                  </div>
                  <span className="text-[14px] font-semibold text-succes tabular-nums">
                    {Math.round((metsParId.get(e.id)?.consultation ?? 0) * 100)}%
                  </span>
                  <Icon name="ArrowRight" size={12} className="text-texte-secondaire" />
                </Link>
              ))}
            </div>
          </Card>

          <Card padding="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="TrendingDown" size={16} className="text-attente" />
              <h2 className="text-[16px] font-semibold text-encre">À relancer</h2>
            </div>
            <div className="divide-y divide-bordure">
              {aRelancer.map((e, i) => (
                <Link
                  key={e.id}
                  to={`/cabinet/entreprises/${e.id}`}
                  className="flex items-center gap-3 py-2.5 px-1 hover:bg-surface/50 rounded transition -mx-1"
                >
                  <span className="w-6 text-center text-[12px] font-semibold text-texte-secondaire tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-encre truncate">{e.nom}</div>
                    <div className="text-[11.5px] text-texte-secondaire">
                      {metsParId.get(e.id)?.salaries ?? 0} salariés
                    </div>
                  </div>
                  <span className="text-[14px] font-semibold text-attente tabular-nums">
                    {Math.round((metsParId.get(e.id)?.consultation ?? 0) * 100)}%
                  </span>
                  <Icon name="ArrowRight" size={12} className="text-texte-secondaire" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
