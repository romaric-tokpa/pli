// CabinetGestionnaires — utilisateurs du cabinet (sub-lot 11c).
//
// Porté de _wireframe/src/cabinet-screens.jsx (CabinetGestionnaires).
//
// CLOISONNEMENT (vérifié par `suiteContratCloisonnementCabinet`) : la liste
// retournée par `listerGestionnaires(ctx)` est scopée au cabinet courant.
// Une URL ne peut pas remonter les gestionnaires d'un autre cabinet.
// `obtenirGestionnaire(ctx, idAutreCabinet)` renvoie `null`.
//
// RÔLES & PERMISSIONS — la table distingue `responsable` (accès total à
// toutes les entreprises du portefeuille) et `gestionnaire` (sous-ensemble
// d'affectations explicites). En Phase 1, ces affectations seront vérifiées
// côté serveur à chaque appel — le mock les expose en lecture.

import { useEffect, useMemo, useState } from 'react';
import type { Cabinet, Entreprise, GestionnaireCabinet } from '@pli/types';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Icon,
  Modal,
  Select,
  StatusPill,
  Table,
  TextField,
  useToast,
} from '@pli/ui';
import {
  creerCabinetsServiceMock,
  type ContextePortefeuilleCabinet,
} from '../../services/index.js';
import { CabinetPageHeader } from './_page-header.js';

// TODO(phase-1) — voir _layout.tsx
const CONTEXTE_DEMO: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: 'cab-ebrie',
};

