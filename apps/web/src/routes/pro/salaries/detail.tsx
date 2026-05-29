// ProSalarieDetail — fiche d'un salarié.
//
// Projection canonique (cf. types/salarie.ts) : Salarie = vue côté employeur
// d'un Rattachement. L'onglet "Historique bulletins" passe par
// BulletinsService.lister({ salarieId }) — le filtrage est BORNÉ au tenant
// du contexte (invariant CLAUDE.md). Les bulletins listés sont des
// `BulletinResume` (sans montants — invariant net jamais en liste).

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Icon,
  IconButton,
  Modal,
  Select,
  StatusPill,
  Tabs,
  TextField,
  useToast,
  type StatusTone,
} from '@pli/ui';
import type { Salarie, StatutSalarie } from '@pli/types';
import {
  creerBulletinsServiceMock,
  creerSalariesServiceMock,
  type BulletinResume,
  type ContexteEntreprise,
} from '../../../services/index.js';
import { ProPageHeader } from '../_page-header.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant()
const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

const STATUT_PILL: Record<StatutSalarie, { tone: StatusTone; label: string }> = {
  actif: { tone: 'succes', label: 'Actif' },
  invite: { tone: 'info', label: 'Invité' },
  desactive: { tone: 'neutre', label: 'Désactivé' },
};

type OngletFiche = 'infos' | 'bulletins' | 'reclamations';

const MOTIFS_DEPART = [
  { value: 'demission', label: 'Démission' },
  { value: 'licenciement', label: 'Licenciement' },
  { value: 'fin_contrat', label: 'Fin de contrat (CDD/stage)' },
  { value: 'retraite', label: 'Retraite' },
  { value: 'autre', label: 'Autre' },
];

