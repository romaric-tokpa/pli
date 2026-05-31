// AdminCabinets — liste de tous les cabinets partenaires (sub-lot 12b).
// Porté de _wireframe/src/admin-entreprises.jsx (vue cabinets).
//
// AGRÉGAT CROSS-TENANT LÉGITIME (admin uniquement). Les métriques montrent
// pour chaque cabinet : MRR cumulé du portefeuille, effectif cumulé, nombre
// d'entreprises gérées, taux négocié (commission ou remise selon mode).

import { useEffect, useMemo, useState } from 'react';
import type { Cabinet, MetriquesCabinetPlateforme } from '@pli/types';
import {
  Button,
  Card,
  EmptyState,
  Icon,
  IconButton,
  SearchField,
  StatusPill,
  Table,
} from '@pli/ui';
import { creerAdminServiceMock, type ContexteAdmin } from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

function formatFCFA(n: number): string {
  return `${formatNum(n)} FCFA`;
}

export function AdminCabinets() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);

  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [metriques, setMetriques] = useState<MetriquesCabinetPlateforme[]>([]);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    void (async () => {
      const [cabs, mets] = await Promise.all([
        services.admin.listerCabinets(CONTEXTE_DEMO),
        services.admin.listerMetriquesCabinets(CONTEXTE_DEMO),
      ]);
      setCabinets(cabs);
      setMetriques(mets);
    })();
  }, [services]);

  const metsParId = useMemo(
    () => new Map(metriques.map((m) => [m.cabinetId, m])),
    [metriques],
  );

  const filtres = useMemo(() => {
    if (!recherche) return cabinets;
    return cabinets.filter((c) =>
      `${c.nom} ${c.contact}`.toLowerCase().includes(recherche.toLowerCase()),
    );
  }, [cabinets, recherche]);

  const mrrCumule = metriques.reduce((s, m) => s + m.mrr, 0);
  const salariesCumules = metriques.reduce((s, m) => s + m.salariesCumules, 0);
  const entreprisesGerees = metriques.reduce((s, m) => s + m.entreprisesGerees, 0);

  return (
    <>
      <AdminPageHeader
        title="Cabinets partenaires"
        subtitle={`${cabinets.length} cabinets · ${entreprisesGerees} entreprises sous gestion`}
        actions={
          <>
            <Button variant="secondary" icon="Download">
              Exporter
            </Button>
            <Button variant="primary" icon="CirclePlus">
              Nouveau cabinet
            </Button>
          </>
        }
      />

      <div className="p-8 space-y-4">
        {/* KPIs cabinet — totaux plateforme */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="p-4">
            <div
              className="text-[11px] text-texte-secondaire uppercase tracking-wide"
              style={{ letterSpacing: '.05em' }}
            >
              Entreprises gérées
            </div>
            <div className="text-[22px] font-semibold text-encre tabular-nums mt-1">
              {entreprisesGerees}
            </div>
            <div className="text-[11px] text-texte-secondaire">
              via les {cabinets.length} cabinets
            </div>
          </Card>
          <Card padding="p-4">
            <div
              className="text-[11px] text-texte-secondaire uppercase tracking-wide"
              style={{ letterSpacing: '.05em' }}
            >
              Salariés cumulés (cabinets)
            </div>
            <div className="text-[22px] font-semibold text-encre tabular-nums mt-1">
              {formatNum(salariesCumules)}
            </div>
            <div className="text-[11px] text-texte-secondaire">
              hors tenants directs
            </div>
          </Card>
          <Card padding="p-4">
            <div
              className="text-[11px] text-texte-secondaire uppercase tracking-wide"
              style={{ letterSpacing: '.05em' }}
            >
              MRR cumulé (cabinets)
            </div>
            <div className="text-[22px] font-semibold text-succes tabular-nums mt-1">
              {formatFCFA(mrrCumule)}
            </div>
            <div className="text-[11px] text-texte-secondaire">généré ce mois</div>
          </Card>
        </div>

        <Card padding="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px]">
              <SearchField
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un cabinet…"
              />
            </div>
            <div className="ml-auto text-[12px] text-texte-secondaire">
              {filtres.length} résultat{filtres.length > 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        <Card padding="p-0">
          {filtres.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="Briefcase"
                title="Aucun cabinet"
                description="Aucun cabinet ne correspond à votre recherche."
              />
            </div>
          ) : (
            <Table
              columns={[
                {
                  label: 'Cabinet',
                  render: (r) => (
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre shrink-0">
                        <Icon name="Briefcase" size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-encre truncate">{r.nom}</div>
                        <div className="text-[12px] text-texte-secondaire truncate">
                          {r.contact} · {r.email}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  label: 'Type',
                  width: 130,
                  render: (r) => (
                    <StatusPill
                      tone={r.type === 'comptable' ? 'info' : 'neutre'}
                      size="sm"
                    >
                      {r.type === 'comptable' ? 'Comptable' : 'Intérim'}
                    </StatusPill>
                  ),
                },
                {
                  label: 'Mode',
                  width: 140,
                  render: (r) => (
                    <span className="text-[12px] text-texte-secondaire">
                      {r.modeFacturation === 'consolide'
                        ? 'Consolidé'
                        : 'Par entreprise'}
                    </span>
                  ),
                },
                {
                  label: 'Entreprises',
                  width: 110,
                  render: (r) => (
                    <span className="tabular-nums">
                      {metsParId.get(r.id)?.entreprisesGerees ?? 0}
                    </span>
                  ),
                },
                {
                  label: 'Salariés cumulés',
                  width: 140,
                  render: (r) => (
                    <span className="tabular-nums">
                      {formatNum(metsParId.get(r.id)?.salariesCumules ?? 0)}
                    </span>
                  ),
                },
                {
                  label: 'MRR portefeuille',
                  width: 160,
                  render: (r) => (
                    <span className="tabular-nums font-medium">
                      {formatFCFA(metsParId.get(r.id)?.mrr ?? 0)}
                    </span>
                  ),
                },
                {
                  label: 'Taux négocié',
                  width: 140,
                  render: (r) => {
                    const m = metsParId.get(r.id);
                    if (!m) return null;
                    const lbl =
                      r.modeFacturation === 'consolide'
                        ? `−${m.pctNegocie}% remise`
                        : `${m.pctNegocie}% commission`;
                    return (
                      <span
                        className={`text-[12px] font-medium ${r.modeFacturation === 'consolide' ? 'text-info' : 'text-cachet'}`}
                      >
                        {lbl}
                      </span>
                    );
                  },
                },
                {
                  label: 'Date contrat',
                  width: 130,
                  render: (r) => (
                    <span className="text-texte-secondaire tabular-nums">
                      {r.dateContrat}
                    </span>
                  ),
                },
                {
                  label: '',
                  width: 50,
                  render: () => (
                    <IconButton icon="ChevronRight" ariaLabel="Voir" size="sm" />
                  ),
                },
              ]}
              data={filtres}
            />
          )}
        </Card>

        <div className="text-[11px] text-texte-secondaire flex items-center gap-1.5">
          <Icon name="ScrollText" size={11} className="text-info" />
          Toute action sur un cabinet (changement de mode, suspension) est journalisée.
        </div>
      </div>
    </>
  );
}
