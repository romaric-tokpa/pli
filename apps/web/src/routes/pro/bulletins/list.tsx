// ProBulletins — liste des bulletins du registre.
// Port verbatim de pro-bulletins.jsx (ProBulletins).
//
// Données via BulletinsService.lister() qui renvoie BulletinResume[] —
// aucun champ montant (brut/cnps/its/net). Invariant CLAUDE.md
// « net jamais en liste » tenu par le contrat du service (cf. étape 7).

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  IconButton,
  SearchField,
  Select,
  StatusPill,
  Table,
} from '@pli/ui';
import type {
  BulletinResume,
  ContexteEntreprise,
} from '../../../services/index.js';
import {
  creerBulletinsServiceMock,
  creerSalariesServiceMock,
} from '../../../services/index.js';
import { ProPageHeader } from '../_page-header.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant()
const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

const PERIODES = [
  { id: '2026-02', libelle: 'Février 2026', court: 'Fév. 2026' },
  { id: '2026-01', libelle: 'Janvier 2026', court: 'Jan. 2026' },
  { id: '2025-12', libelle: 'Décembre 2025', court: 'Déc. 2025' },
  { id: '2025-11', libelle: 'Novembre 2025', court: 'Nov. 2025' },
];

interface LigneBulletin extends BulletinResume {
  salarieNom: string;
  salarieMatricule: string;
}

export function ProBulletins() {
  const [bulletins, setBulletins] = useState<LigneBulletin[]>([]);
  const [q, setQ] = useState('');
  const [periode, setPeriode] = useState('');
  const [appairage, setAppairage] = useState('');
  const [consult, setConsult] = useState('');

  useEffect(() => {
    const services = {
      bulletins: creerBulletinsServiceMock(),
      salaries: creerSalariesServiceMock(),
    };
    void (async () => {
      // BulletinsService.lister() — BulletinResume[] (sans net)
      const liste = await services.bulletins.lister(CONTEXTE_PRO);
      const enrichis = await Promise.all(
        liste.map(async (b) => {
          const sal = await services.salaries.obtenir(CONTEXTE_PRO, b.salarieId);
          return {
            ...b,
            salarieNom: sal?.nom ?? '',
            salarieMatricule: sal?.matricule ?? '',
          } satisfies LigneBulletin;
        }),
      );
      setBulletins(enrichis);
    })();
  }, []);

  const filtered = useMemo(() => {
    return bulletins.filter((b) => {
      if (q) {
        const aig = q.toLowerCase();
        if (
          !b.salarieNom.toLowerCase().includes(aig) &&
          !b.salarieMatricule.toLowerCase().includes(aig)
        ) {
          return false;
        }
      }
      if (periode && b.periode !== periode) return false;
      if (appairage === 'distribue' && b.statutRemise !== 'distribue') return false;
      if (appairage === 'en_attente' && b.statutRemise !== 'en_attente') return false;
      if (consult === 'consulte' && b.statutConsultation !== 'consulte') return false;
      if (consult === 'non_consulte' && b.statutConsultation !== 'non_consulte') return false;
      return true;
    });
  }, [bulletins, q, periode, appairage, consult]);

  return (
    <>
      <ProPageHeader
        title="Bulletins"
        subtitle={`${bulletins.length} bulletins dans votre registre, toutes périodes confondues`}
        actions={
          <>
            <Link to="/pro/bulletins/depot-individuel">
              <Button variant="secondary" icon="FilePlus">
                Dépôt individuel
              </Button>
            </Link>
            <Link to="/pro/bulletins/upload">
              <Button variant="primary" icon="CloudUpload">
                Dépôt en masse
              </Button>
            </Link>
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
                placeholder="Rechercher un salarié, un matricule…"
              />
            </div>
            <Select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              placeholder="Toutes les périodes"
              icon="CalendarRange"
              options={PERIODES.map((p) => ({ value: p.id, label: p.libelle }))}
              className="min-w-[200px]"
            />
            <Select
              value={appairage}
              onChange={(e) => setAppairage(e.target.value)}
              placeholder="Tous les statuts de remise"
              icon="FileCheck2"
              options={[
                { value: 'distribue', label: 'Distribué' },
                { value: 'en_attente', label: 'En attente' },
              ]}
              className="min-w-[200px]"
            />
            <Select
              value={consult}
              onChange={(e) => setConsult(e.target.value)}
              placeholder="Toutes les consultations"
              icon="Eye"
              options={[
                { value: 'consulte', label: 'Consulté' },
                { value: 'non_consulte', label: 'Non consulté' },
              ]}
              className="min-w-[200px]"
            />
            {(q || periode || appairage || consult) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQ('');
                  setPeriode('');
                  setAppairage('');
                  setConsult('');
                }}
              >
                Réinitialiser
              </Button>
            )}
            <div className="ml-auto text-[12px] text-texte-secondaire">
              {filtered.length} bulletin{filtered.length > 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        <Card padding="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon="FileText"
              title="Aucun bulletin ne correspond à vos filtres"
            />
          ) : (
            <Table<LigneBulletin>
              columns={[
                {
                  label: 'Période',
                  width: 140,
                  render: (r) => (
                    <span className="font-medium">
                      {PERIODES.find((p) => p.id === r.periode)?.court ?? r.periode}
                    </span>
                  ),
                },
                {
                  label: 'Salarié',
                  render: (r) => (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.salarieNom} size={28} />
                      <div>
                        <div className="font-medium">{r.salarieNom}</div>
                        <div className="text-[12px] text-texte-secondaire font-mono">
                          {r.salarieMatricule}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  label: 'Appairage',
                  width: 140,
                  render: () => (
                    <StatusPill tone="succes" size="sm" icon="FileCheck2">
                      Apparié
                    </StatusPill>
                  ),
                },
                {
                  label: 'Remise',
                  width: 130,
                  render: (r) =>
                    r.statutRemise === 'distribue' ? (
                      <StatusPill tone="succes" size="sm" icon="Check">
                        Distribué
                      </StatusPill>
                    ) : (
                      <StatusPill tone="attente" size="sm">
                        En attente
                      </StatusPill>
                    ),
                },
                {
                  label: 'Consultation',
                  width: 200,
                  render: (r) =>
                    r.statutConsultation === 'consulte' ? (
                      <div className="flex flex-col gap-0.5">
                        <StatusPill tone="succes" size="sm" icon="Eye">
                          Consulté
                        </StatusPill>
                        {r.dateConsultation && (
                          <span className="text-[11px] text-texte-secondaire">
                            le {r.dateConsultation}
                          </span>
                        )}
                      </div>
                    ) : (
                      <StatusPill tone="attente" size="sm">
                        Non consulté
                      </StatusPill>
                    ),
                },
                {
                  label: 'Signature',
                  width: 130,
                  render: (r) =>
                    r.statutSignature === 'signe' ? (
                      <StatusPill tone="succes" size="sm" icon="BadgeCheck">
                        Signé
                      </StatusPill>
                    ) : r.statutSignature === 'requis_non_signe' ? (
                      <StatusPill tone="attente" size="sm" icon="PenLine">
                        À signer
                      </StatusPill>
                    ) : (
                      <span className="text-[12px] text-texte-secondaire">—</span>
                    ),
                },
                {
                  label: '',
                  width: 90,
                  render: () => (
                    <div className="flex items-center justify-end gap-1">
                      <IconButton icon="Eye" ariaLabel="Voir" size="sm" />
                      <IconButton icon="BellRing" ariaLabel="Relancer" size="sm" />
                    </div>
                  ),
                },
              ]}
              data={filtered}
            />
          )}
        </Card>
      </div>
    </>
  );
}