export function CabinetGestionnaires() {
  const services = useMemo(() => ({ cabinets: creerCabinetsServiceMock() }), []);
  const pousser = useToast();

  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [gestionnaires, setGestionnaires] = useState<GestionnaireCabinet[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);

  const [showInviter, setShowInviter] = useState(false);
  const [editAffect, setEditAffect] = useState<GestionnaireCabinet | null>(null);

  useEffect(() => {
    void (async () => {
      const [cab, gests, port] = await Promise.all([
        services.cabinets.obtenirCabinet(CONTEXTE_DEMO),
        services.cabinets.listerGestionnaires(CONTEXTE_DEMO),
        services.cabinets.obtenirPortefeuille(CONTEXTE_DEMO),
      ]);
      setCabinet(cab);
      setGestionnaires(gests);
      setEntreprises(port);
    })();
  }, [services]);

  const domaineCabinet = cabinet?.email.split('@')[1] ?? 'cabinet.ci';

  return (
    <>
      <CabinetPageHeader
        title="Gestionnaires"
        subtitle={
          cabinet
            ? `${gestionnaires.length} utilisateurs · accès au portefeuille ${cabinet.nom}`
            : '—'
        }
        actions={
          <Button variant="primary" icon="UserPlus" onClick={() => setShowInviter(true)}>
            Inviter un gestionnaire
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        <Card padding="p-4" bg="bg-papier" className="border-bordure">
          <div className="flex items-start gap-3 text-[12.5px] text-texte-secondaire">
            <Icon name="Info" size={14} className="text-info shrink-0 mt-0.5" />
            <div>
              Le <strong className="text-encre">responsable</strong> gère le portefeuille
              et les affectations. Les{' '}
              <strong className="text-encre">gestionnaires</strong> opèrent uniquement les
              entreprises qui leur sont affectées. Une seule connexion par utilisateur —
              contrairement aux entreprises autonomes (limitées à un seul compte), un
              cabinet peut avoir plusieurs gestionnaires.
            </div>
          </div>
        </Card>

        <Card padding="p-0">
          <Table
            columns={[
              {
                label: 'Gestionnaire',
                render: (r) => (
                  <div className="flex items-center gap-2.5">
                    <Avatar name={r.nom} size={32} />
                    <div>
                      <div className="font-medium text-encre">{r.nom}</div>
                      <div className="text-[12px] text-texte-secondaire">{r.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                label: 'Rôle',
                width: 160,
                render: (r) => (
                  <span
                    className={`inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded font-medium ${
                      r.role === 'responsable'
                        ? 'bg-cachet/15 text-cachet'
                        : 'bg-surface text-encre'
                    }`}
                  >
                    <Icon name={r.role === 'responsable' ? 'UserCog' : 'User'} size={11} />
                    {r.role === 'responsable' ? 'Responsable' : 'Gestionnaire'}
                  </span>
                ),
              },
              {
                label: 'Entreprises affectées',
                render: (r) => (
                  <div className="flex flex-wrap gap-1">
                    {r.role === 'responsable' ? (
                      <span className="text-[11.5px] text-texte-secondaire italic">
                        Toutes les entreprises ({entreprises.length})
                      </span>
                    ) : (
                      <>
                        {r.entreprisesAffectees.slice(0, 3).map((eid) => {
                          const e = entreprises.find((x) => x.id === eid);
                          return (
                            <span
                              key={eid}
                              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-surface text-encre"
                            >
                              {e?.nom ?? eid}
                            </span>
                          );
                        })}
                        {r.entreprisesAffectees.length > 3 && (
                          <span className="text-[11px] text-texte-secondaire">
                            +{r.entreprisesAffectees.length - 3}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ),
              },
              {
                label: '2FA',
                width: 100,
                render: (r) =>
                  r.a2f ? (
                    <StatusPill tone="succes" size="sm">
                      Activée
                    </StatusPill>
                  ) : (
                    <StatusPill tone="attente" size="sm">
                      Désactivée
                    </StatusPill>
                  ),
              },
              {
                label: 'Dernière connexion',
                width: 180,
                render: (r) => (
                  <span className="text-texte-secondaire tabular-nums">
                    {r.derniereConnexion}
                  </span>
                ),
              },
              {
                label: '',
                width: 150,
                render: (r) =>
                  r.role === 'gestionnaire' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="UserCog"
                      onClick={() => setEditAffect(r)}
                    >
                      Affectations
                    </Button>
                  ) : (
                    <span className="text-[11px] text-texte-secondaire italic">
                      Accès total
                    </span>
                  ),
              },
            ]}
            data={gestionnaires}
          />
        </Card>
      </div>

      <Modal
        open={showInviter}
        onClose={() => setShowInviter(false)}
        title="Inviter un gestionnaire"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowInviter(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon="Send"
              onClick={() => {
                setShowInviter(false);
                pousser({ message: 'Invitation envoyée', tone: 'succes' });
              }}
            >
              Envoyer l'invitation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField label="Nom complet" placeholder="Ex. Aïcha Bamba" value="" onChange={() => {}} />
          <TextField
            label="E-mail"
            type="email"
            icon="Mail"
            placeholder={`prenom@${domaineCabinet}`}
            value=""
            onChange={() => {}}
          />
          <Select
            label="Rôle"
            value=""
            onChange={() => {}}
            placeholder="Sélectionner…"
            options={[
              { value: 'responsable', label: 'Responsable (accès complet)' },
              { value: 'gestionnaire', label: 'Gestionnaire (affectations limitées)' },
            ]}
          />
          <div>
            <div className="block text-[13px] font-medium text-encre mb-1.5">
              Entreprises affectées (gestionnaire)
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto rounded-md border border-bordure p-2">
              {entreprises.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-2 py-1 px-1 hover:bg-surface/50 rounded"
                >
                  <Checkbox checked={false} onChange={() => {}} label={e.nom} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editAffect}
        onClose={() => setEditAffect(null)}
        title={editAffect ? `Affectations de ${editAffect.nom}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditAffect(null)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon="Check"
              onClick={() => {
                setEditAffect(null);
                pousser({ message: 'Affectations mises à jour', tone: 'succes' });
              }}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        {editAffect && (
          <div className="space-y-3">
            <p className="text-[13px] text-texte-secondaire">
              Cochez les entreprises sur lesquelles ce gestionnaire peut opérer. Toute
              entreprise hors de cette liste reste invisible, conformément au cloisonnement
              du portefeuille.
            </p>
            <div className="space-y-1 rounded-md border border-bordure p-2">
              {entreprises.map((e) => {
                const checked = editAffect.entreprisesAffectees.includes(e.id);
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 py-2 px-2 hover:bg-surface/50 rounded"
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() => {}}
                      label={
                        <span className="flex-1">
                          <span className="block text-[13.5px] text-encre">{e.nom}</span>
                          <span className="block text-[11.5px] text-texte-secondaire">
                            {e.secteur ?? '—'} · {e.effectif ?? 0} salariés
                          </span>
                        </span>
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