export function ProSalarieDetail() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pousser = useToast();
  const id = params.id ?? '';

  const [salarie, setSalarie] = useState<Salarie | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<OngletFiche>('infos');
  const [bulletins, setBulletins] = useState<BulletinResume[]>([]);
  const [showDepart, setShowDepart] = useState(false);
  const [dateDepart, setDateDepart] = useState('2026-02-28');
  const [motif, setMotif] = useState('');

  useEffect(() => {
    const services = {
      salaries: creerSalariesServiceMock(),
      bulletins: creerBulletinsServiceMock(),
    };
    void (async () => {
      // Projection canonique : on demande au service salaries de résoudre
      // le rattachement par son id côté employeur (= scope tenant).
      const sal = await services.salaries.obtenir(CONTEXTE_PRO, id);
      setSalarie(sal);
      if (sal) {
        // BulletinsService.lister filtré par salarieId — toujours dans le
        // tenant du contexte ; retourne des BulletinResume (sans net).
        const bs = await services.bulletins.lister(CONTEXTE_PRO, { salarieId: sal.id });
        setBulletins(bs);
      }
      setLoading(false);
    })();
  }, [id]);

  const statutPill = useMemo(() => {
    if (!salarie) return null;
    const c = STATUT_PILL[salarie.statut];
    return (
      <StatusPill tone={c.tone} size="sm">
        {c.label}
      </StatusPill>
    );
  }, [salarie]);

  if (loading) {
    return <div className="p-12 text-[13px] text-texte-secondaire">Chargement…</div>;
  }
  if (!salarie) {
    return (
      <div className="p-12">
        <EmptyState
          icon="UserX"
          title="Salarié introuvable"
          action={
            <Button variant="primary" onClick={() => navigate('/pro/salaries')}>
              Retour à la liste
            </Button>
          }
        />
      </div>
    );
  }

  // Aucune réclamation câblée pour ce sub-lot — on porte la structure.
  const reclamationsSalarie: Array<{
    id: string;
    sujet: string;
    type: string;
    dateOuverture: string;
    statut: 'nouvelle' | 'en_cours' | 'resolue';
  }> = [];

  return (
    <>
      <ProPageHeader
        breadcrumbs={[{ label: 'Salariés', href: '/pro/salaries' }, { label: salarie.nom }]}
        title={salarie.nom}
        subtitle={`${salarie.poste} · ${salarie.service}`}
        actions={
          <>
            <Button variant="secondary" icon="BellRing">
              Relancer
            </Button>
            <Button variant="secondary" icon="Mail">
              Envoyer un message
            </Button>
            <Button variant="secondary" icon="UserMinus" onClick={() => setShowDepart(true)}>
              Marquer comme parti
            </Button>
            <Button variant="primary" icon="PenLine">
              Modifier
            </Button>
          </>
        }
      />

      <div className="p-8 space-y-6">
        {/* En-tête fiche */}
        <Card padding="p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <Avatar name={salarie.nom} size={64} />
            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-[20px] font-semibold text-encre">{salarie.nom}</h2>
                {statutPill}
              </div>
              <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5 text-[13px]">
                <div>
                  <span className="text-texte-secondaire">Matricule : </span>
                  <span className="font-mono">{salarie.matricule}</span>
                </div>
                <div>
                  <span className="text-texte-secondaire">Service : </span>
                  {salarie.service}
                </div>
                <div>
                  <span className="text-texte-secondaire">Entrée : </span>
                  {salarie.dateEntree}
                </div>
                <div>
                  <span className="text-texte-secondaire">Dernière consultation : </span>
                  {salarie.derniereConsultation}
                </div>
                <div className="col-span-2">
                  <span className="text-texte-secondaire">E-mail : </span>
                  {salarie.email}
                </div>
                <div className="col-span-2">
                  <span className="text-texte-secondaire">Téléphone : </span>
                  {salarie.telephone}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="p-0">
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as OngletFiche)}
            className="px-5"
            tabs={[
              { value: 'infos', label: 'Informations', icon: 'User' },
              {
                value: 'bulletins',
                label: 'Historique bulletins',
                icon: 'FileText',
                count: bulletins.length,
              },
              {
                value: 'reclamations',
                label: 'Réclamations',
                icon: 'MessageSquareWarning',
                count: reclamationsSalarie.length,
              },
            ]}
          />
          <div className="p-6">
            {tab === 'infos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                {(
                  [
                    [
                      'Identité',
                      [
                        ['Nom complet', salarie.nom],
                        ['Matricule', salarie.matricule],
                        ["Date d'entrée", salarie.dateEntree],
                        ['Poste occupé', salarie.poste],
                      ],
                    ],
                    [
                      'Coordonnées',
                      [
                        ['E-mail professionnel', salarie.email],
                        ['Téléphone', salarie.telephone],
                        ['Service', salarie.service],
                        ['Statut', salarie.statut],
                      ],
                    ],
                  ] as const
                ).map(([titre, lignes]) => (
                  <div key={titre} className="rounded-lg border border-bordure p-4">
                    <h3
                      className="text-[13px] font-semibold text-encre uppercase tracking-wide"
                      style={{ letterSpacing: '.05em' }}
                    >
                      {titre}
                    </h3>
                    <dl className="mt-3 space-y-2.5">
                      {lignes.map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <dt className="text-[13px] text-texte-secondaire">{k}</dt>
                          <dd className="text-[13px] text-encre font-medium text-right">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}

            {tab === 'bulletins' && (
              <div>
                {bulletins.length === 0 ? (
                  <EmptyState
                    icon="FileText"
                    title="Aucun bulletin"
                    description="Aucun bulletin n'a encore été distribué à ce salarié."
                  />
                ) : (
                  <div className="space-y-2">
                    {bulletins.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-bordure hover:border-encre transition"
                      >
                        <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre">
                          <Icon name="FileText" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13.5px] font-medium text-encre">
                            {b.periodeLibelle}
                          </div>
                          <div className="text-[12px] text-texte-secondaire">
                            Remise : {b.dateRemise ?? '—'} · Consultation : {b.dateConsultation ?? '—'}
                          </div>
                        </div>
                        {b.statutRemise === 'distribue' ? (
                          <StatusPill tone="succes" size="sm" icon="Check">
                            Distribué
                          </StatusPill>
                        ) : (
                          <StatusPill tone="attente" size="sm">
                            En attente
                          </StatusPill>
                        )}
                        {b.statutSignature === 'signe' && (
                          <StatusPill tone="succes" size="sm" icon="BadgeCheck">
                            Signé
                          </StatusPill>
                        )}
                        {b.statutSignature === 'requis_non_signe' && (
                          <StatusPill tone="attente" size="sm" icon="PenLine">
                            À signer
                          </StatusPill>
                        )}
                        <IconButton icon="ChevronRight" ariaLabel="Voir" size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'reclamations' && (
              <EmptyState
                icon="MessageSquareWarning"
                title="Aucune réclamation"
                description="Ce salarié n'a déposé aucune réclamation à ce jour."
              />
            )}
          </div>
        </Card>
      </div>

      <Modal
        open={showDepart}
        onClose={() => setShowDepart(false)}
        title={`Marquer ${salarie.nom} comme parti ?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDepart(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              icon="UserMinus"
              onClick={() => {
                setShowDepart(false);
                pousser({
                  message: `${salarie.nom} a été marqué(e) comme parti(e)`,
                  tone: 'info',
                  icon: 'Archive',
                });
                navigate('/pro/salaries');
              }}
            >
              Confirmer le départ
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-md bg-papier border border-bordure p-3 flex items-start gap-3 text-[12.5px]">
            <Icon name="Info" size={14} className="text-info shrink-0 mt-0.5" />
            <div className="text-texte-secondaire">
              <strong className="text-encre">Ce qui se passe :</strong>
              <ul className="mt-1.5 space-y-1 list-disc pl-5">
                <li>
                  Le rattachement passe en statut{' '}
                  <strong className="text-encre">« parti »</strong>, l'e-mail pro est désactivé.
                </li>
                <li>
                  {salarie.nom} ne sera plus facturé(e) à votre entreprise dès le mois suivant.
                </li>
                <li>
                  <strong className="text-encre">
                    Les bulletins déjà distribués restent dans son coffre-fort personnel
                  </strong>
                  , accessibles tant que son compte reste actif, en lecture seule.
                </li>
                <li>Vous ne pourrez plus distribuer de nouveaux bulletins à ce salarié.</li>
              </ul>
            </div>
          </div>
          <TextField
            label="Date de départ"
            type="date"
            value={dateDepart}
            onChange={(e) => setDateDepart(e.target.value)}
            icon="Calendar"
          />
          <Select
            label="Motif (interne)"
            placeholder="Sélectionner…"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            options={MOTIFS_DEPART}
          />
        </div>
      </Modal>
    </>
  );
}
