// CabinetSuivi — vue agrégée consolidée du portefeuille (sub-lot 11c).
//
// Porté de _wireframe/src/cabinet-suivi.jsx (CabinetSuivi).
//
// CLOISONNEMENT (CLAUDE.md invariant 5) : l'AGRÉGAT ne porte QUE sur les
// entreprises du portefeuille du cabinet courant. Le service appelé est
// `obtenirMetriquesPortefeuille(ctx: ContextePortefeuilleCabinet)` qui ne
// renvoie JAMAIS d'entreprise hors portefeuille (vérifié par le test de
// contrat `suiteContratCloisonnementCabinet`). Aucune méthode cross-cabinet
// n'existe dans l'interface — la garde est structurelle.
//
// NET JAMAIS EN LISTE/AGRÉGAT (invariant 1) : les KPIs sont des COMPTEURS
// (non consultés, signatures en attente, entreprises sans dépôt) et un
// pourcentage moyen. Pas de masse salariale agrégée, jamais.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Cabinet, Entreprise, MetriquesPortefeuilleEntreprise } from '@pli/types';
import {
  Button,
  Card,
  EmptyState,
  Icon,
  KPICard,
  Select,
  StatusPill,
  Table,
  useToast,
} from '@pli/ui';
import {
  creerCabinetsServiceMock,
  type ContextePortefeuilleCabinet,
} from '../../services/index.js';
import { CabinetPageHeader } from './_page-header.js';

// TODO(phase-1) — voir _layout.tsx
const CONTEXTE_DEMO: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: 'cab-ebrie',
};

interface LigneSuivi {
  entreprise: Entreprise;
  metriques: MetriquesPortefeuilleEntreprise;
  distribues: number;
  consultes: number;
  nonConsultes: number;
  signaturesEnAttente: number;
  dateRemise: string;
}

function derive(
  entreprise: Entreprise,
  m: MetriquesPortefeuilleEntreprise,
): LigneSuivi {
  const distribues = Math.max(0, m.bulletinsMois - m.bulletinsAUploader - m.bulletinsADistribuer);
  const consultes = Math.round(distribues * m.consultation);
  const nonConsultes = distribues - consultes;
  const signaturesEnAttente = Math.round(consultes * 0.32);
  const dateRemise =
    m.bulletinsAUploader > 0 || m.bulletinsADistribuer > 0 ? '—' : '27/02/2026';
  return {
    entreprise,
    metriques: m,
    distribues,
    consultes,
    nonConsultes,
    signaturesEnAttente,
    dateRemise,
  };
}

type FiltreSuivi = 'tous' | 'a_relancer' | 'bien_consultes';

