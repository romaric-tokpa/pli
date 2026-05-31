// AdminRevenus — vue revenus & facturation plateforme (sub-lot 12c).
//
// MONTANTS LÉGITIMES (revenu Pli, pas net salarial). Le forfait 275 reste la
// source unique via `FacturationService.obtenirTarifs()` — couvert par le
// contrat `suiteContratFacturation` (composition 150 + 75 + 50). Le canal
// cabinet applique une remise partenaire, ce qui donne un ARPU NET < 275.
//
// CASCADE rendue : Revenu brut → -Remise annuelle → -Remise partenaire = MRR net.
// ARPU brut 275 / ARPU net ≈ 231 (selon pondération canal).

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type {
  MetriquesCabinetPlateforme,
  MetriquesEntreprisePlateforme,
  PointMrrMensuel,
} from '@pli/types';
import { Card, Icon, KPICard, Select, StatusPill } from '@pli/ui';
import {
  creerAdminServiceMock,
  creerFacturationServiceMock,
  type ContexteAdmin,
} from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';
import type { BarreCascade } from './charts/chart-cascade-revenus.js';

const ChartMrr12m = lazy(() => import('./charts/chart-mrr-12m.js'));
const ChartCascadeRevenus = lazy(() => import('./charts/chart-cascade-revenus.js'));

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

// TODO(phase-1) — la remise canal cabinet sera lue par tenant depuis le
// référentiel de cabinet (CabinetsService.obtenirCabinet().remisePartenaire).
// Pour la moyenne pondérée plateforme on l'expose ici en constante.
const REMISE_ANNUELLE_PCT = 15;
const REMISE_PARTENAIRE_MOYENNE_PCT = 12; // ≈ moyenne pondérée des deux cabinets

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

function formatFCFA(n: number): string {
  return `${formatNum(n)} FCFA`;
}

