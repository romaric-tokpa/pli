// AdminVueEnsemble — page d'arrivée de la console opérateur (sub-lot 12b).
//
// Porté de _wireframe/src/admin-overview.jsx.
//
// AGRÉGAT CROSS-TENANT LÉGITIME : c'est la seule surface qui voit la
// plateforme dans son ensemble. Tout passe par `AdminService` qui n'accepte
// QUE `ContexteAdmin` — un appel depuis un contexte tenant est impossible
// par construction (test d'isolation source `admin-isole-du-public.test.ts`
// + check noindex `admin-noindex.test.tsx`).
//
// MONTANTS LÉGITIMES (exception documentée à l'invariant 1) : MRR, ARR,
// impayés. Ce ne sont PAS des salaires nets ; ce sont les REVENUS Pli.
// L'agrégat plateforme ne peut JAMAIS exposer le net d'un employé — vérifié
// au TYPE (`MetriquesPlateforme` / `MetriquesEntreprisePlateforme` n'ont
// aucun champ net) ET au rendu (test `admin-net-jamais-affiche`).

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  Cabinet,
  Entreprise,
  EvenementActivite,
  Impaye,
  MetriquesEntreprisePlateforme,
  MetriquesPlateforme,
  PointMrrMensuel,
  SourceRevenu,
} from '@pli/types';
import {
  Button,
  Card,
  EmptyState,
  Icon,
  KPICard,
  Select,
  StatusPill,
  Table,
  type IconName,
  type StatusTone,
} from '@pli/ui';
import { creerAdminServiceMock, type ContexteAdmin } from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';

// recharts en LAZY — chunks séparés du bundle admin initial
const ChartMrr12m = lazy(() => import('./charts/chart-mrr-12m.js'));
const ChartRevenuSource = lazy(() => import('./charts/chart-revenu-source.js'));

// TODO(phase-1) — wirer à AuthService.contexteCourant() ; en démo Phase 0,
// l'opérateur connecté est figé.
const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

function formatFCFA(n: number): string {
  return `${formatNum(n)} FCFA`;
}

const PALETTE_TIMELINE: Record<EvenementActivite['type'], { bg: string; fg: string }> = {
  inscription: { bg: '#DEEBF7', fg: '#2C6FB3' },
  plan: { bg: '#E6F2EC', fg: '#2F8F5B' },
  paiement: { bg: '#E6F2EC', fg: '#2F8F5B' },
  ticket: { bg: '#FBE3E1', fg: '#CB3B33' },
  module: { bg: '#FBF1D8', fg: '#8C6A12' },
  suspension: { bg: '#FBE3E1', fg: '#CB3B33' },
};

function statutEntreprisePill(s: Entreprise['statut']) {
  const map: Record<Entreprise['statut'], { tone: StatusTone; libelle: string }> = {
    active: { tone: 'succes', libelle: 'Active' },
    essai: { tone: 'info', libelle: 'Essai' },
    impaye: { tone: 'erreur', libelle: 'Impayé' },
    suspendue: { tone: 'neutre', libelle: 'Suspendue' },
  };
  const { tone, libelle } = map[s];
  return (
    <StatusPill tone={tone} size="sm">
      {libelle}
    </StatusPill>
  );
}

