// Sécurité Pli Pro — port verbatim de pro-facturation-securite.jsx (ProSecurite).
//
// Toutes les données passent par SecuriteService (tenant-scopé). L'invariant
// « max 2 sessions Pro » est porté côté service (slice(0,2)) — l'écran rend
// ce qu'il reçoit. Le journal est en lecture seule (append-only).

import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Icon,
  SearchField,
  Select,
  StatusPill,
  Switch,
  Table,
  Tabs,
  type IconName,
  type StatusTone,
} from '@pli/ui';
import type {
  EntreeAudit,
  ParametresAuthentification,
  Session,
  TypeEntreeAudit,
} from '@pli/types';
import {
  creerSecuriteServiceMock,
  type ContexteEntreprise,
} from '../../services/index.js';
import { ProPageHeader } from './_page-header.js';

const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

const MAX_SESSIONS_PRO = 2;

type OngletSecurite = 'authentification' | 'sessions' | 'audit';

const STYLE_AUDIT: Record<TypeEntreeAudit, { tone: StatusTone; libelle: string }> = {
  connexion: { tone: 'info', libelle: 'Connexion' },
  distribution: { tone: 'succes', libelle: 'Distribution' },
  modification: { tone: 'neutre', libelle: 'Modification' },
  upload: { tone: 'info', libelle: 'Upload' },
  reclamation: { tone: 'attente', libelle: 'Réclamation' },
  creation: { tone: 'succes', libelle: 'Création' },
  securite: { tone: 'erreur', libelle: 'Sécurité' },
  export: { tone: 'neutre', libelle: 'Export' },
};

