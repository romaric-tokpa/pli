// Tableau de bord Pli Pro — port verbatim de pro-dashboard.jsx.
// recharts en lazy (chunks chart-consultations + chart-tendance-reclamations).
// Compteurs basés sur BulletinsService.lister() (BulletinResume sans net).

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  Icon,
  IconButton,
  KPICard,
  Select,
  Skeleton,
  StatusPill,
  STATUS_STYLES,
  type IconName,
  type StatusTone,
} from '@pli/ui';
import type { Reclamation, StatutReclamation } from '@pli/types';
import type {
  BulletinResume,
  ContexteEntreprise,
  StatistiquesReclamations,
} from '../../services/index.js';
import {
  creerBulletinsServiceMock,
  creerReclamationsServiceMock,
  creerSalariesServiceMock,
} from '../../services/index.js';
import { ProPageHeader } from './_page-header.js';

// Lazy charts — sortent recharts du chunk dashboard initial
const ChartConsultations = lazy(() => import('./charts/chart-consultations.js'));
const ChartTendanceReclamations = lazy(
  () => import('./charts/chart-tendance-reclamations.js'),
);

// ─── Contexte tenant — TODO(phase-1) wirer à AuthService.contexteCourant() ──
const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

// ─── Données dashboard — TODO(phase-1) wirer à TableauDeBordService ────────
const MOIS_DISPONIBLES = [
  { id: '2026-02', libelle: 'Février 2026' },
  { id: '2026-01', libelle: 'Janvier 2026' },
  { id: '2025-12', libelle: 'Décembre 2025' },
  { id: '2025-11', libelle: 'Novembre 2025' },
];

const CHART_CONSULTATIONS = [
  { mois: 'Sep.', consultes: 17, distribues: 22 },
  { mois: 'Oct.', consultes: 19, distribues: 22 },
  { mois: 'Nov.', consultes: 20, distribues: 23 },
  { mois: 'Déc.', consultes: 21, distribues: 23 },
  { mois: 'Jan.', consultes: 22, distribues: 23 },
  { mois: 'Fév.', consultes: 16, distribues: 22 },
];

interface ItemActivite {
  id: string;
  type: 'depot' | 'signature' | 'reclamation' | 'consultation' | 'import';
  texte: string;
  horodatage: string;
  icon: IconName;
}

const ACTIVITE_RECENTE: ItemActivite[] = [
  {
    id: 'a1',
    type: 'depot',
    texte: '18 bulletins de février 2026 ont été distribués',
    horodatage: 'il y a 12 min',
    icon: 'FileText',
  },
  {
    id: 'a2',
    type: 'signature',
    texte: 'Aya Koffi a signé son bulletin de février 2026',
    horodatage: 'il y a 1 h',
    icon: 'PenLine',
  },
  {
    id: 'a3',
    type: 'reclamation',
    texte: "Nouvelle réclamation d'Awa Bamba — prime non versée",
    horodatage: 'il y a 2 h',
    icon: 'MessageSquareWarning',
  },
  {
    id: 'a4',
    type: 'consultation',
    texte: 'Fatou Diallo a consulté son bulletin',
    horodatage: 'il y a 4 h',
    icon: 'Eye',
  },
  {
    id: 'a5',
    type: 'signature',
    texte: 'Konan Bertin a signé son bulletin',
    horodatage: 'il y a 5 h',
    icon: 'PenLine',
  },
  {
    id: 'a6',
    type: 'import',
    texte: '2 nouveaux salariés importés par Sylvie Aké',
    horodatage: 'hier à 16:48',
    icon: 'UserPlus',
  },
];

const TONE_PAR_STATUT_RECLAM: Record<StatutReclamation, StatusTone> = {
  nouvelle: 'info',
  en_cours: 'attente',
  resolue: 'succes',
};

const LIBELLE_PAR_STATUT_RECLAM: Record<StatutReclamation, string> = {
  nouvelle: 'Nouvelles',
  en_cours: 'En cours',
  resolue: 'Résolues',
};

const PALETTE_ACTIVITE: Record<ItemActivite['type'], { bg: string; fg: string }> = {
  depot: { bg: '#DEEBF7', fg: '#2C6FB3' },
  signature: { bg: '#E6F2EC', fg: '#2F8F5B' },
  reclamation: { bg: '#FBE3E1', fg: '#CB3B33' },
  consultation: { bg: '#EFF2F7', fg: '#5B6577' },
  import: { bg: '#FBF1D8', fg: '#8C6A12' },
};