export function AdminVueEnsemble() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);

  const [metriques, setMetriques] = useState<MetriquesPlateforme | null>(null);
  const [evolutionMrr, setEvolutionMrr] = useState<PointMrrMensuel[]>([]);
  const [revenuSource, setRevenuSource] = useState<SourceRevenu[]>([]);
  const [activite, setActivite] = useState<EvenementActivite[]>([]);
  const [impayes, setImpayes] = useState<Impaye[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [metsEntreprises, setMetsEntreprises] = useState<
    MetriquesEntreprisePlateforme[]
  >([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);

  useEffect(() => {
    void (async () => {
      const [m, mrr, src, act, imp, ents, metsE, cabs] = await Promise.all([
        services.admin.obtenirMetriquesPlateforme(CONTEXTE_DEMO),
        services.admin.obtenirEvolutionMrr(CONTEXTE_DEMO),
        services.admin.obtenirRevenuParSource(CONTEXTE_DEMO),
        services.admin.listerActivitePlateforme(CONTEXTE_DEMO),
        services.admin.listerImpayes(CONTEXTE_DEMO),
        services.admin.listerEntreprises(CONTEXTE_DEMO),
        services.admin.listerMetriquesEntreprises(CONTEXTE_DEMO),
        services.admin.listerCabinets(CONTEXTE_DEMO),
      ]);
      setMetriques(m);
      setEvolutionMrr(mrr);
      setRevenuSource(src);
      setActivite(act);
      setImpayes(imp);
      setEntreprises(ents);
      setMetsEntreprises(metsE);
      setCabinets(cabs);
    })();
  }, [services]);

  const totalRevenu = revenuSource.reduce((s, r) => s + r.montant, 0);
  const essaisFin = entreprises.filter((e) => e.statut === 'essai');
  const cabinetsParId = new Map(cabinets.map((c) => [c.id, c]));
  const metsParId = new Map(metsEntreprises.map((m) => [m.entrepriseId, m]));
  const entreprisesParId = new Map(entreprises.map((e) => [e.id, e]));

  return (
    <>
      <AdminPageHeader
        title="Vue d'ensemble"
        subtitle="Pilotage commercial, opérationnel et technique de la plateforme."
        actions={
          <>
            <Button variant="secondary" icon="Download">
              Exporter
            </Button>
            <Select
              size="md"
              value="2026-02"
              onChange={() => {}}
              icon="Calendar"
              options={[
                { value: '2026-02', label: 'Février 2026' },
                { value: '2026-01', label: 'Janvier 2026' },
                { value: '2025-12', label: 'Décembre 2025' },
              ]}
            />
          </>
        }
      />

      <div className="p-8 space-y-6">
        {/* 6 KPIs plateforme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <KPICard
            label="MRR total"
            value={metriques ? formatFCFA(metriques.mrrTotal) : '—'}
            icon="TrendingUp"
            tone="succes"
            trend={{ up: true, label: '+0,8 % vs janv.' }}
          />
          <KPICard
            label="ARR projeté"
            value={metriques ? formatFCFA(metriques.arrProjete) : '—'}
            icon="Receipt"
            tone="info"
          />
          <KPICard
            label="Entreprises actives"
            value={metriques?.entreprisesActives ?? 0}
            icon="Building2"
            tone="neutre"
            trend={{ up: true, label: '+1 ce mois' }}
          />
          <KPICard
            label="Salariés cumulés"
            value={metriques ? formatNum(metriques.salariesCumules) : '—'}
            icon="Users"
            tone="neutre"
          />
          <KPICard
            label="Bulletins distribués (fév.)"
            value={metriques ? formatNum(metriques.bulletinsMois) : '—'}
            icon="FileText"
            tone="neutre"
            trend={{ up: true, label: '+62 vs janv.' }}
          />
          <KPICard
            label="Taux de consultation moyen"
            value={metriques ? `${Math.round(metriques.tauxConsultationMoyen * 100)}%` : '—'}
            icon="Eye"
            tone="succes"
            trend={{ up: true, label: '+2 pts' }}
          />
        </div>

        {/* Graphique MRR + Revenu par source (recharts lazy) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card padding="p-5" className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-semibold text-encre">
                  MRR — 12 derniers mois
                </h2>
                <p className="text-[12px] text-texte-secondaire">
                  Évolution du revenu mensuel récurrent (FCFA)
                </p>
              </div>
              <Select
                size="sm"
                value="12m"
                onChange={() => {}}
                options={[
                  { value: '6m', label: '6 mois' },
                  { value: '12m', label: '12 mois' },
                ]}
              />
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <Suspense fallback={<div className="h-full bg-surface/30 rounded animate-pulse" />}>
                <ChartMrr12m data={evolutionMrr} />
              </Suspense>
            </div>
          </Card>

          <Card padding="p-5">
            <h2 className="text-[16px] font-semibold text-encre">Revenu par source</h2>
            <p className="text-[12px] text-texte-secondaire">Février 2026</p>
            <div style={{ width: '100%', height: 180 }} className="mt-2">
              <Suspense fallback={<div className="h-full bg-surface/30 rounded animate-pulse" />}>
                <ChartRevenuSource data={revenuSource} />
              </Suspense>
            </div>
            <ul className="mt-3 space-y-1.5">
              {revenuSource.map((s) => (
                <li key={s.source} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: s.couleur }}
                    />
                    <span className="text-encre">{s.source}</span>
                  </span>
                  <span className="text-texte-secondaire tabular-nums">
                    {totalRevenu ? Math.round((s.montant / totalRevenu) * 100) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Activité plateforme + essais arrivant à échéance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card padding="p-5" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-semibold text-encre">Activité plateforme</h2>
              <Link
                to="/admin/audit"
                className="text-[12px] text-encre hover:underline"
              >
                Journal complet
              </Link>
            </div>
            <ul className="space-y-0.5 -mx-2">
              {activite.map((a) => {
                const palette = PALETTE_TIMELINE[a.type];
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 px-2 py-2.5 rounded-md hover:bg-surface/60 transition"
                  >
                    <div
                      className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: palette.bg, color: palette.fg }}
                    >
                      <Icon name={a.icon as IconName} size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] text-encre leading-snug">{a.texte}</div>
                      <div className="text-[11px] text-texte-secondaire mt-0.5 tabular-nums">
                        {a.date}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-semibold text-encre">
                Essais arrivant à échéance
              </h2>
            </div>
            {essaisFin.length === 0 ? (
              <EmptyState icon="Clock" title="Aucun essai en cours" />
            ) : (
              <div className="space-y-3">
                {essaisFin.map((e) => {
                  const cabinet = e.cabinetId ? cabinetsParId.get(e.cabinetId) : null;
                  const mE = metsParId.get(e.id);
                  return (
                    <Link
                      key={e.id}
                      to={`/admin/entreprises/${e.id}`}
                      className="block rounded-md border border-bordure p-3 hover:border-encre transition"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-[13.5px] font-medium text-encre">{e.nom}</div>
                        {statutEntreprisePill(e.statut)}
                      </div>
                      <div className="text-[11.5px] text-texte-secondaire mt-1">
                        {mE?.salaries ?? e.effectif ?? 0} salariés · {e.secteur ?? '—'}
                      </div>
                      {cabinet && (
                        <div className="text-[11px] text-texte-secondaire mt-0.5">
                          via {cabinet.nom}
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-bordure flex items-center justify-between">
                        <span className="text-[11.5px] text-texte-secondaire">Fin d'essai</span>
                        <span className="text-[12px] font-medium text-attente">
                          12/03/2026
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Impayés à traiter */}
        {impayes.length > 0 && (
          <Card padding="p-0" className="border-erreur/30">
            <div className="p-5 border-b border-bordure flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-[16px] font-semibold text-encre flex items-center gap-2">
                  <Icon name="TriangleAlert" size={16} className="text-erreur" />
                  Impayés à traiter
                </h2>
                <p className="text-[13px] text-texte-secondaire">
                  {impayes.length} factures en attente de règlement
                </p>
              </div>
              <Button variant="secondary" icon="Download">
                Exporter
              </Button>
            </div>
            <Table
              dense
              columns={[
                {
                  label: 'Facture',
                  width: 180,
                  render: (r) => (
                    <span className="font-mono text-[12.5px]">{r.numeroFacture}</span>
                  ),
                },
                {
                  label: 'Entreprise',
                  render: (r) => {
                    const e = entreprisesParId.get(r.entrepriseId);
                    return (
                      <Link
                        to={`/admin/entreprises/${e?.id ?? ''}`}
                        className="font-medium text-encre hover:underline"
                      >
                        {e?.nom ?? r.entrepriseId}
                      </Link>
                    );
                  },
                },
                { label: 'Période', width: 160, render: (r) => r.periode },
                {
                  label: 'Retard',
                  width: 130,
                  render: (r) => (
                    <StatusPill tone="erreur" size="sm">
                      {r.jourRetard} jours
                    </StatusPill>
                  ),
                },
                {
                  label: 'Raison',
                  render: (r) => <span className="text-texte-secondaire">{r.raison}</span>,
                },
                {
                  label: 'Montant',
                  width: 160,
                  render: (r) => (
                    <span className="tabular-nums font-medium">{formatFCFA(r.montant)}</span>
                  ),
                },
                {
                  label: '',
                  width: 140,
                  render: () => (
                    <Button variant="secondary" size="sm" icon="BellRing">
                      Relancer
                    </Button>
                  ),
                },
              ]}
              data={impayes}
            />
          </Card>
        )}

        {/* Footer note */}
        <div className="text-[11px] text-texte-secondaire flex items-center gap-1.5">
          <Icon name="ShieldCheck" size={11} className="text-succes" />
          Vue plateforme — seul contexte où l'agrégation cross-tenant est légitime.
          Toute action sensible (impersonation, suspension) est journalisée.
        </div>
      </div>
    </>
  );
}