export function ProSecurite() {
  const services = useMemo(() => ({ securite: creerSecuriteServiceMock() }), []);
  const [tab, setTab] = useState<OngletSecurite>('authentification');
  const [params, setParams] = useState<ParametresAuthentification | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [journal, setJournal] = useState<EntreeAudit[]>([]);
  const [filtreAudit, setFiltreAudit] = useState('');

  useEffect(() => {
    void (async () => {
      const [p, s, j] = await Promise.all([
        services.securite.obtenirParametres(CONTEXTE_PRO),
        services.securite.obtenirSessions(CONTEXTE_PRO),
        services.securite.listerJournal(CONTEXTE_PRO),
      ]);
      setParams(p);
      setSessions(s);
      setJournal(j);
    })();
  }, [services]);

  async function basculerA2F(next: boolean) {
    const res = await services.securite.basculerA2F(CONTEXTE_PRO, next);
    if (res.ok) setParams((p) => (p ? { ...p, a2f: res.a2f } : p));
  }

  async function deconnecterSession(id: string) {
    const res = await services.securite.deconnecterSession(CONTEXTE_PRO, id);
    if (res.ok) setSessions((s) => s.filter((x) => x.id !== id));
  }

  async function deconnecterAutres() {
    await services.securite.deconnecterAutresSessions(CONTEXTE_PRO);
    const next = await services.securite.obtenirSessions(CONTEXTE_PRO);
    setSessions(next);
  }

  const journalFiltre = journal.filter((l) => {
    if (!filtreAudit.trim()) return true;
    const aig = filtreAudit.toLowerCase();
    return (
      l.action.toLowerCase().includes(aig) ||
      l.utilisateur.toLowerCase().includes(aig)
    );
  });

  const sessionsRendues = sessions.slice(0, MAX_SESSIONS_PRO);
  const a2f = params?.a2f ?? false;

  return (
    <>
      <ProPageHeader
        title="Sécurité"
        subtitle="Authentification, sessions, journal d'audit et permissions."
      />

      <div className="p-8 space-y-6">
        <Card padding="p-0">
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as OngletSecurite)}
            className="px-5"
            tabs={[
              {
                value: 'authentification',
                label: 'Authentification',
                icon: 'ShieldCheck' as IconName,
              },
              {
                value: 'sessions',
                label: 'Sessions actives',
                icon: 'MonitorSmartphone' as IconName,
                count: sessionsRendues.length,
              },
              {
                value: 'audit',
                label: "Journal d'audit",
                icon: 'ScrollText' as IconName,
              },
            ]}
          />
          <div className="p-6">
            {tab === 'authentification' && params && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
                <div className="rounded-lg border border-bordure p-5">
                  <div className="flex items-center gap-2.5">
                    <Icon name="ShieldCheck" size={18} className="text-encre" />
                    <h3 className="text-[15px] font-semibold text-encre">
                      Double authentification (2FA)
                    </h3>
                    {a2f && (
                      <StatusPill tone="succes" size="sm">
                        Activée
                      </StatusPill>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] text-texte-secondaire">
                    Une étape de vérification supplémentaire par code à 6 chiffres protège votre
                    compte en cas de mot de passe compromis.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Switch
                      checked={a2f}
                      onChange={basculerA2F}
                      label={
                        a2f ? 'Activée pour tous les administrateurs' : 'Désactivée'
                      }
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-bordure p-5">
                  <div className="flex items-center gap-2.5">
                    <Icon name="KeyRound" size={18} className="text-encre" />
                    <h3 className="text-[15px] font-semibold text-encre">Mot de passe</h3>
                  </div>
                  <p className="mt-2 text-[13px] text-texte-secondaire">
                    Dernière modification : {params.dernierChangementMotDePasse}. Nous
                    recommandons de changer votre mot de passe tous les 90 jours.
                  </p>
                  <div className="mt-4">
                    <Button variant="secondary" icon="KeyRound">
                      Changer le mot de passe
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-bordure p-5">
                  <div className="flex items-center gap-2.5">
                    <Icon name="Globe" size={18} className="text-encre" />
                    <h3 className="text-[15px] font-semibold text-encre">
                      Restrictions d'accès
                    </h3>
                  </div>
                  <p className="mt-2 text-[13px] text-texte-secondaire">
                    Limitez l'accès à votre back-office par adresse IP ou par plage horaire.
                  </p>
                  <div className="mt-4 space-y-2.5">
                    <Switch
                      checked={params.restrictionIP}
                      onChange={() => {}}
                      label="Limiter par adresse IP"
                      hint="Aucune restriction active"
                    />
                    <Switch
                      checked={params.restrictionHoraire}
                      onChange={() => {}}
                      label="Limiter par plage horaire"
                      hint="6h–20h, lundi à samedi"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-bordure p-5">
                  <div className="flex items-center gap-2.5">
                    <Icon name="MailCheck" size={18} className="text-encre" />
                    <h3 className="text-[15px] font-semibold text-encre">
                      Alertes de sécurité
                    </h3>
                  </div>
                  <p className="mt-2 text-[13px] text-texte-secondaire">
                    Recevez un e-mail à chaque connexion depuis un nouvel appareil ou nouvelle
                    ville.
                  </p>
                  <div className="mt-4">
                    <Switch
                      checked={params.alertesSecurite}
                      onChange={() => {}}
                      label="Activées"
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === 'sessions' && (
              <div className="space-y-3 max-w-3xl">
                <div className="rounded-md bg-papier border border-bordure p-3 flex items-start gap-3 text-[12.5px]">
                  <Icon name="Info" size={14} className="text-info shrink-0 mt-0.5" />
                  <div className="text-texte-secondaire">
                    <strong className="text-encre">Compte administrateur unique.</strong> Chaque
                    entreprise dispose d'un seul compte.{' '}
                    <strong className="text-encre">
                      Maximum 2 sessions actives simultanément
                    </strong>{' '}
                    : ouvrir une 3e session déconnectera automatiquement la plus ancienne.
                  </div>
                </div>
                <div className="text-[13px] text-texte-secondaire">
                  {sessionsRendues.length} session
                  {sessionsRendues.length > 1 ? 's' : ''} active
                  {sessionsRendues.length > 1 ? 's' : ''} sur {MAX_SESSIONS_PRO} autorisées.
                </div>
                {sessionsRendues.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-bordure p-4 flex items-center gap-4"
                  >
                    <div className="h-10 w-10 rounded-md bg-surface flex items-center justify-center text-encre">
                      <Icon name={s.icon as IconName} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-[14px] font-medium text-encre">
                          {s.appareil}
                        </div>
                        {s.actuel && (
                          <StatusPill tone="succes" size="sm">
                            Session en cours
                          </StatusPill>
                        )}
                      </div>
                      <div className="text-[12px] text-texte-secondaire">
                        {s.lieu} · {s.derniereActivite}
                      </div>
                    </div>
                    {!s.actuel && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="LogOut"
                        onClick={() => deconnecterSession(s.id)}
                      >
                        Déconnecter
                      </Button>
                    )}
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="danger" icon="LogOut" onClick={deconnecterAutres}>
                    Déconnecter toutes les autres sessions
                  </Button>
                </div>
              </div>
            )}

            {tab === 'audit' && (
              <div className="space-y-4">
                <div className="rounded-lg border border-encre/20 bg-encre/5 p-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-encre text-white flex items-center justify-center shrink-0">
                    <Icon name="ShieldCheck" size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-encre flex items-center gap-2 flex-wrap">
                      Journal d'audit scellé
                      <StatusPill tone="succes" size="sm" icon="Lock">
                        Append-only
                      </StatusPill>
                    </div>
                    <p className="text-[12.5px] text-texte-secondaire mt-0.5">
                      Chaque action (distribution, accusé de réception, validation horodatée)
                      est inscrite de façon{' '}
                      <strong className="text-encre">immuable et horodatée</strong>. Le journal
                      ne peut être ni modifié ni effacé — c'est votre élément de preuve en cas
                      de litige.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[240px] max-w-md">
                    <SearchField
                      value={filtreAudit}
                      onChange={(e) => setFiltreAudit(e.target.value)}
                      placeholder="Filtrer le journal…"
                      size="sm"
                    />
                  </div>
                  <Select
                    size="sm"
                    value=""
                    onChange={() => {}}
                    placeholder="Tous les types"
                    icon="SlidersHorizontal"
                    options={[
                      { value: 'connexion', label: 'Connexion' },
                      { value: 'distribution', label: 'Distribution' },
                      { value: 'modification', label: 'Modification' },
                      { value: 'securite', label: 'Sécurité' },
                    ]}
                  />
                  <Button variant="secondary" size="sm" icon="Download">
                    Exporter
                  </Button>
                </div>
                <Table<EntreeAudit>
                  dense
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
                      label: 'Utilisateur',
                      width: 160,
                      render: (r) =>
                        r.utilisateur === 'Système' ? (
                          <span className="text-texte-secondaire italic">Système</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Avatar name={r.utilisateur} size={22} />
                            <span>{r.utilisateur}</span>
                          </div>
                        ),
                    },
                    { label: 'Action', render: (r) => r.action },
                    {
                      label: 'IP',
                      width: 140,
                      render: (r) => (
                        <span className="font-mono text-[12px] text-texte-secondaire">
                          {r.ip}
                        </span>
                      ),
                    },
                    {
                      label: 'Type',
                      width: 130,
                      render: (r) => {
                        const sty = STYLE_AUDIT[r.type];
                        return (
                          <StatusPill tone={sty.tone} size="sm">
                            {sty.libelle}
                          </StatusPill>
                        );
                      },
                    },
                  ]}
                  data={journalFiltre}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
