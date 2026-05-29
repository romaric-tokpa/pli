// Suivi de la distribution — port verbatim de pro-suivi-reclamations.jsx (ProSuivi).
//
// Données via BulletinsService.lister(ctx, {periode}) — TYPE BulletinResume,
// sans montant. L'invariant CLAUDE.md « net jamais en liste » est porté par
// le type : l'écran n'a accès à aucun champ brut/cnps/its/net.
//
// Pas de graphique sur cet écran → recharts N'est PAS importé. Tout le poids
// reste dans le chunk dashboard ou réclamations/statistiques.

import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  Select,
  StatusPill,
  STATUS_STYLES,
  Table,
} from '@pli/ui';
import type { Salarie } from '@pli/types';
import {
  creerBulletinsServiceMock,
  creerSalariesServiceMock,
  type BulletinResume,
  type ContexteEntreprise,
} from '../../services/index.js';
import { ProPageHeader } from './_page-header.js';

// ─── Contexte tenant — TODO(phase-1) wirer à AuthService.contexteCourant() ──
const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

const PERIODES = [
  { id: '2026-02', libelle: 'Février 2026' },
  { id: '2026-01', libelle: 'Janvier 2026' },
  { id: '2025-12', libelle: 'Décembre 2025' },
  { id: '2025-11', libelle: 'Novembre 2025' },
];

interface LigneNonConsulte {
  bulletin: BulletinResume;
  salarie: Salarie | null;
}

interface LigneSignature {
  bulletin: BulletinResume;
  salarie: Salarie | null;
}

