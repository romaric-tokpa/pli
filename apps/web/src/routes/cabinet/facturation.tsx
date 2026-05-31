// CabinetFacturation — facturation côté cabinet (sub-lot 11c).
//
// Porté de _wireframe/src/cabinet-screens.jsx (CabinetFacturation).
//
// DEUX MODES (Cabinet.modeFacturation) :
//
//   1. consolide — Pli facture le cabinet pour l'ensemble des salariés du
//      portefeuille, avec une remise partenaire (`remisePartenaire %`). Le
//      cabinet refacture ses clients hors plateforme.
//
//   2. par_entreprise — chaque entreprise paie directement Pli au forfait
//      275 FCFA, et Pli reverse une commission (`tauxCommission %`) au
//      cabinet sur le revenu généré.
//
// La constante 275 FCFA est SOURCE DE VÉRITÉ via FacturationService.obtenirTarifs()
// — couverte par le test de contrat `suiteContratFacturation` (composition
// 150 + 75 + 50). Ici on l'utilise pour la dérivation cabinet.

import { useEffect, useMemo, useState } from 'react';
import type { Cabinet, Entreprise, MetriquesPortefeuilleEntreprise } from '@pli/types';
import { Button, Card, Icon, IconButton, KPICard, Switch, Table } from '@pli/ui';
import {
  creerCabinetsServiceMock,
  creerFacturationServiceMock,
  type ContextePortefeuilleCabinet,
} from '../../services/index.js';
import { CabinetPageHeader } from './_page-header.js';

// TODO(phase-1) — voir _layout.tsx
const CONTEXTE_DEMO: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: 'cab-ebrie',
};

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

interface DerivationMrr {
  salaries: number;
  tarif: number;
  mrr: number;
  commission: number;
}

function calculerMrrCabinet(
  cab: Cabinet,
  entreprises: Entreprise[],
  metsParId: Map<string, MetriquesPortefeuilleEntreprise>,
  forfait: number,
): DerivationMrr {
  const salaries = entreprises.reduce(
    (s, e) => s + (metsParId.get(e.id)?.salaries ?? 0),
    0,
  );
  if (cab.modeFacturation === 'consolide') {
    const tarif = Math.round(forfait * (1 - (cab.remisePartenaire ?? 0) / 100));
    return { salaries, tarif, mrr: salaries * tarif, commission: 0 };
  }
  const revenu = salaries * forfait;
  const commission = Math.round((revenu * (cab.tauxCommission ?? 0)) / 100);
  return { salaries, tarif: forfait, mrr: revenu, commission };
}

