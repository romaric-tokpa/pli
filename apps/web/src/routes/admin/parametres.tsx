// AdminParametres — paramètres plateforme (sub-lot 12d).
// Porté de _wireframe/src/admin-ops.jsx (AdminParametres).
//
// Action sensible journalisée : « Bascule d'intégration » (Wave / Orange Money
// / connecteurs SIRH) → audit type `module`.

import { useEffect, useMemo, useState } from 'react';
import type { ParametresPlateforme } from '@pli/types';
import {
  Button,
  Card,
  Icon,
  StatusPill,
  Switch,
  TextField,
  useToast,
  type IconName,
} from '@pli/ui';
import { creerAdminServiceMock, type ContexteAdmin } from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

export function AdminParametres() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);
  const pousser = useToast();

  const [params, setParams] = useState<ParametresPlateforme | null>(null);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void (async () => {
      const p = await services.admin.obtenirParametresPlateforme(CONTEXTE_DEMO);
      setParams(p);
    })();
  }, [services]);

  if (!params) {
    return (
      <>
        <AdminPageHeader title="Paramètres plateforme" />
        <div className="p-12">
          <Card padding="p-6">
            <div className="h-6 w-48 bg-surface rounded animate-pulse" />
          </Card>
        </div>
      </>
    );
  }

  const basculer = async (id: string, actuel: boolean) => {
    const nouvel = !actuel;
    setOverrides((o) => ({ ...o, [id]: nouvel }));
    await services.admin.basculerIntegration(CONTEXTE_DEMO, id, nouvel);
    pousser({
      message: `Intégration ${nouvel ? 'activée' : 'désactivée'}`,
      tone: 'succes',
    });
  };

  const estActif = (id: string, defaut: boolean): boolean =>
    overrides[id] ?? defaut;

  return (
    <>
      <AdminPageHeader
        title="Paramètres plateforme"
        subtitle="Branding, domaines, intégrations, clés API et webhooks"
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Branding par défaut</h2>
            <p className="text-[13px] text-texte-secondaire mb-5">
              Apparence proposée aux entreprises clientes lors de leur inscription.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Nom de la plateforme"
                value={params.brandingNom}
                onChange={() => {}}
              />
              <TextField
                label="Couleur primaire (hex)"
                value={params.couleurPrimaire}
                onChange={() => {}}
              />
              <TextField
                label="Couleur d'accent (hex)"
                value={params.couleurAccent}
                onChange={() => {}}
              />
              <TextField
                label="Police par défaut"
                value={params.policeDefault}
                onChange={() => {}}
              />
            </div>
          </Card>

          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Domaines</h2>
            <div className="mt-4 space-y-3">
              {params.domaines.map((d) => (
                <div
                  key={d.domaine}
                  className="flex items-center gap-3 p-3 rounded-md border border-bordure"
                >
                  <Icon name="Globe" size={14} className="text-texte-secondaire" />
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium text-encre font-mono">
                      {d.domaine}
                    </div>
                    <div className="text-[11.5px] text-texte-secondaire">{d.role}</div>
                  </div>
                  <StatusPill tone="succes" size="sm">
                    SSL valide
                  </StatusPill>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Intégrations</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {params.integrations.map((i) => (
                <div
                  key={i.id}
                  className="rounded-md border border-bordure p-4 flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded bg-surface text-encre flex items-center justify-center">
                    <Icon name={i.icone as IconName} size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium text-encre">{i.nom}</div>
                    <div className="text-[11.5px] text-texte-secondaire">
                      {i.description}
                    </div>
                  </div>
                  <Switch
                    checked={estActif(i.id, i.actif)}
                    onChange={() => basculer(i.id, estActif(i.id, i.actif))}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Clés API</h2>
            <p className="text-[12.5px] text-texte-secondaire">
              Clés utilisées par les intégrations partenaires.
            </p>
            <div className="mt-4 space-y-2.5">
              {params.clesApi.map((c) => (
                <div key={c.environnement} className="rounded-md border border-bordure p-3">
                  <div className="text-[11.5px] text-texte-secondaire">
                    {c.environnement}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-[12px] text-encre">{c.cle}</span>
                    <button
                      type="button"
                      className="ml-auto text-[11.5px] text-encre hover:underline"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              icon="RefreshCw"
              className="mt-3"
            >
              Régénérer les clés
            </Button>
          </Card>

          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Webhooks</h2>
            <p className="text-[12.5px] text-texte-secondaire">
              Notifications HTTP sortantes vers vos systèmes.
            </p>
            <div className="mt-4 space-y-2.5">
              {params.webhooks.map((w) => (
                <div key={w.evenement} className="rounded-md border border-bordure p-3">
                  <div className="text-[12px] font-medium text-encre font-mono">
                    {w.evenement}
                  </div>
                  <div className="text-[11px] text-texte-secondaire font-mono mt-0.5 truncate">
                    {w.url}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