export function ProSuivi() {
  const [periode, setPeriode] = useState('2026-02');
  const [bulletins, setBulletins] = useState<BulletinResume[]>([]);
  const [salariesParId, setSalariesParId] = useState<Record<string, Salarie>>({});

  useEffect(() => {
    const services = {
      bulletins: creerBulletinsServiceMock(),
      salaries: creerSalariesServiceMock(),
    };
    void (async () => {
      const liste = await services.bulletins.lister(CONTEXTE_PRO, { periode });
      setBulletins(liste);
      const ids = Array.from(new Set(liste.map((b) => b.salarieId)));
      const fetched = await Promise.all(
        ids.map(async (id) => [id, await services.salaries.obtenir(CONTEXTE_PRO, id)] as const),
      );
      const map: Record<string, Salarie> = {};
      for (const [id, s] of fetched) if (s) map[id] = s;
      setSalariesParId(map);
    })();
  }, [periode]);

  const distribues = useMemo(
    () => bulletins.filter((b) => b.statutRemise === 'distribue'),
    [bulletins],
  );
  const consultes = useMemo(
    () => distribues.filter((b) => b.statutConsultation === 'consulte'),
    [distribues],
  );
  const nonConsultes = useMemo(
    () => distribues.filter((b) => b.statutConsultation === 'non_consulte'),
    [distribues],
  );
  const signes = useMemo(
    () => distribues.filter((b) => b.statutSignature === 'signe'),
    [distribues],
  );
  const aSigner = useMemo(
    () => distribues.filter((b) => b.statutSignature === 'requis_non_signe'),
    [distribues],
  );
  const taux = Math.round((consultes.length / Math.max(1, distribues.length)) * 100);

  const lignesNonConsultes: LigneNonConsulte[] = nonConsultes.map((b) => ({
    bulletin: b,
    salarie: salariesParId[b.salarieId] ?? null,
  }));
  const lignesSignatures: LigneSignature[] = [...signes, ...aSigner].map((b) => ({
    bulletin: b,
    salarie: salariesParId[b.salarieId] ?? null,
  }));

  return (
    <>
      <ProPageHeader
        title="Suivi de la distribution"
        subtitle="Vue détaillée des consultations et signatures par période."
        actions={
          <Select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            options={PERIODES.map((p) => ({ value: p.id, label: p.libelle }))}
            icon="CalendarRange"
          />
        }
      />

      <div className="p-8 space-y-6">
        {/* Vue d'ensemble du taux */}
        <Card padding="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-center">
            <div className="text-center lg:text-left">
              <div
                className="text-[12px] uppercase tracking-wide text-texte-secondaire"
                style={{ letterSpacing: '.06em' }}
              >
                Taux de consultation
              </div>
              <div className="text-[56px] font-semibold text-encre leading-none mt-2 tabular-nums">
                {taux}
                <span className="text-[28px] text-texte-secondaire">%</span>
              </div>
              <div className="text-[13px] text-texte-secondaire mt-1">
                {consultes.length} sur {distribues.length} bulletins consultés
              </div>
              <div className="mt-4">
                <ProgressBar value={taux} max={100} tone="succes" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-papier p-3 border border-bordure">
                <div
                  className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                  style={{ letterSpacing: '.05em' }}
                >
                  Distribués
                </div>
                <div className="text-[22px] font-semibold text-encre tabular-nums">
                  {distribues.length}
                </div>
              </div>
              <div
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: STATUS_STYLES.succes.bg,
                  borderColor: STATUS_STYLES.succes.border,
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-wide"
                  style={{ letterSpacing: '.05em', color: STATUS_STYLES.succes.fg }}
                >
                  Consultés
                </div>
                <div
                  className="text-[22px] font-semibold tabular-nums"
                  style={{ color: STATUS_STYLES.succes.fg }}
                >
                  {consultes.length}
                </div>
              </div>
              <div
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: STATUS_STYLES.attente.bg,
                  borderColor: STATUS_STYLES.attente.border,
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-wide"
                  style={{ letterSpacing: '.05em', color: STATUS_STYLES.attente.fg }}
                >
                  Non consultés
                </div>
                <div
                  className="text-[22px] font-semibold tabular-nums"
                  style={{ color: STATUS_STYLES.attente.fg }}
                >
                  {nonConsultes.length}
                </div>
              </div>
              <div
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: STATUS_STYLES.info.bg,
                  borderColor: STATUS_STYLES.info.border,
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-wide"
                  style={{ letterSpacing: '.05em', color: STATUS_STYLES.info.fg }}
                >
                  Signés
                </div>
                <div
                  className="text-[22px] font-semibold tabular-nums"
                  style={{ color: STATUS_STYLES.info.fg }}
                >
                  {signes.length}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Non-consultés à relancer */}
        <Card padding="p-0">
          <div className="p-5 border-b border-bordure flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-[16px] font-semibold text-encre">
                Non-consultés — à relancer
              </h2>
              <p className="text-[13px] text-texte-secondaire">
                {nonConsultes.length} salariés n'ont pas encore consulté leur bulletin.
              </p>
            </div>
            <Button variant="primary" icon="BellRing" disabled={nonConsultes.length === 0}>
              Relancer tous ({nonConsultes.length})
            </Button>
          </div>
          {nonConsultes.length === 0 ? (
            <EmptyState
              icon="CircleCheckBig"
              title="Tout le monde a consulté"
              description="Aucun salarié à relancer pour cette période."
            />
          ) : (
            <Table<LigneNonConsulte>
              dense
              columns={[
                {
                  label: 'Salarié',
                  render: (r) => (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.salarie?.nom ?? ''} size={28} />
                      <div>
                        <div className="font-medium">{r.salarie?.nom ?? '—'}</div>
                        <div className="text-[12px] text-texte-secondaire">
                          {r.salarie?.email}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  label: 'Matricule',
                  width: 130,
                  render: (r) => (
                    <span className="font-mono text-[12.5px]">{r.salarie?.matricule}</span>
                  ),
                },
                {
                  label: 'Service',
                  width: 160,
                  render: (r) => r.salarie?.service,
                },
                {
                  label: 'Distribué le',
                  width: 140,
                  render: (r) => (
                    <span className="text-texte-secondaire tabular-nums">
                      {r.bulletin.dateRemise ?? '—'}
                    </span>
                  ),
                },
                {
                  label: 'Relances',
                  width: 100,
                  render: () => <span className="text-texte-secondaire">0</span>,
                },
                {
                  label: '',
                  width: 130,
                  render: () => (
                    <Button variant="secondary" size="sm" icon="BellRing">
                      Relancer
                    </Button>
                  ),
                },
              ]}
              data={lignesNonConsultes}
            />
          )}
        </Card>

        {/* Historique des signatures */}
        <Card padding="p-0">
          <div className="p-5 border-b border-bordure">
            <h2 className="text-[16px] font-semibold text-encre">
              Historique des signatures
            </h2>
            <p className="text-[13px] text-texte-secondaire">
              {signes.length} bulletins signés sur la période · {aSigner.length} en attente
              de signature
            </p>
          </div>
          {signes.length === 0 && aSigner.length === 0 ? (
            <EmptyState
              icon="PenLine"
              title="Aucune signature requise"
              description="Les bulletins de cette période ne nécessitent pas de signature."
            />
          ) : (
            <Table<LigneSignature>
              dense
              columns={[
                {
                  label: 'Salarié',
                  render: (r) => (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.salarie?.nom ?? ''} size={28} />
                      <span className="font-medium">{r.salarie?.nom ?? '—'}</span>
                    </div>
                  ),
                },
                {
                  label: 'Statut',
                  width: 160,
                  render: (r) =>
                    r.bulletin.statutSignature === 'signe' ? (
                      <StatusPill tone="succes" size="sm" icon="BadgeCheck">
                        Signé
                      </StatusPill>
                    ) : (
                      <StatusPill tone="attente" size="sm" icon="Clock">
                        En attente
                      </StatusPill>
                    ),
                },
                {
                  label: 'Date de signature',
                  width: 200,
                  render: (r) =>
                    r.bulletin.dateSignature ?? (
                      <span className="text-texte-secondaire">—</span>
                    ),
                },
                {
                  label: 'Certificat',
                  width: 200,
                  render: (r) =>
                    r.bulletin.statutSignature === 'signe' ? (
                      <span className="font-mono text-[12px] text-texte-secondaire">
                        PLI-{r.bulletin.id.slice(-8).toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-texte-secondaire">—</span>
                    ),
                },
              ]}
              data={lignesSignatures}
            />
          )}
        </Card>
      </div>
    </>
  );
}