interface SalarieARelancer {
  id: string;
  nom: string;
  matricule: string;
  service: string;
}

interface ReclamationOuverte {
  id: string;
  salarieNom: string;
  sujet: string;
  type: string;
  derniereActivite: string;
  statut: StatutReclamation;
}

export function ProDashboard() {
  const [loading, setLoading] = useState(true);
  const [filtreMois, setFiltreMois] = useState('2026-02');
  const [bulletinsPeriode, setBulletinsPeriode] = useState<BulletinResume[]>([]);
  const [salariesARelancer, setSalariesARelancer] = useState<SalarieARelancer[]>([]);
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [statsReclam, setStatsReclam] = useState<StatistiquesReclamations | null>(null);
  const [salariesParId, setSalariesParId] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Charge réclamations + stats UNE seule fois (indépendant de la période bulletins)
  useEffect(() => {
    const reclamationsService = creerReclamationsServiceMock();
    const salariesService = creerSalariesServiceMock();
    void (async () => {
      const [liste, stats] = await Promise.all([
        reclamationsService.lister(CONTEXTE_PRO),
        reclamationsService.statistiques(CONTEXTE_PRO),
      ]);
      setReclamations(liste);
      setStatsReclam(stats);
      const ids = Array.from(new Set(liste.map((r) => r.salarieId)));
      const fetched = await Promise.all(
        ids.map(async (id) => {
          const s = await salariesService.obtenir(CONTEXTE_PRO, id);
          return [id, s?.nom ?? '—'] as const;
        }),
      );
      setSalariesParId(Object.fromEntries(fetched));
    })();
  }, []);

  useEffect(() => {
    const services = {
      bulletins: creerBulletinsServiceMock(),
      salaries: creerSalariesServiceMock(),
    };

    void (async () => {
      const liste = await services.bulletins.lister(CONTEXTE_PRO, { periode: filtreMois });
      setBulletinsPeriode(liste);

      const nonConsultes = liste.filter(
        (b) => b.statutConsultation === 'non_consulte' && b.statutRemise === 'distribue',
      );
      const enrichis = await Promise.all(
        nonConsultes.slice(0, 5).map(async (b) => {
          const sal = await services.salaries.obtenir(CONTEXTE_PRO, b.salarieId);
          if (!sal) return null;
          return {
            id: b.id,
            nom: sal.nom,
            matricule: sal.matricule,
            service: sal.service,
          } satisfies SalarieARelancer;
        }),
      );
      setSalariesARelancer(enrichis.filter((s): s is SalarieARelancer => s !== null));
    })();
  }, [filtreMois]);

  const periodeLib =
    MOIS_DISPONIBLES.find((m) => m.id === filtreMois)?.libelle ?? 'Février 2026';
  const periodeCourante = filtreMois === '2026-02';

  const distribues = useMemo(
    () => bulletinsPeriode.filter((b) => b.statutRemise === 'distribue').length || 22,
    [bulletinsPeriode],
  );
  const consultes = useMemo(
    () => bulletinsPeriode.filter((b) => b.statutConsultation === 'consulte').length || 19,
    [bulletinsPeriode],
  );
  const tauxConsult = Math.round((consultes / Math.max(1, distribues)) * 100);
  const nonConsultes = distribues - consultes;
  const actifs = 20; // TODO(phase-1) — wirer à SalariesService.lister({ statut: 'actif' })

  const reclamOuvertes: ReclamationOuverte[] = useMemo(
    () =>
      reclamations
        .filter((r) => r.statut !== 'resolue')
        .map((r) => ({
          id: r.id,
          salarieNom: salariesParId[r.salarieId] ?? '—',
          sujet: r.sujet,
          type: r.type,
          derniereActivite: r.derniereActivite,
          statut: r.statut,
        })),
    [reclamations, salariesParId],
  );
  const totalParType = useMemo(
    () => (statsReclam ? statsReclam.parType.reduce((s, r) => s + r.count, 0) : 0),
    [statsReclam],
  );

  return (
    <>
      <ProPageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de votre distribution de bulletins."
        actions={
          <>
            <Select
              size="md"
              value={filtreMois}
              onChange={(e) => setFiltreMois(e.target.value)}
              icon="CalendarRange"
              options={MOIS_DISPONIBLES.map((m) => ({ value: m.id, label: m.libelle }))}
            />
            <Link to="/pro/bulletins/upload">
              <Button variant="primary" icon="CloudUpload">
                Déposer les bulletins
              </Button>
            </Link>
          </>
        }
      />

      <div className="p-8 space-y-6">
        {/* Bandeau période en encre */}
        <Card padding="p-5" bg="bg-encre" className="text-white border-encre">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="h-12 w-12 rounded-md bg-white/10 flex items-center justify-center">
              <Icon name="CalendarClock" size={22} className="text-cachet" />
            </div>
            <div className="flex-1 min-w-[260px]">
              <div
                className="text-[12px] uppercase tracking-wide text-white/60"
                style={{ letterSpacing: '.06em' }}
              >
                {periodeCourante ? 'Période en cours' : 'Période archivée'}
              </div>
              <div className="text-[20px] font-semibold">{periodeLib}</div>
              <div className="text-[13px] text-white/70 mt-0.5">
                {distribues} bulletins distribués · {nonConsultes} non consultés
                {periodeCourante ? ' · clôture le 28/02' : ''}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/pro/suivi">
                <Button variant="secondary" icon="Eye">
                  Voir le suivi
                </Button>
              </Link>
              {periodeCourante && (
                <Link to="/pro/bulletins/upload">
                  <Button variant="cachet" icon="CloudUpload">
                    Déposer les bulletins
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading ? (
            <>
              <Card>
                <Skeleton height={80} />
              </Card>
              <Card>
                <Skeleton height={80} />
              </Card>
              <Card>
                <Skeleton height={80} />
              </Card>
              <Card>
                <Skeleton height={80} />
              </Card>
            </>
          ) : (
            <>
              <KPICard
                label="Salariés actifs"
                value={actifs}
                icon="Users"
                tone="info"
                hint="2 invités en attente"
              />
              <KPICard
                label="Bulletins distribués"
                value={distribues}
                icon="FileText"
                tone="neutre"
                hint={periodeLib}
              />
              <KPICard
                label="Taux de consultation"
                value={`${tauxConsult}%`}
                icon="Eye"
                tone="succes"
                hint={`${consultes}/${distribues} bulletins consultés`}
              />
              <KPICard
                label="Bulletins non-consultés"
                value={nonConsultes}
                icon="TriangleAlert"
                tone="attente"
                hint="Penser à relancer"
              />
            </>
          )}
        </div>

        {/* Grille : Graphique + Activité */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card padding="p-5" className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-semibold text-encre">
                  Consultations — 6 derniers mois
                </h2>
                <p className="text-[12px] text-texte-secondaire">
                  Comparaison bulletins distribués vs consultés
                </p>
              </div>
              <Select
                value="6m"
                onChange={() => {}}
                size="sm"
                options={[
                  { value: '3m', label: '3 mois' },
                  { value: '6m', label: '6 mois' },
                  { value: '12m', label: '12 mois' },
                ]}
              />
            </div>
            <div style={{ width: '100%', height: 280 }}>
              {loading ? (
                <Skeleton height={280} />
              ) : (
                <Suspense fallback={<Skeleton height={280} />}>
                  <ChartConsultations data={CHART_CONSULTATIONS} />
                </Suspense>
              )}
            </div>
          </Card>

          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-semibold text-encre">Activité récente</h2>
              <Link to="/pro/securite" className="text-[12px] text-encre hover:underline">
                Journal complet
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} height={40} />
                ))}
              </div>
            ) : (
              <ul className="space-y-0.5 -mx-2">
                {ACTIVITE_RECENTE.map((a) => {
                  const palette = PALETTE_ACTIVITE[a.type];
                  return (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 px-2 py-2.5 rounded-md hover:bg-surface/60 transition"
                    >
                      <div
                        className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: palette.bg, color: palette.fg }}
                      >
                        <Icon name={a.icon} size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-encre leading-snug">{a.texte}</div>
                        <div className="text-[11px] text-texte-secondaire mt-0.5">
                          {a.horodatage}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* Statistiques des réclamations */}
        <Card padding="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-encre">
                Statistiques des réclamations
              </h2>
              <p className="text-[12px] text-texte-secondaire">
                {statsReclam?.total ?? 0} réclamations au total · {reclamOuvertes.length} ouvertes
              </p>
            </div>
            <Link
              to="/pro/reclamations"
              className="text-[12px] text-encre hover:underline inline-flex items-center gap-1"
            >
              Tout voir <Icon name="ChevronRight" size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div
                className="text-[11px] uppercase tracking-wide text-texte-secondaire mb-2"
                style={{ letterSpacing: '.05em' }}
              >
                Par statut
              </div>
              <div className="space-y-2">
                {(statsReclam?.parStatut ?? []).map((s) => {
                  const tone = TONE_PAR_STATUT_RECLAM[s.statut];
                  const sty = STATUS_STYLES[tone];
                  return (
                    <div key={s.statut} className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: sty.fg }}
                      />
                      <span className="text-[13px] text-encre flex-1">
                        {LIBELLE_PAR_STATUT_RECLAM[s.statut]}
                      </span>
                      <span className="text-[14px] font-semibold text-encre tabular-nums">
                        {s.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div
                className="text-[11px] uppercase tracking-wide text-texte-secondaire mb-2"
                style={{ letterSpacing: '.05em' }}
              >
                Par type d'anomalie
              </div>
              <div className="space-y-2">
                {(statsReclam?.parType ?? []).map((t) => {
                  const pct = totalParType > 0 ? Math.round((t.count / totalParType) * 100) : 0;
                  return (
                    <div key={t.type}>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-encre">{t.type}</span>
                        <span className="text-texte-secondaire tabular-nums">{t.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: t.couleur }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div
                className="text-[11px] uppercase tracking-wide text-texte-secondaire mb-2"
                style={{ letterSpacing: '.05em' }}
              >
                Tendance — 6 mois
              </div>
              <div style={{ width: '100%', height: 130 }}>
                <Suspense fallback={<Skeleton height={130} />}>
                  <ChartTendanceReclamations data={statsReclam?.tendance6Mois ?? []} />
                </Suspense>
              </div>
            </div>
          </div>
        </Card>

        {/* Réclamations ouvertes + Salariés à relancer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[16px] font-semibold text-encre">Réclamations ouvertes</h2>
                <p className="text-[12px] text-texte-secondaire">
                  {reclamOuvertes.length} demandes en attente de réponse
                </p>
              </div>
              <Link
                to="/pro/reclamations"
                className="text-[12px] text-encre hover:underline inline-flex items-center gap-1"
              >
                Tout voir <Icon name="ChevronRight" size={12} />
              </Link>
            </div>
            <div className="divide-y divide-bordure">
              {reclamOuvertes.map((r) => (
                <Link
                  key={r.id}
                  to={`/pro/reclamations?id=${r.id}`}
                  className="flex items-start gap-3 py-3 hover:bg-surface/40 -mx-2 px-2 rounded transition"
                >
                  <Avatar name={r.salarieNom} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[13.5px] font-medium text-encre truncate">
                        {r.salarieNom}
                      </div>
                      <StatusPill tone={r.statut === 'nouvelle' ? 'info' : 'attente'} size="sm">
                        {r.statut === 'nouvelle' ? 'Nouvelle' : 'En cours'}
                      </StatusPill>
                    </div>
                    <div className="text-[12.5px] text-texte-secondaire truncate">{r.sujet}</div>
                    <div className="text-[11px] text-texte-secondaire mt-0.5">
                      {r.type} · {r.derniereActivite}
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-texte-secondaire mt-2" />
                </Link>
              ))}
            </div>
          </Card>

          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[16px] font-semibold text-encre">Salariés à relancer</h2>
                <p className="text-[12px] text-texte-secondaire">
                  Bulletins de {periodeLib} non encore consultés
                </p>
              </div>
              <Button variant="secondary" size="sm" icon="BellRing">
                Relancer tous
              </Button>
            </div>
            <div className="divide-y divide-bordure">
              {salariesARelancer.length === 0 && !loading && (
                <div className="py-6 text-center text-[12.5px] text-texte-secondaire">
                  Aucun salarié à relancer sur cette période.
                </div>
              )}
              {salariesARelancer.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-3">
                  <Avatar name={s.nom} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium text-encre">{s.nom}</div>
                    <div className="text-[12px] text-texte-secondaire">
                      {s.matricule} · {s.service}
                    </div>
                  </div>
                  <StatusPill tone="attente" size="sm">
                    Non consulté
                  </StatusPill>
                  <IconButton
                    icon="BellRing"
                    ariaLabel="Relancer"
                    size="sm"
                    variant="secondary"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
