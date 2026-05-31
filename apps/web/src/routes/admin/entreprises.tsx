// AdminEntreprises — liste de toutes les entreprises de la plateforme
// (sub-lot 12b). Porté de _wireframe/src/admin-entreprises.jsx.
//
// AGRÉGAT CROSS-TENANT LÉGITIME : ce listing est SCOPÉ à `ContexteAdmin`. Le
// même service appelé depuis n'importe quel autre contexte ne compile pas.
//
// MONTANT MRR LÉGITIME (revenu Pli, pas net salarial) — voir vue-ensemble.tsx.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  Cabinet,
  Entreprise,
  MetriquesEntreprisePlateforme,
} from '@pli/types';
import {
  Button,
  Card,
  EmptyState,
  Icon,
  IconButton,
  SearchField,
  Select,
  StatusPill,
  Table,
  type StatusTone,
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

function initiales(nom: string): string {
  return nom
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function statutPill(s: Entreprise['statut']) {
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

export function AdminEntreprises() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);

  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [metriques, setMetriques] = useState<MetriquesEntreprisePlateforme[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtrePlan, setFiltrePlan] = useState('');
  const [filtreType, setFiltreType] = useState('');

  useEffect(() => {
    void (async () => {
      const [ents, mets, cabs] = await Promise.all([
        services.admin.listerEntreprises(CONTEXTE_DEMO),
        services.admin.listerMetriquesEntreprises(CONTEXTE_DEMO),
        services.admin.listerCabinets(CONTEXTE_DEMO),
      ]);
      setEntreprises(ents);
      setMetriques(mets);
      setCabinets(cabs);
    })();
  }, [services]);

  const metsParId = useMemo(
    () => new Map(metriques.map((m) => [m.entrepriseId, m])),
    [metriques],
  );
  const cabinetsParId = useMemo(
    () => new Map(cabinets.map((c) => [c.id, c])),
    [cabinets],
  );

  const filtrees = useMemo(() => {
    return entreprises.filter((e) => {
      const m = metsParId.get(e.id);
      if (
        recherche &&
        !`${e.nom} ${e.secteur ?? ''}`.toLowerCase().includes(recherche.toLowerCase())
      )
        return false;
      if (filtreStatut && e.statut !== filtreStatut) return false;
      if (filtrePlan && m?.planId !== filtrePlan) return false;
      if (filtreType && e.type !== filtreType) return false;
      return true;
    });
  }, [entreprises, metsParId, recherche, filtreStatut, filtrePlan, filtreType]);

  const actives = entreprises.filter((e) => e.statut === 'active').length;
  const aResetFiltres = recherche || filtreStatut || filtrePlan || filtreType;

  return (
    <>
      <AdminPageHeader
        title="Entreprises clientes"
        subtitle={`${entreprises.length} entreprises sur la plateforme · ${actives} actives`}
        actions={
          <>
            <Button variant="secondary" icon="Download">
              Exporter
            </Button>
            <Button variant="primary" icon="CirclePlus">
              Nouvelle entreprise
            </Button>
          </>
        }
      />

      <div className="p-8 space-y-4">
        <Card padding="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px]">
              <SearchField
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher une entreprise…"
              />
            </div>
            <Select
              size="md"
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              placeholder="Tous les statuts"
              icon="SlidersHorizontal"
              className="min-w-[180px]"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'essai', label: 'Essai' },
                { value: 'impaye', label: 'Impayé' },
                { value: 'suspendue', label: 'Suspendue' },
              ]}
            />
            <Select
              size="md"
              value={filtrePlan}
              onChange={(e) => setFiltrePlan(e.target.value)}
              placeholder="Tous les plans"
              icon="Tags"
              className="min-w-[180px]"
              options={[
                { value: 'mensuel', label: 'Mensuel' },
                { value: 'annuel', label: 'Annuel' },
              ]}
            />
            <Select
              size="md"
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              placeholder="Tous les types"
              icon="Building2"
              className="min-w-[200px]"
              options={[
                { value: 'directe', label: 'Entreprise directe' },
                { value: 'cabinet', label: 'Via cabinet' },
              ]}
            />
            {aResetFiltres && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRecherche('');
                  setFiltreStatut('');
                  setFiltrePlan('');
                  setFiltreType('');
                }}
              >
                Réinitialiser
              </Button>
            )}
            <div className="ml-auto text-[12px] text-texte-secondaire">
              {filtrees.length} résultat{filtrees.length > 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        <Card padding="p-0">
          {filtrees.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="Building2"
                title="Aucune entreprise"
                description="Aucun résultat pour ces filtres."
              />
            </div>
          ) : (
            <>
              <Table
                columns={[
                  {
                    label: 'Entreprise',
                    render: (r) => {
                      const cabinet = r.cabinetId ? cabinetsParId.get(r.cabinetId) : null;
                      return (
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-[11px] font-semibold text-encre shrink-0">
                            {initiales(r.nom)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-encre truncate">{r.nom}</div>
                            <div className="text-[12px] text-texte-secondaire truncate">
                              {r.secteur ?? '—'}
                              {cabinet && (
                                <>
                                  {' · '}
                                  <Icon
                                    name="Briefcase"
                                    size={10}
                                    className="inline mr-0.5"
                                  />
                                  {cabinet.nom}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    label: 'Plan',
                    width: 130,
                    render: (r) => {
                      const m = metsParId.get(r.id);
                      return (
                        <span className="text-[12px] px-2 py-0.5 rounded bg-surface text-encre font-medium">
                          {m?.planId === 'annuel' ? 'Annuel' : 'Mensuel'}
                        </span>
                      );
                    },
                  },
                  {
                    label: 'Salariés',
                    width: 100,
                    render: (r) => (
                      <span className="tabular-nums">
                        {formatNum(metsParId.get(r.id)?.salaries ?? 0)}
                      </span>
                    ),
                  },
                  {
                    label: 'Bulletins /mois',
                    width: 130,
                    render: (r) => (
                      <span className="tabular-nums text-texte-secondaire">
                        {formatNum(metsParId.get(r.id)?.bulletinsMois ?? 0)}
                      </span>
                    ),
                  },
                  {
                    label: 'MRR',
                    width: 140,
                    render: (r) => (
                      <span className="tabular-nums font-medium">
                        {formatFCFA(metsParId.get(r.id)?.mrr ?? 0)}
                      </span>
                    ),
                  },
                  { label: 'Statut', width: 130, render: (r) => statutPill(r.statut) },
                  {
                    label: 'Inscription',
                    width: 130,
                    render: (r) => (
                      <span className="text-texte-secondaire tabular-nums">
                        {metsParId.get(r.id)?.dateInscription ?? '—'}
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
                data={filtrees}
              />
              <div className="flex items-center justify-between px-5 py-3 border-t border-bordure">
                <div className="text-[12px] text-texte-secondaire">
                  Affichage de 1 à {filtrees.length} sur {filtrees.length}
                </div>
                <div className="flex items-center gap-1">
                  <IconButton
                    icon="ChevronLeft"
                    ariaLabel="Précédent"
                    size="sm"
                    variant="secondary"
                  />
                  <button
                    type="button"
                    className="h-8 w-8 rounded-md bg-encre text-white text-[13px] font-medium"
                  >
                    1
                  </button>
                  <IconButton
                    icon="ChevronRight"
                    ariaLabel="Suivant"
                    size="sm"
                    variant="secondary"
                  />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Note audit : toute action sur une entreprise = entrée d'audit (Phase 1). */}
        <div className="text-[11px] text-texte-secondaire flex items-center gap-1.5">
          <Icon name="ScrollText" size={11} className="text-info" />
          Toute action depuis cette console (impersonation, suspension, changement de
          plan) est journalisée — voir <Link to="/admin/audit" className="underline">journal
          d'audit</Link>.
        </div>
      </div>
    </>
  );
}
