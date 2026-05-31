// AdminAudit — journal d'audit append-only (sub-lot 12c).
//
// CONTRAT (CLAUDE.md « audit append-only chaîné par hash ») :
//   - Lecture seule depuis l'UI : aucun bouton de modification/suppression.
//   - L'AdminService n'expose AUCUNE méthode `supprimerEntreeAudit` (vérifié
//     au compilateur : si elle apparaît un jour, le TS rappellera).
//   - Le journal montre TOUTES les actions sensibles posées via les méthodes
//     d'AdminService (impersonation, suspension, plan, …), dans l'ordre
//     descendant (plus récent d'abord).
//   - Test e2e `audit-impersonation-e2e.test.ts` : appel à
//     `impersonnerEntreprise(ctx, 'atlantique')` → entrée lisible avec date,
//     acteur, cible, IP, type=`impersonation`.

import { useEffect, useMemo, useState } from 'react';
import type { EntreeAuditAdmin, TypeAuditAdmin } from '@pli/types';
import {
  Avatar,
  Button,
  Card,
  SearchField,
  Select,
  StatusPill,
  Table,
  type StatusTone,
} from '@pli/ui';
import { creerAdminServiceMock, type ContexteAdmin } from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

const MAP_TYPE: Record<TypeAuditAdmin, { tone: StatusTone; libelle: string }> = {
  impersonation: { tone: 'erreur', libelle: 'Impersonation' },
  suspension: { tone: 'erreur', libelle: 'Suspension' },
  plan: { tone: 'info', libelle: 'Plan' },
  module: { tone: 'info', libelle: 'Module' },
  donnees: { tone: 'attente', libelle: 'Accès données' },
  connexion: { tone: 'neutre', libelle: 'Connexion' },
  communication: { tone: 'neutre', libelle: 'Communication' },
  support: { tone: 'neutre', libelle: 'Support' },
};

export function AdminAudit() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);

  const [entrees, setEntrees] = useState<EntreeAuditAdmin[]>([]);
  const [recherche, setRecherche] = useState('');
  const [filtreType, setFiltreType] = useState<'' | TypeAuditAdmin>('');

  useEffect(() => {
    void (async () => {
      const j = await services.admin.listerJournalAdmin(CONTEXTE_DEMO);
      setEntrees(j);
    })();
  }, [services]);

  const filtrees = useMemo(() => {
    return entrees.filter((e) => {
      if (
        recherche &&
        !`${e.acteur} ${e.cible} ${e.action}`.toLowerCase().includes(recherche.toLowerCase())
      )
        return false;
      if (filtreType && e.type !== filtreType) return false;
      return true;
    });
  }, [entrees, recherche, filtreType]);

  return (
    <>
      <AdminPageHeader
        title="Journal d'audit"
        subtitle="Trace de toutes les actions sensibles effectuées dans la console opérateur — append-only, lecture seule."
        actions={
          <Button variant="secondary" icon="Download">
            Exporter le journal
          </Button>
        }
      />

      <div className="p-8 space-y-4">
        <Card padding="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[260px]">
              <SearchField
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher acteur, cible, action…"
              />
            </div>
            <Select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value as '' | TypeAuditAdmin)}
              placeholder="Tous les types"
              icon="SlidersHorizontal"
              className="min-w-[220px]"
              options={[
                { value: 'impersonation', label: 'Impersonation' },
                { value: 'suspension', label: 'Suspension' },
                { value: 'plan', label: 'Changement de plan' },
                { value: 'module', label: 'Activation de module' },
                { value: 'donnees', label: 'Accès données' },
                { value: 'connexion', label: 'Connexion' },
                { value: 'communication', label: 'Communication' },
                { value: 'support', label: 'Support' },
              ]}
            />
            <div className="ml-auto text-[12px] text-texte-secondaire">
              {filtrees.length} entrée{filtrees.length > 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        <Card padding="p-0">
          <Table
            columns={[
              {
                label: 'Date',
                width: 170,
                render: (r) => (
                  <span className="font-mono text-[12px] text-texte-secondaire">
                    {r.date}
                  </span>
                ),
              },
              {
                label: 'Acteur',
                width: 200,
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <Avatar name={r.acteur} size={24} />
                    <span>{r.acteur}</span>
                  </div>
                ),
              },
              { label: 'Action', render: (r) => r.action },
              {
                label: 'Cible',
                width: 220,
                render: (r) => <span className="text-texte-secondaire">{r.cible}</span>,
              },
              {
                label: 'IP',
                width: 140,
                render: (r) => (
                  <span className="font-mono text-[12px] text-texte-secondaire">{r.ip}</span>
                ),
              },
              {
                label: 'Type',
                width: 170,
                render: (r) => {
                  const m = MAP_TYPE[r.type];
                  return (
                    <StatusPill tone={m.tone} size="sm">
                      {m.libelle}
                    </StatusPill>
                  );
                },
              },
            ]}
            data={filtrees}
          />
        </Card>
      </div>
    </>
  );
}