export function CabinetFacturation() {
  const services = useMemo(
    () => ({
      cabinets: creerCabinetsServiceMock(),
      facturation: creerFacturationServiceMock(),
    }),
    [],
  );

  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [metriques, setMetriques] = useState<MetriquesPortefeuilleEntreprise[]>([]);
  const [forfait, setForfait] = useState(275);
  const [paiementWaveActif, setPaiementWaveActif] = useState(true);
  const [paiementChequeActif, setPaiementChequeActif] = useState(false);

  useEffect(() => {
    void (async () => {
      const [cab, port, mets, tarifs] = await Promise.all([
        services.cabinets.obtenirCabinet(CONTEXTE_DEMO),
        services.cabinets.obtenirPortefeuille(CONTEXTE_DEMO),
        services.cabinets.obtenirMetriquesPortefeuille(CONTEXTE_DEMO),
        services.facturation.obtenirTarifs(),
      ]);
      setCabinet(cab);
      setEntreprises(port);
      setMetriques(mets);
      setForfait(tarifs.forfaitMois);
    })();
  }, [services]);

  const metsParId = useMemo(
    () => new Map(metriques.map((m) => [m.entrepriseId, m])),
    [metriques],
  );

  if (!cabinet) {
    return (
      <div className="p-12">
        <Card padding="p-6">
          <div className="h-6 w-48 bg-surface rounded animate-pulse" />
        </Card>
      </div>
    );
  }

  const consolide = cabinet.modeFacturation === 'consolide';
  const m = calculerMrrCabinet(cabinet, entreprises, metsParId, forfait);
  const suffixe = cabinet.id.slice(-3);

  return (
    <>
      <CabinetPageHeader
        title="Facturation du cabinet"
        subtitle={
          consolide
            ? `Mode consolidé · tarif partenaire ${m.tarif} FCFA / salarié / mois (−${cabinet.remisePartenaire ?? 0}%)`
            : `Mode par entreprise · commission cabinet ${cabinet.tauxCommission ?? 0}%`
        }
        actions={
          <Button variant="secondary" icon="ArrowRightLeft">
            Changer de mode
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Bandeau mode */}
        <Card
          padding="p-5"
          bg="bg-encre"
          className="text-white border-encre"
          style={{ background: 'linear-gradient(135deg, #15294E 0%, #0F1F3D 100%)' }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  name={consolide ? 'Receipt' : 'Building2'}
                  size={14}
                  className="text-cachet"
                />
                <span
                  className="text-[11px] uppercase tracking-wide text-white/55"
                  style={{ letterSpacing: '.06em' }}
                >
                  Mode {consolide ? 'consolidé' : 'par entreprise'}
                </span>
              </div>
              <h2 className="text-[22px] font-semibold">
                {consolide ? 'Facture unique au cabinet' : 'Facturation directe + commission'}
              </h2>
              <p className="mt-1 text-[13px] text-white/70 max-w-lg">
                {consolide
                  ? `Pli facture votre cabinet pour l'ensemble des salariés de votre portefeuille. Vous refacturez vos clients hors plateforme.`
                  : `Chaque entreprise paie directement Pli au forfait ${forfait} FCFA. Vous touchez ${cabinet.tauxCommission ?? 0}% de commission sur le revenu généré.`}
              </p>
            </div>
            <div className="text-right">
              <div
                className="text-[11px] text-white/60 uppercase tracking-wide"
                style={{ letterSpacing: '.06em' }}
              >
                {consolide ? 'Tarif partenaire' : 'Commission'}
              </div>
              <div className="text-[36px] font-semibold leading-none mt-1 tabular-nums">
                {consolide ? (
                  <>
                    {m.tarif}
                    <span className="text-[14px] text-white/70 ml-1">FCFA</span>
                  </>
                ) : (
                  <>
                    {cabinet.tauxCommission ?? 0}
                    <span className="text-[14px] text-white/70 ml-0.5">%</span>
                  </>
                )}
              </div>
              <div className="text-[12px] text-white/60 mt-1">
                {consolide ? 'par salarié actif / mois' : 'du revenu généré'}
              </div>
            </div>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            label="Salariés facturés"
            value={formatNum(m.salaries)}
            icon="Users"
            tone="info"
            hint={`${entreprises.length} entreprises`}
          />
          <KPICard
            label={consolide ? 'Montant mensuel' : 'Revenu généré (entreprises)'}
            value={`${formatNum(m.mrr)} FCFA`}
            icon="Wallet"
            tone="succes"
          />
          <KPICard
            label={consolide ? 'Prochaine échéance' : 'Commission due ce mois'}
            value={consolide ? '01/04/2026' : `${formatNum(m.commission)} FCFA`}
            icon="Calendar"
            tone="neutre"
          />
        </div>

        {/* Détail par entreprise */}
        <Card padding="p-0">
          <div className="p-5 border-b border-bordure">
            <h2 className="text-[16px] font-semibold text-encre">
              Détail par entreprise — Février 2026
            </h2>
            <p className="text-[12.5px] text-texte-secondaire">
              {consolide
                ? 'Composition de la facture consolidée'
                : 'Revenu et commission par entreprise'}
            </p>
          </div>
          <Table
            dense
            columns={[
              {
                label: 'Entreprise',
                render: (r) => <span className="font-medium text-encre">{r.nom}</span>,
              },
              {
                label: 'Salariés',
                width: 110,
                render: (r) => (
                  <span className="tabular-nums">
                    {metsParId.get(r.id)?.salaries ?? 0}
                  </span>
                ),
              },
              {
                label: consolide ? 'Tarif unitaire' : 'Forfait',
                width: 130,
                render: () => (
                  <span className="text-texte-secondaire">
                    {consolide ? m.tarif : forfait} FCFA
                  </span>
                ),
              },
              {
                label: consolide ? 'Sous-total' : 'Revenu entreprise',
                width: 160,
                render: (r) => {
                  const salaries = metsParId.get(r.id)?.salaries ?? 0;
                  const sousTotal = salaries * (consolide ? m.tarif : forfait);
                  return <span className="tabular-nums">{formatNum(sousTotal)} FCFA</span>;
                },
              },
              ...(consolide
                ? []
                : [
                    {
                      label: 'Commission cabinet',
                      width: 160,
                      render: (r: Entreprise) => {
                        const salaries = metsParId.get(r.id)?.salaries ?? 0;
                        const com = Math.round(
                          (salaries * forfait * (cabinet.tauxCommission ?? 0)) / 100,
                        );
                        return (
                          <span className="tabular-nums font-medium text-cachet">
                            {formatNum(com)} FCFA
                          </span>
                        );
                      },
                    },
                  ]),
            ]}
            data={entreprises}
          />
          <div className="px-5 py-3 border-t border-bordure flex justify-between items-center">
            <div className="text-[13px] font-medium text-encre">
              {consolide ? 'Total facturé au cabinet' : 'Commission totale due'}
            </div>
            <div className="text-[20px] font-semibold text-encre tabular-nums">
              {formatNum(consolide ? m.mrr : m.commission)} FCFA
            </div>
          </div>
        </Card>

        {/* Mode de paiement */}
        <Card padding="p-5">
          <h2 className="text-[16px] font-semibold text-encre mb-3">Mode de paiement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              className={`rounded-md border p-4 flex items-center gap-3 ${paiementWaveActif ? 'border-encre bg-encre/5' : 'border-bordure bg-white'}`}
            >
              <div
                className={`h-9 w-9 rounded flex items-center justify-center ${paiementWaveActif ? 'bg-encre text-white' : 'bg-surface text-encre'}`}
              >
                <Icon name="Smartphone" size={14} />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-medium text-encre">Wave</div>
                <div className="text-[11.5px] text-texte-secondaire">
                  Compte Wave lié à {cabinet.email}
                </div>
              </div>
              <Switch checked={paiementWaveActif} onChange={() => setPaiementWaveActif((v) => !v)} />
            </div>
            <div
              className={`rounded-md border p-4 flex items-center gap-3 ${paiementChequeActif ? 'border-encre bg-encre/5' : 'border-bordure bg-white'}`}
            >
              <div
                className={`h-9 w-9 rounded flex items-center justify-center ${paiementChequeActif ? 'bg-encre text-white' : 'bg-surface text-encre'}`}
              >
                <Icon name="CreditCard" size={14} />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-medium text-encre">Chèque</div>
                <div className="text-[11.5px] text-texte-secondaire">
                  Émis à l'ordre de Pli SARL
                </div>
              </div>
              <Switch
                checked={paiementChequeActif}
                onChange={() => setPaiementChequeActif((v) => !v)}
              />
            </div>
          </div>
        </Card>

        {/* Historique factures (généré côté UI) */}
        <Card padding="p-0">
          <div className="p-5 border-b border-bordure">
            <h2 className="text-[16px] font-semibold text-encre">Historique des factures</h2>
          </div>
          <Table
            dense
            columns={[
              {
                label: 'Numéro',
                width: 200,
                render: (r) => <span className="font-mono text-[12px]">{r.numero}</span>,
              },
              { label: 'Période', width: 160, render: (r) => r.periode },
              {
                label: 'Émise le',
                width: 130,
                render: (r) => <span className="text-texte-secondaire">{r.date}</span>,
              },
              {
                label: 'Mode',
                width: 110,
                render: (r) => (
                  <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                    <Icon
                      name={r.mode === 'Wave' ? 'Smartphone' : 'CreditCard'}
                      size={12}
                      className="text-cachet"
                    />
                    {r.mode}
                  </span>
                ),
              },
              {
                label: 'Statut',
                width: 130,
                render: (r) =>
                  r.statut === 'payee' ? (
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-succes font-medium">
                      <Icon name="CircleCheckBig" size={11} />
                      Payée
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-attente font-medium">
                      <Icon name="Clock" size={11} />
                      En attente
                    </span>
                  ),
              },
              {
                label: 'Montant',
                width: 160,
                render: (r) => (
                  <span className="tabular-nums font-medium">
                    {formatNum(r.montant)} FCFA
                  </span>
                ),
              },
              {
                label: '',
                width: 80,
                render: () => (
                  <IconButton icon="Download" ariaLabel="Télécharger" size="sm" />
                ),
              },
            ]}
            data={[
              {
                numero: `FAC-2026-002-CAB-${suffixe}`,
                periode: 'Février 2026',
                date: '01/03/2026',
                mode: 'Wave' as const,
                statut: 'en_attente' as const,
                montant: m.mrr,
              },
              {
                numero: `FAC-2026-001-CAB-${suffixe}`,
                periode: 'Janvier 2026',
                date: '01/02/2026',
                mode: 'Wave' as const,
                statut: 'payee' as const,
                montant: m.mrr,
              },
              {
                numero: `FAC-2025-012-CAB-${suffixe}`,
                periode: 'Décembre 2025',
                date: '01/01/2026',
                mode: 'Chèque' as const,
                statut: 'payee' as const,
                montant: m.mrr,
              },
              {
                numero: `FAC-2025-011-CAB-${suffixe}`,
                periode: 'Novembre 2025',
                date: '01/12/2025',
                mode: 'Chèque' as const,
                statut: 'payee' as const,
                montant: m.mrr,
              },
            ]}
          />
        </Card>
      </div>
    </>
  );
}