export function CabinetSuivi() {
  const services = useMemo(() => ({ cabinets: creerCabinetsServiceMock() }), []);
  const pousser = useToast();

  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [lignes, setLignes] = useState<LigneSuivi[]>([]);
  const [periode, setPeriode] = useState('2026-02');
  const [filtre, setFiltre] = useState<FiltreSuivi>('tous');
  const [relanceLoading, setRelanceLoading] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [cab, port, mets] = await Promise.all([
        services.cabinets.obtenirCabinet(CONTEXTE_DEMO),
        services.cabinets.obtenirPortefeuille(CONTEXTE_DEMO),
        services.cabinets.obtenirMetriquesPortefeuille(CONTEXTE_DEMO),
      ]);
      setCabinet(cab);
      const metsParId = new Map(mets.map((m) => [m.entrepriseId, m]));
      setLignes(
        port
          .map((e) => {
            const m = metsParId.get(e.id);
            return m ? derive(e, m) : null;
          })
          .filter((x): x is LigneSuivi => x !== null),
      );
    })();
  }, [services]);

  const lignesFiltrees = useMemo(() => {
    if (filtre === 'a_relancer') return lignes.filter((l) => l.nonConsultes > 0);
    if (filtre === 'bien_consultes')
      return lignes.filter((l) => l.metriques.consultation >= 0.85);
    return lignes;
  }, [lignes, filtre]);

  const totalNonConsultes = lignes.reduce((s, l) => s + l.nonConsultes, 0);
  const totalSignaturesAttente = lignes.reduce((s, l) => s + l.signaturesEnAttente, 0);
  const sansDepot = lignes.filter((l) => l.dateRemise === '—').length;
  const tauxConsultMoyen = lignes.length
    ? Math.round(
        (lignes.reduce((s, l) => s + l.metriques.consultation, 0) / lignes.length) * 100,
      )
    : 0;

  const relancer = (entrepriseId: string) => {
    setRelanceLoading(entrepriseId);
    setTimeout(() => {
      const l = lignes.find((x) => x.entreprise.id === entrepriseId);
      pousser({
        message: l
          ? `${l.nonConsultes} salariés relancés chez ${l.entreprise.nom}`
          : 'Relances envoyées',
        tone: 'succes',
      });
      setRelanceLoading(null);
    }, 600);
  };

  const relancerTout = () => {
    setRelanceLoading('all');
    setTimeout(() => {
      pousser({
        message: `${totalNonConsultes} salariés relancés sur tout le portefeuille`,
        tone: 'succes',
      });
      setRelanceLoading(null);
    }, 800);
  };

  return (
    <>
      <CabinetPageHeader
        title="Suivi du portefeuille"
        subtitle={
          cabinet
            ? `Vue transversale des ${lignes.length} entreprises gérées par ${cabinet.nom}`
            : '—'
        }
        actions={
          <>
            <Select
              size="md"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              icon="Calendar"
              options={[
                { value: '2026-02', label: 'Février 2026' },
                { value: '2026-01', label: 'Janvier 2026' },
                { value: '2025-12', label: 'Décembre 2025' },
                { value: '2025-11', label: 'Novembre 2025' },
                { value: '2025-10', label: 'Octobre 2025' },
              ]}
            />
            <Button
              variant="primary"
              icon="BellRing"
              loading={relanceLoading === 'all'}
              disabled={totalNonConsultes === 0}
              onClick={relancerTout}
            >
              Relancer tout le portefeuille ({totalNonConsultes})
            </Button>
          </>
        }
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <KPICard
            label="Taux de consultation"
            value={`${tauxConsultMoyen}%`}
            icon="Eye"
            tone="succes"
            hint="Moyenne portefeuille"
          />
          <KPICard
            label="Non consultés"
            value={totalNonConsultes}
            icon="TriangleAlert"
            tone="attente"
          />
          <KPICard
            label="Signatures en attente"
            value={totalSignaturesAttente}
            icon="PenLine"
            tone="info"
          />
          <KPICard
            label="Entreprises sans dépôt"
            value={sansDepot}
            icon="Building2"
            tone="neutre"
          />
        </div>

        <Card padding="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[12.5px] text-texte-secondaire mr-2 inline-flex items-center gap-1.5">
              <Icon name="Filter" size={13} />
              Affichage :
            </div>
            {(
              [
                ['tous', 'Toutes les entreprises', lignes.length],
                [
                  'a_relancer',
                  'À relancer',
                  lignes.filter((l) => l.nonConsultes > 0).length,
                ],
                [
                  'bien_consultes',
                  '≥ 85 % consultation',
                  lignes.filter((l) => l.metriques.consultation >= 0.85).length,
                ],
              ] as const
            ).map(([k, label, count]) => (
              <button
                type="button"
                key={k}
                onClick={() => setFiltre(k)}
                className={`h-8 px-3 text-[12.5px] rounded-md font-medium transition ${
                  filtre === k
                    ? 'bg-encre text-white'
                    : 'bg-surface text-encre hover:bg-bordure'
                }`}
              >
                {label}{' '}
                <span className={filtre === k ? 'text-white/70' : 'text-texte-secondaire'}>
                  ({count})
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card padding="p-0">
          {lignesFiltrees.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="CircleCheckBig"
                title="Aucune entreprise dans ce filtre"
              />
            </div>
          ) : (
            <Table
              columns={[
                {
                  label: 'Entreprise',
                  render: (r) => (
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre">
                        <Icon name="Building2" size={14} />
                      </div>
                      <div>
                        <div className="font-medium text-encre">{r.entreprise.nom}</div>
                        <div className="text-[12px] text-texte-secondaire">
                          {r.entreprise.secteur ?? '—'} · {r.metriques.salaries} salariés
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  label: 'Distribués',
                  width: 110,
                  render: (r) => <span className="tabular-nums">{r.distribues}</span>,
                },
                {
                  label: 'Consultation',
                  width: 200,
                  render: (r) => {
                    const pct = Math.round(r.metriques.consultation * 100);
                    const bg =
                      r.metriques.consultation >= 0.85
                        ? '#2F8F5B'
                        : r.metriques.consultation >= 0.7
                          ? '#D9A227'
                          : '#CB3B33';
                    return (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: bg }}
                          />
                        </div>
                        <span className="text-[12.5px] text-encre tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    );
                  },
                },
                {
                  label: 'Non consultés',
                  width: 130,
                  render: (r) =>
                    r.nonConsultes > 0 ? (
                      <StatusPill tone="attente" size="sm">
                        {r.nonConsultes}
                      </StatusPill>
                    ) : (
                      <StatusPill tone="succes" size="sm" icon="Check">
                        Tous consultés
                      </StatusPill>
                    ),
                },
                {
                  label: 'Signatures en attente',
                  width: 170,
                  render: (r) => (
                    <span className="tabular-nums text-texte-secondaire">
                      {r.signaturesEnAttente}
                    </span>
                  ),
                },
                {
                  label: 'Dernière distribution',
                  width: 170,
                  render: (r) => (
                    <span className="text-texte-secondaire tabular-nums">{r.dateRemise}</span>
                  ),
                },
                {
                  label: '',
                  width: 220,
                  render: (r) => (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="BellRing"
                        disabled={r.nonConsultes === 0}
                        loading={relanceLoading === r.entreprise.id}
                        onClick={() => relancer(r.entreprise.id)}
                      >
                        Relancer
                      </Button>
                      <Link
                        to={`/cabinet/entreprises/${r.entreprise.id}`}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white border border-bordure text-encre text-[12.5px] font-medium hover:bg-surface transition"
                      >
                        <Icon name="Eye" size={12} />
                        Voir
                      </Link>
                    </div>
                  ),
                },
              ]}
              data={lignesFiltrees}
            />
          )}
        </Card>

        <Card padding="p-4" bg="bg-papier" className="border-bordure">
          <div className="flex items-start gap-3 text-[12.5px] text-texte-secondaire">
            <Icon name="ShieldCheck" size={14} className="text-succes shrink-0 mt-0.5" />
            <div>
              <strong className="text-encre">Cloisonnement.</strong> Ce suivi n'agrège que
              les entreprises de votre portefeuille. Aucune donnée d'une entreprise hors de
              votre gestion.
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