export function AdminRevenus() {
  const services = useMemo(
    () => ({
      admin: creerAdminServiceMock(),
      facturation: creerFacturationServiceMock(),
    }),
    [],
  );

  const [forfait, setForfait] = useState(275);
  const [mets, setMets] = useState<MetriquesEntreprisePlateforme[]>([]);
  const [metsCabinets, setMetsCabinets] = useState<MetriquesCabinetPlateforme[]>([]);
  const [evolutionMrr, setEvolutionMrr] = useState<PointMrrMensuel[]>([]);

  useEffect(() => {
    void (async () => {
      const [tarifs, mE, mC, mrr] = await Promise.all([
        services.facturation.obtenirTarifs(),
        services.admin.listerMetriquesEntreprises(CONTEXTE_DEMO),
        services.admin.listerMetriquesCabinets(CONTEXTE_DEMO),
        services.admin.obtenirEvolutionMrr(CONTEXTE_DEMO),
      ]);
      setForfait(tarifs.forfaitMois);
      setMets(mE);
      setMetsCabinets(mC);
      setEvolutionMrr(mrr);
    })();
  }, [services]);

  // ─── Dérivations (modèle économique) ─────────────────────────────────────
  const salariesPayants = mets.reduce(
    (s, m) => (m.mrr > 0 ? s + m.salaries : s),
    0,
  );
  const salariesEssai = mets.reduce((s, m) => (m.mrr === 0 ? s + m.salaries : s), 0);
  const salariesAnnuel = mets
    .filter((m) => m.planId === 'annuel')
    .reduce((s, m) => s + m.salaries, 0);
  const salariesCabinet = metsCabinets.reduce((s, c) => s + c.salariesCumules, 0);
  const partCabinet = salariesPayants
    ? Math.round((salariesCabinet / salariesPayants) * 100)
    : 0;

  const revenuBrut = salariesPayants * forfait;
  const remiseAnnuelle = Math.round((salariesAnnuel * forfait * REMISE_ANNUELLE_PCT) / 100);
  const remisePartenaire = Math.round(
    (salariesCabinet * forfait * REMISE_PARTENAIRE_MOYENNE_PCT) / 100,
  );
  const mrrNet = revenuBrut - remiseAnnuelle - remisePartenaire;
  const arpuBrut = forfait;
  const arpuNet = salariesPayants ? Math.round(mrrNet / salariesPayants) : 0;
  const arrNet = mrrNet * 12;
  const tarifPartenaireMoyen = Math.round(
    forfait * (1 - REMISE_PARTENAIRE_MOYENNE_PCT / 100),
  );

  // Cascade — visualisation du brut → net
  const cascade: BarreCascade[] = [
    { etape: 'Brut (×275)', valeur: revenuBrut, couleur: '#15294E' },
    { etape: `−Remise annuelle (${REMISE_ANNUELLE_PCT}%)`, valeur: remiseAnnuelle, couleur: '#B85737' },
    { etape: `−Remise partenaire (${REMISE_PARTENAIRE_MOYENNE_PCT}%)`, valeur: remisePartenaire, couleur: '#B85737' },
    { etape: 'MRR net', valeur: mrrNet, couleur: '#2F8F5B' },
  ];

  return (
    <>
      <AdminPageHeader
        title="Revenus & facturation"
        subtitle="Vue consolidée du chiffre d'affaires de la plateforme"
        actions={
          <Select
            value="2026-02"
            onChange={() => {}}
            icon="Calendar"
            options={[
              { value: '2026-02', label: 'Février 2026' },
              { value: '2026-01', label: 'Janvier 2026' },
              { value: '2025-12', label: 'Décembre 2025' },
            ]}
          />
        }
      />

      <div className="p-8 space-y-6">
        {/* KPIs économiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <KPICard
            label="MRR net"
            value={formatFCFA(mrrNet)}
            icon="TrendingUp"
            tone="succes"
            hint="Récurrent"
          />
          <KPICard
            label="ARR projeté"
            value={formatFCFA(arrNet)}
            icon="Receipt"
            tone="info"
            hint="MRR net × 12"
          />
          <KPICard
            label="ARPU brut"
            value={`${arpuBrut} FCFA`}
            icon="Wallet"
            tone="neutre"
            hint="Forfait 275 FCFA"
          />
          <KPICard
            label="ARPU net"
            value={`${arpuNet} FCFA`}
            icon="Wallet"
            tone="succes"
            hint="Après remises"
          />
          <KPICard
            label="Salariés payants"
            value={formatNum(salariesPayants)}
            icon="Users"
            tone="neutre"
            hint={`${formatNum(salariesEssai)} en essai`}
          />
        </div>

        {/* Bandeau modèle économique */}
        <Card padding="p-4" bg="bg-papier" className="border-bordure">
          <div className="flex items-start gap-3 text-[12.5px] text-texte-secondaire">
            <Icon name="ShieldCheck" size={14} className="text-info shrink-0 mt-0.5" />
            <div>
              <strong className="text-encre">Forfait unique 275 FCFA / salarié actif / mois</strong>{' '}
              (composition <strong className="text-encre">150 + 75 + 50</strong> — distribution,
              signature, réclamation). Plan annuel à <strong className="text-encre">−{REMISE_ANNUELLE_PCT}%</strong> et
              canal cabinet en moyenne <strong className="text-encre">−{REMISE_PARTENAIRE_MOYENNE_PCT}%</strong>
              {' '}(tarif partenaire moyen ≈ {tarifPartenaireMoyen} FCFA).
            </div>
          </div>
        </Card>

        {/* Mix de canal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card padding="p-5">
            <h2 className="text-[16px] font-semibold text-encre">Mix de canal</h2>
            <p className="text-[12px] text-texte-secondaire">
              Salariés payants par mode de gestion
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-encre flex items-center gap-2">
                    <Icon name="Building2" size={13} className="text-encre" />
                    Direct (tarif plein)
                  </span>
                  <span className="text-texte-secondaire tabular-nums">
                    {formatNum(salariesPayants - salariesCabinet)} ({100 - partCabinet}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-encre rounded-full"
                    style={{ width: `${100 - partCabinet}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-encre flex items-center gap-2">
                    <Icon name="Briefcase" size={13} className="text-cachet" />
                    Via cabinet (tarif partenaire)
                  </span>
                  <span className="text-texte-secondaire tabular-nums">
                    {formatNum(salariesCabinet)} ({partCabinet}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cachet rounded-full"
                    style={{ width: `${partCabinet}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-bordure text-[12px] text-texte-secondaire">
              Le canal cabinet est essentiel à la pénétration du marché — la remise
              partenaire est le coût de cette acquisition indirecte.
            </div>
          </Card>

          <Card padding="p-5">
            <h2 className="text-[16px] font-semibold text-encre">Cascade brut → net</h2>
            <p className="text-[12px] text-texte-secondaire">
              De {formatFCFA(revenuBrut)} à {formatFCFA(mrrNet)} ({Math.round((mrrNet / revenuBrut) * 100)}%
              du brut conservé)
            </p>
            <div style={{ width: '100%', height: 240 }} className="mt-3">
              <Suspense fallback={<div className="h-full bg-surface/30 rounded animate-pulse" />}>
                <ChartCascadeRevenus data={cascade} />
              </Suspense>
            </div>
          </Card>
        </div>

        {/* MRR — 12 mois */}
        <Card padding="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[16px] font-semibold text-encre">MRR — 12 derniers mois</h2>
              <p className="text-[12px] text-texte-secondaire">
                Évolution du revenu mensuel récurrent
              </p>
            </div>
            <StatusPill tone="info" size="sm" icon="ChartLine">
              recharts lazy
            </StatusPill>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <Suspense fallback={<div className="h-full bg-surface/30 rounded animate-pulse" />}>
              <ChartMrr12m data={evolutionMrr} />
            </Suspense>
          </div>
        </Card>

        <div className="text-[11px] text-texte-secondaire flex items-center gap-1.5">
          <Icon name="ShieldCheck" size={11} className="text-succes" />
          Montants agrégés revenu Pli (exception légitime à l'invariant 1). Le net
          salarial individuel n'apparaît JAMAIS.
        </div>
      </div>
    </>
  );
}
