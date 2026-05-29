// ProSalaries — liste des salariés du registre RH.
// Port verbatim de pro-salaries.jsx (ProSalaries).
//
// Données via SalariesService.lister(ctx) — tenant scopé. Aucun accès direct
// au mock. Le contexte est posé en constante (TODO(phase-1)).

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  EmptyState,
  IconButton,
  SearchField,
  Select,
  SkeletonRow,
  StatusPill,
  Table,
  type StatusTone,
} from '@pli/ui';
import type { Salarie, StatutSalarie } from '@pli/types';
import {
  creerSalariesServiceMock,
  type ContexteEntreprise,
} from '../../../services/index.js';
import { ProPageHeader } from '../_page-header.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant()
const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

// TODO(phase-1) — wirer à EntrepriseService (registre de services)
const SERVICES_REGISTRE = [
  'Comptabilité',
  'Commercial',
  'RH',
  'Production',
  'Logistique',
  'Direction',
  'Informatique',
  'Maintenance',
];

function pillStatut(s: StatutSalarie) {
  const config: Record<StatutSalarie, { tone: StatusTone; label: string }> = {
    actif: { tone: 'succes', label: 'Actif' },
    invite: { tone: 'info', label: 'Invité' },
    desactive: { tone: 'neutre', label: 'Désactivé' },
  };
  const c = config[s];
  return (
    <StatusPill tone={c.tone} size="sm" icon={s === 'invite' ? 'Mail' : undefined}>
      {c.label}
    </StatusPill>
  );
}

export function ProSalaries() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [q, setQ] = useState('');
  const [service, setService] = useState('');
  const [statut, setStatut] = useState<'' | StatutSalarie>('');
  const [apercuVide, setApercuVide] = useState(false);

  useEffect(() => {
    const salariesService = creerSalariesServiceMock();
    void (async () => {
      const liste = await salariesService.lister(CONTEXTE_PRO);
      setSalaries(liste);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const base = apercuVide ? [] : salaries;
    return base.filter((s) => {
      if (q) {
        const aig = q.toLowerCase();
        if (
          !s.nom.toLowerCase().includes(aig) &&
          !s.matricule.toLowerCase().includes(aig) &&
          !s.email.toLowerCase().includes(aig)
        ) {
          return false;
        }
      }
      if (service && s.service !== service) return false;
      if (statut && s.statut !== statut) return false;
      return true;
    });
  }, [salaries, q, service, statut, apercuVide]);

  const total = salaries.length;

  return (
    <>
      <ProPageHeader
        title="Salariés"
        subtitle={`${total} salariés enregistrés dans le registre`}
        actions={
          <>
            <Link to="/pro/salaries/import">
              <Button variant="secondary" icon="CloudUpload">
                Importer
              </Button>
            </Link>
            <Button variant="primary" icon="UserPlus">
              Ajouter un salarié
            </Button>
          </>
        }
      />

      <div className="p-8 space-y-4">
        <Card padding="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px]">
              <SearchField
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher par nom, matricule, e-mail…"
              />
            </div>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Tous les services"
              icon="Building2"
              options={SERVICES_REGISTRE.map((d) => ({ value: d, label: d }))}
              className="min-w-[200px]"
            />
            <Select
              value={statut}
              onChange={(e) => setStatut(e.target.value as '' | StatutSalarie)}
              placeholder="Tous les statuts"
              icon="SlidersHorizontal"
              options={[
                { value: 'actif', label: 'Actif' },
                { value: 'invite', label: 'Invité' },
                { value: 'desactive', label: 'Désactivé' },
              ]}
              className="min-w-[180px]"
            />
            {(q || service || statut) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQ('');
                  setService('');
                  setStatut('');
                }}
              >
                Réinitialiser
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2 text-[12px] text-texte-secondaire">
              <span>
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              </span>
              <span className="w-px h-4 bg-bordure" />
              <Checkbox
                checked={apercuVide}
                onChange={() => setApercuVide(!apercuVide)}
                label="Aperçu vide"
              />
            </div>
          </div>
        </Card>

        <Card padding="p-0">
          {loading ? (
            <div className="px-5 py-4 space-y-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="Users"
              title="Aucun salarié enregistré"
              description="Importez votre liste depuis un fichier CSV ou Excel pour commencer à distribuer des bulletins."
              action={
                <div className="flex gap-2 justify-center">
                  <Button variant="secondary" icon="UserPlus">
                    Ajouter manuellement
                  </Button>
                  <Link to="/pro/salaries/import">
                    <Button variant="primary" icon="CloudUpload">
                      Importer un fichier
                    </Button>
                  </Link>
                </div>
              }
            />
          ) : (
            <Table<Salarie>
              columns={[
                {
                  label: 'Matricule',
                  width: 130,
                  render: (r) => <span className="font-mono text-[12.5px]">{r.matricule}</span>,
                },
                {
                  label: 'Salarié',
                  render: (r) => (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.nom} size={30} />
                      <div>
                        <div className="font-medium">{r.nom}</div>
                        <div className="text-[12px] text-texte-secondaire">{r.email}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  label: 'Service',
                  width: 160,
                  render: (r) => <span className="text-texte-secondaire">{r.service}</span>,
                },
                {
                  label: 'Statut',
                  width: 120,
                  render: (r) => pillStatut(r.statut),
                },
                {
                  label: 'Dernière consultation',
                  width: 180,
                  render: (r) =>
                    r.derniereConsultation === '—' ? (
                      <span className="text-texte-secondaire">—</span>
                    ) : (
                      <span className="text-texte-secondaire tabular-nums">
                        {r.derniereConsultation}
                      </span>
                    ),
                },
                {
                  label: '',
                  width: 60,
                  render: () => (
                    <div className="flex justify-end">
                      <IconButton icon="ChevronRight" ariaLabel="Voir la fiche" size="sm" />
                    </div>
                  ),
                },
              ]}
              data={filtered}
              onRowClick={(r) => navigate(`/pro/salaries/${r.id}`)}
            />
          )}

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-bordure">
              <div className="text-[12px] text-texte-secondaire">
                Affichage de 1 à {filtered.length} sur {filtered.length}
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
          )}
        </Card>
      </div>
    </>
  );
}
