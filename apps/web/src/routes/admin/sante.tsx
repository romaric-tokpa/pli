// AdminSante — santé système + coffres dormants + volumétrie + incidents
// (sub-lot 12c). recharts en lazy (volumétrie 30j).

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { CoffresDormants, Incident, PointVolumetrie, ServiceSante } from '@pli/types';
import {
  Card,
  Icon,
  KPICard,
  STATUS_STYLES,
  StatusPill,
  Table,
  type IconName,
  type StatusTone,
} from '@pli/ui';
import { creerAdminServiceMock, type ContexteAdmin } from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';

const ChartVolumetrie = lazy(() => import('./charts/chart-volumetrie.js'));

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

function severitePill(s: Incident['severite']) {
  const tone: StatusTone =
    s === 'critique' ? 'erreur' : s === 'majeur' ? 'attente' : 'info';
  return (
    <StatusPill tone={tone} size="sm">
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </StatusPill>
  );
}

export function AdminSante() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);

  const [servicesSante, setServicesSante] = useState<ServiceSante[]>([]);
  const [volumetrie, setVolumetrie] = useState<PointVolumetrie[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [coffres, setCoffres] = useState<CoffresDormants | null>(null);

  useEffect(() => {
    void (async () => {
      const [s, v, i, c] = await Promise.all([
        services.admin.listerServicesSante(CONTEXTE_DEMO),
        services.admin.obtenirVolumetrie30j(CONTEXTE_DEMO),
        services.admin.listerIncidents(CONTEXTE_DEMO),
        services.admin.obtenirCoffresDormants(CONTEXTE_DEMO),
      ]);
      setServicesSante(s);
      setVolumetrie(v);
      setIncidents(i);
      setCoffres(c);
    })();
  }, [services]);

  const totalBulletins = volumetrie.reduce((s, j) => s + j.bulletins, 0);
  const totalSignatures = volumetrie.reduce((s, j) => s + j.signatures, 0);

  return (
    <>
      <AdminPageHeader
        title="Santé système"
        subtitle="Supervision des services, métriques et historique des incidents"
      />

      <div className="p-8 space-y-6">
        {/* Services */}
        <Card padding="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-encre">État des services</h2>
            <div className="text-[12px] text-texte-secondaire">
              Dernière vérification il y a 28 sec
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {servicesSante.map((s) => {
              const tone: StatusTone =
                s.statut === 'operationnel'
                  ? 'succes'
                  : s.statut === 'degrade'
                    ? 'attente'
                    : 'erreur';
              const stylesM = STATUS_STYLES[tone];
              return (
                <div
                  key={s.id}
                  className="rounded-lg border p-4 flex items-start gap-3"
                  style={{ borderColor: stylesM.border, backgroundColor: `${stylesM.bg}40` }}
                >
                  <div
                    className="h-9 w-9 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: stylesM.bg, color: stylesM.fg }}
                  >
                    <Icon name={s.icon as IconName} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13.5px] font-medium text-encre truncate">
                        {s.nom}
                      </div>
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: stylesM.fg }}
                      />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11.5px] text-texte-secondaire">
                      <span>
                        Uptime{' '}
                        <strong className="text-encre tabular-nums">{s.uptime}%</strong>
                      </span>
                      <span>
                        P95 <strong className="text-encre tabular-nums">{s.p95}</strong>
                      </span>
                    </div>
                    <div className="mt-1 text-[11.5px]" style={{ color: stylesM.fg }}>
                      {s.statut === 'operationnel'
                        ? 'Opérationnel'
                        : s.statut === 'degrade'
                          ? 'Dégradé'
                          : 'Indisponible'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Métriques 30j */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Bulletins / 30 j"
            value={formatNum(totalBulletins)}
            icon="FileText"
            tone="info"
          />
          <KPICard
            label="Signatures / 30 j"
            value={formatNum(totalSignatures)}
            icon="PenLine"
            tone="info"
          />
          <KPICard
            label="Taux d'échec appairage"
            value="0,42 %"
            icon="FileCheck2"
            tone="succes"
            trend={{ up: false, label: '−0,1 pt' }}
          />
          <KPICard
            label="Stockage utilisé"
            value="184 / 500 Go"
            icon="Database"
            tone="neutre"
            hint="36,8 %"
          />
        </div>

        {/* Coffres dormants */}
        {coffres && (
          <Card padding="p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="h-11 w-11 rounded-md bg-attente/15 text-attente flex items-center justify-center shrink-0">
                <Icon name="Archive" size={20} />
              </div>
              <div className="flex-1 min-w-[240px]">
                <h2 className="text-[15px] font-semibold text-encre">Coffres dormants</h2>
                <p className="text-[12.5px] text-texte-secondaire">
                  Comptes d'ex-salariés conservés en lecture seule — stockage sans revenu
                  associé. C'est le coût visible de la conservation «&nbsp;tant que le compte
                  est actif&nbsp;».
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-papier border border-bordure p-3 text-center min-w-[118px]">
                  <div className="text-[11px] text-texte-secondaire">Coffres dormants</div>
                  <div className="text-[22px] font-semibold text-encre tabular-nums">
                    {formatNum(coffres.coffresDormants)}
                  </div>
                </div>
                <div className="rounded-md bg-papier border border-bordure p-3 text-center min-w-[118px]">
                  <div className="text-[11px] text-texte-secondaire">Part du stockage</div>
                  <div className="text-[22px] font-semibold text-encre tabular-nums">
                    {Math.round(coffres.partStockage * 100)} %
                  </div>
                </div>
                <div className="rounded-md bg-papier border border-bordure p-3 text-center min-w-[118px]">
                  <div className="text-[11px] text-texte-secondaire">Revenu associé</div>
                  <div className="text-[22px] font-semibold text-texte-secondaire tabular-nums">
                    {coffres.revenuAssocie} FCFA
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Volumétrie 30j — recharts lazy */}
        <Card padding="p-5">
          <h2 className="text-[16px] font-semibold text-encre">
            Volumétrie — 30 derniers jours
          </h2>
          <div style={{ width: '100%', height: 240 }} className="mt-3">
            <Suspense fallback={<div className="h-full bg-surface/30 rounded animate-pulse" />}>
              <ChartVolumetrie data={volumetrie} />
            </Suspense>
          </div>
        </Card>

        {/* Incidents */}
        <Card padding="p-0">
          <div className="p-5 border-b border-bordure">
            <h2 className="text-[16px] font-semibold text-encre">
              Historique des incidents
            </h2>
            <p className="text-[12.5px] text-texte-secondaire">30 derniers jours</p>
          </div>
          <Table
            dense
            columns={[
              {
                label: 'Date',
                width: 120,
                render: (r) => (
                  <span className="text-texte-secondaire tabular-nums">{r.date}</span>
                ),
              },
              { label: 'Titre', render: (r) => r.titre },
              {
                label: 'Service',
                width: 160,
                render: (r) => (
                  <span className="text-[12px] px-2 py-0.5 rounded bg-surface text-encre">
                    {r.service}
                  </span>
                ),
              },
              { label: 'Sévérité', width: 130, render: (r) => severitePill(r.severite) },
              {
                label: 'Durée',
                width: 110,
                render: (r) => <span className="tabular-nums">{r.duree}</span>,
              },
              {
                label: 'Statut',
                width: 130,
                render: (r) =>
                  r.resolu ? (
                    <StatusPill tone="succes" size="sm">
                      Résolu
                    </StatusPill>
                  ) : (
                    <StatusPill tone="attente" size="sm">
                      En cours
                    </StatusPill>
                  ),
              },
            ]}
            data={incidents}
          />
        </Card>
      </div>
    </>
  );
}
