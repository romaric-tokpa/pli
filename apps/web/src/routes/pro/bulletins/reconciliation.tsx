// ProBulletinsUpload — écran de réconciliation, le plus sensible du produit.
// Port verbatim de pro-bulletins.jsx (ProBulletinsUpload).
//
// ─── INVARIANTS CLAUDE.md ────────────────────────────────────────────────
// 1. La règle « seuls les appariés sont distribuables » VIT DANS LE SERVICE.
//    L'UI appelle `ReconciliationService.distribuer(ctx, ids)` ; le service
//    refuse silencieusement toute ligne en exception (cf. test de contrat
//    `suiteContratDistributionRefuseExceptions` de l'étape 7). Le `disabled`
//    du bouton n'est qu'un MIROIR UX de cette règle : si on bypass le
//    disabled (dev tools), le service refuse toujours les exceptions.
//
// 2. LigneReconciliation NE PORTE AUCUN MONTANT (cf. packages/types/src/
//    reconciliation.ts) — la spec détection lit matricule + période + état,
//    JAMAIS brut/cnps/its/net. Le net n'est pas lu, pas seulement pas affiché.
//
// 3. L'appairage est BORNÉ au registre de l'entreprise du contexte (bandeau
//    "Verrouillé"). `SalariesService.resoudreParMatricule(ctx, mat)` est
//    contraint au tenant — testé par `suiteContratAppairageBorneTenant`.

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  Icon,
  Modal,
  StatusPill,
  Stepper,
  Table,
  TextField,
  Uploader,
  useToast,
  type IconName,
  type StatusTone,
} from '@pli/ui';
import type {
  EtatReconciliation,
  LigneReconciliation,
} from '@pli/types';
import {
  creerReconciliationServiceMock,
  creerSalariesServiceMock,
  type ContexteEntreprise,
  type ReconciliationService,
  type SalariesService,
} from '../../../services/index.js';
import { ProPageHeader } from '../_page-header.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant()
const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

// TODO(phase-1) — wirer à EntrepriseService.obtenirCourante(ctx)
const ENTREPRISE_NOM = 'Groupe Atlantique CI';

interface MethodeIngestion {
  id: 'correspondance' | 'nommage' | 'groupe';
  titre: string;
  recommande?: boolean;
  icon: IconName;
  desc: string;
  detail: string;
  accept: string;
}

const METHODES_INGESTION: MethodeIngestion[] = [
  {
    id: 'correspondance',
    titre: 'Fichier de correspondance',
    recommande: true,
    icon: 'FileSpreadsheet',
    desc: "Vos PDF + un fichier CSV/Excel reliant chaque ligne « matricule → fichier → période ».",
    detail: "La méthode la plus fiable : l'appairage ne dépend pas du nom des fichiers.",
    accept: '.pdf,.csv,.xlsx,.zip',
  },
  {
    id: 'nommage',
    titre: 'Convention de nommage',
    icon: 'FileArchive',
    desc: 'Une archive ZIP de PDF nommés selon le motif matricule_AAAAMM.pdf.',
    detail: 'Ex. MAT-00112_202602.pdf — Pli lit le matricule et la période dans le nom.',
    accept: '.zip',
  },
  {
    id: 'groupe',
    titre: 'PDF groupé',
    icon: 'Files',
    desc: "Un seul PDF à découper (n pages par bulletin, ou extraction du matricule par page).",
    detail: 'Pli sépare le document et tente de retrouver chaque matricule.',
    accept: '.pdf',
  },
];

// État ÉTENDU côté UI : ajoute "ecarte" pour les lignes que l'utilisateur
// retire localement. Le service ne connaît pas cet état (purement UI).
type EtatLigneUI = EtatReconciliation | 'ecarte';

interface LigneUI extends Omit<LigneReconciliation, 'etat' | 'nom'> {
  etat: EtatLigneUI;
  etatInitial: EtatReconciliation;
  nom: string | null;
}

const ETAT_RENDU: Record<
  EtatLigneUI,
  { tone: StatusTone; label: string; icon: IconName }
> = {
  apparie: { tone: 'succes', label: 'Apparié', icon: 'FileCheck2' },
  introuvable: { tone: 'attente', label: 'Matricule introuvable', icon: 'UserX' },
  doublon: { tone: 'attente', label: 'Doublon', icon: 'CopyMinus' },
  faible_confiance: { tone: 'erreur', label: 'Faible confiance', icon: 'ScanSearch' },
  ecarte: { tone: 'neutre', label: 'Écarté', icon: 'CircleMinus' },
};

const PERIODES_COURT: Record<string, string> = {
  '2026-02': 'Fév. 2026',
  '2026-01': 'Jan. 2026',
};

type Phase = 'methode' | 'upload' | 'reconciliation';

export interface ProBulletinsUploadProps {
  /**
   * Factory injectable des services — facilite les tests d'invariant.
   * En prod, utilise les mocks par défaut.
   */
  servicesFactory?: () => {
    reconciliation: ReconciliationService;
    salaries: SalariesService;
  };
}

export function ProBulletinsUpload({
  servicesFactory = () => ({
    reconciliation: creerReconciliationServiceMock(),
    salaries: creerSalariesServiceMock(),
  }),
}: ProBulletinsUploadProps = {}) {
  const navigate = useNavigate();
  const pousser = useToast();
  const [services] = useState(() => servicesFactory());

  const [phase, setPhase] = useState<Phase>('methode');
  const [methode, setMethode] = useState<MethodeIngestion['id']>('correspondance');
  const [rows, setRows] = useState<LigneUI[]>([]);
  const [correction, setCorrection] = useState<LigneUI | null>(null);
  const [matSaisi, setMatSaisi] = useState('');
  const [verif, setVerif] = useState<LigneUI | null>(null);
  const [distribuant, setDistribuant] = useState(false);

  // Chargement du lot via le service quand on entre en phase reconciliation
  useEffect(() => {
    if (phase !== 'reconciliation') return;
    void (async () => {
      const lot = await services.reconciliation.obtenirLot(CONTEXTE_PRO);
      setRows(
        lot.map((l) => ({
          ...l,
          etat: l.etat,
          etatInitial: l.etat,
        })),
      );
    })();
  }, [phase, services.reconciliation]);

  const methodeObj = METHODES_INGESTION.find((m) => m.id === methode);
  const prets = rows.filter((r) => r.etat === 'apparie').length;
  const aTraiter = rows.filter((r) => r.etat !== 'apparie' && r.etat !== 'ecarte').length;
  const ecartes = rows.filter((r) => r.etat === 'ecarte').length;

  const setEtat = useCallback(
    (id: string, etat: EtatLigneUI, extra: Partial<LigneUI> = {}) => {
      setRows((cur) =>
        cur.map((r) => (r.id === id ? { ...r, etat, ...extra } : r)),
      );
    },
    [],
  );

  // Correction matricule — passe par SalariesService.resoudreParMatricule
  // qui est BORNÉ au registre du tenant (invariant appairage)
  const confirmerCorrection = async () => {
    if (!correction) return;
    const mat = matSaisi.trim();
    const sal = await services.salaries.resoudreParMatricule(CONTEXTE_PRO, mat);
    if (sal) {
      setEtat(correction.id, 'apparie', {
        matriculeDetecte: sal.matricule,
        nom: sal.nom,
        service: sal.service,
      });
      pousser({ message: `Apparié à ${sal.nom}`, tone: 'succes', icon: 'FileCheck2' });
    } else {
      pousser({
        message: 'Matricule toujours introuvable au registre',
        tone: 'attente',
        icon: 'UserX',
      });
    }
    setCorrection(null);
    setMatSaisi('');
  };

  // DISTRIBUTION — délègue au service qui REFUSE les exceptions.
  // On envoie volontairement TOUTES les lignes (sauf ecartees) pour
  // démontrer que le filtrage final est fait CÔTÉ SERVICE et non UI.
  const distribuer = async () => {
    setDistribuant(true);
    const cibles = rows.filter((r) => r.etat !== 'ecarte').map((r) => r.id);
    const resultat = await services.reconciliation.distribuer(CONTEXTE_PRO, cibles);
    setDistribuant(false);
    if (resultat.refuses > 0) {
      pousser({
        message: `${resultat.distribues} distribués · ${resultat.refuses} refusés par le service (exceptions)`,
        tone: 'attente',
        icon: 'TriangleAlert',
      });
    } else {
      pousser({
        message: `${resultat.distribues} bulletins appariés distribués`,
        tone: 'succes',
        icon: 'Send',
      });
    }
    setTimeout(() => navigate('/pro/bulletins'), 600);
  };

  return (
    <>
      <ProPageHeader
        breadcrumbs={[
          { label: 'Bulletins', href: '/pro/bulletins' },
          { label: 'Dépôt en masse' },
        ]}
        title="Déposer et réconcilier un lot"
        subtitle="Choisissez une méthode d'ingestion, puis vérifiez chaque correspondance avant la distribution."
        actions={
          <Stepper
            steps={['Méthode', 'Dépôt', 'Réconciliation']}
            current={phase === 'methode' ? 1 : phase === 'upload' ? 2 : 3}
          />
        }
      />

      <div className="p-8 space-y-6">
        {/* Bandeau contexte employeur — invariant tenant */}
        <Card padding="p-3.5" className="border-encre/20" bg="bg-encre/5">
          <div className="flex items-center gap-3">
            <Icon name="Building2" size={16} className="text-encre shrink-0" />
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                style={{ letterSpacing: '.05em' }}
              >
                Lot pour
              </div>
              <div className="text-[14px] font-semibold text-encre truncate">
                {ENTREPRISE_NOM}
              </div>
              <div className="text-[11.5px] text-texte-secondaire mt-0.5">
                Appairage matricule borné au registre de cette entreprise
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11.5px] text-texte-secondaire">
              <Icon name="Lock" size={11} />
              Verrouillé
            </span>
          </div>
        </Card>

        {/* Phase 1 — Méthode d'ingestion */}
        {phase === 'methode' && (
          <>
            <Card padding="p-6">
              <h2 className="text-[16px] font-semibold text-encre">
                Comment souhaitez-vous transmettre vos bulletins ?
              </h2>
              <p className="mt-1 text-[13px] text-texte-secondaire">
                Trois méthodes d'ingestion. Vous pourrez tout vérifier à l'étape suivante.
              </p>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {METHODES_INGESTION.map((m) => {
                  const actif = methode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethode(m.id)}
                      className={`text-left rounded-lg border p-4 transition relative ${
                        actif
                          ? 'border-encre bg-encre/5 ring-2 ring-encre/15'
                          : 'border-bordure hover:border-[#B8C0CE] bg-white'
                      }`}
                    >
                      {m.recommande && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-cachet text-white">
                          <Icon name="Star" size={9} />
                          Recommandé
                        </span>
                      )}
                      <div
                        className={`h-10 w-10 rounded-md flex items-center justify-center ${
                          actif
                            ? 'bg-encre text-white'
                            : 'bg-papier border border-bordure text-encre'
                        }`}
                      >
                        <Icon name={m.icon} size={18} />
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="text-[14px] font-semibold text-encre">{m.titre}</div>
                        {actif && (
                          <Icon name="CircleCheckBig" size={15} className="text-encre" />
                        )}
                      </div>
                      <div className="mt-1 text-[12.5px] text-texte-secondaire">{m.desc}</div>
                      <div className="mt-2 text-[11.5px] text-texte-secondaire flex items-start gap-1.5">
                        <Icon name="Info" size={11} className="text-info shrink-0 mt-0.5" />
                        {m.detail}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card padding="p-4" bg="bg-papier/60">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-white border border-bordure flex items-center justify-center text-cachet shrink-0">
                  <Icon name="Save" size={16} />
                </div>
                <div className="flex-1 text-[12.5px] text-texte-secondaire">
                  <strong className="text-encre">
                    Profil d'ingestion enregistré pour cette entreprise.
                  </strong>{' '}
                  Le mois prochain, ce sera un clic — Pli réutilise votre méthode, vos colonnes de
                  correspondance et vos règles de nommage.
                </div>
                <StatusPill tone="succes" size="sm" icon="Check">
                  Mémorisé
                </StatusPill>
              </div>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => navigate('/pro/bulletins')}>
                Annuler
              </Button>
              <Button
                variant="primary"
                iconRight="ArrowRight"
                onClick={() => setPhase('upload')}
              >
                Continuer
              </Button>
            </div>
          </>
        )}

        {/* Phase 2 — Dépôt */}
        {phase === 'upload' && methodeObj && (
          <Card padding="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name={methodeObj.icon} size={16} className="text-cachet" />
              <span className="text-[13px] font-medium text-encre">{methodeObj.titre}</span>
              <button
                type="button"
                onClick={() => setPhase('methode')}
                className="text-[12px] text-encre hover:underline ml-1"
              >
                Changer
              </button>
            </div>
            <Uploader
              accept={methodeObj.accept}
              multiFile={methode !== 'groupe'}
              onFiles={() => setPhase('reconciliation')}
              hint={methodeObj.detail}
              label={
                methode === 'correspondance'
                  ? 'Déposez vos PDF + le fichier de correspondance'
                  : methode === 'nommage'
                    ? "Déposez l'archive ZIP de vos PDF nommés"
                    : 'Déposez le PDF groupé à découper'
              }
            />
            <div className="mt-5 flex justify-between gap-2">
              <Button variant="ghost" icon="ArrowLeft" onClick={() => setPhase('methode')}>
                Précédent
              </Button>
              <Button
                variant="secondary"
                iconRight="ArrowRight"
                onClick={() => setPhase('reconciliation')}
              >
                Utiliser le lot de démonstration
              </Button>
            </div>
          </Card>
        )}

        {/* Phase 3 — RÉCONCILIATION */}
        {phase === 'reconciliation' && (
          <>
            {/* Compteurs + bandeau d'état */}
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 items-stretch">
              <Card padding="p-5" className="flex items-center gap-6">
                <div>
                  <div
                    className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.05em' }}
                  >
                    Prêts à distribuer
                  </div>
                  <div className="mt-1 text-[34px] font-semibold text-succes leading-none tabular-nums">
                    {prets}
                  </div>
                </div>
                <div className="h-12 w-px bg-bordure" />
                <div>
                  <div
                    className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.05em' }}
                  >
                    À traiter
                  </div>
                  <div
                    className={`mt-1 text-[34px] font-semibold leading-none tabular-nums ${
                      aTraiter > 0 ? 'text-attente' : 'text-texte-secondaire'
                    }`}
                  >
                    {aTraiter}
                  </div>
                </div>
                <div className="h-12 w-px bg-bordure" />
                <div>
                  <div
                    className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.05em' }}
                  >
                    Total du lot
                  </div>
                  <div className="mt-1 text-[34px] font-semibold text-encre leading-none tabular-nums">
                    {rows.length}
                  </div>
                </div>
              </Card>

              <Card
                padding="p-5"
                className={aTraiter > 0 ? 'border-attente/40' : 'border-succes/40'}
                bg={aTraiter > 0 ? 'bg-attente/5' : 'bg-succes/5'}
              >
                <div className="flex items-start gap-3 h-full">
                  <Icon
                    name={aTraiter > 0 ? 'TriangleAlert' : 'CircleCheckBig'}
                    size={18}
                    className={
                      aTraiter > 0
                        ? 'text-attente shrink-0 mt-0.5'
                        : 'text-succes shrink-0 mt-0.5'
                    }
                  />
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-encre">
                      {aTraiter > 0
                        ? `${aTraiter} document${aTraiter > 1 ? 's' : ''} ${
                            aTraiter > 1 ? 'nécessitent' : 'nécessite'
                          } votre attention`
                        : 'Tous les documents traités sont prêts'}
                    </div>
                    <div className="text-[12.5px] text-texte-secondaire mt-0.5">
                      {prets} apparié{prets > 1 ? 's' : ''} · {aTraiter} en exception ·{' '}
                      {ecartes} écarté{ecartes > 1 ? 's' : ''}. La distribution n'agit que sur les
                      lignes <strong className="text-encre">Apparié</strong> — jamais sur une
                      exception.
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Table de réconciliation */}
            <Card padding="p-0">
              <div className="p-5 border-b border-bordure flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold text-encre">Réconciliation du lot</h2>
                  <p className="text-[13px] text-texte-secondaire">
                    Une ligne par document. Traitez chaque exception, puis distribuez les bulletins
                    appariés.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusPill tone="succes" size="sm" icon="FileCheck2">
                    {prets} prêts
                  </StatusPill>
                  <StatusPill tone="attente" size="sm" icon="Clock">
                    {aTraiter} à traiter
                  </StatusPill>
                </div>
              </div>
              <Table<LigneUI>
                dense
                columns={[
                  {
                    label: 'Document',
                    render: (r) => (
                      <div className="flex items-center gap-2">
                        <Icon name="FileText" size={14} className="text-texte-secondaire" />
                        <span className="font-mono text-[12px]">{r.fichier}</span>
                      </div>
                    ),
                  },
                  {
                    label: 'Matricule détecté',
                    width: 150,
                    render: (r) => (
                      <span
                        className={`font-mono text-[12.5px] ${
                          r.etat === 'faible_confiance' ? 'text-erreur' : 'text-encre'
                        }`}
                      >
                        {r.matriculeDetecte ?? '—'}
                        {r.etat === 'faible_confiance' && r.confiance != null && (
                          <span className="block text-[10.5px] text-texte-secondaire">
                            confiance {r.confiance}%
                          </span>
                        )}
                      </span>
                    ),
                  },
                  {
                    label: 'Salarié',
                    render: (r) =>
                      r.nom ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={r.nom.replace(/\s*\(\?\)/, '')} size={24} />
                          <span
                            className={
                              r.etat === 'ecarte' ? 'text-texte-secondaire line-through' : ''
                            }
                          >
                            {r.nom}
                          </span>
                        </div>
                      ) : (
                        <span className="text-texte-secondaire">—</span>
                      ),
                  },
                  {
                    label: 'Période',
                    width: 110,
                    render: (r) => PERIODES_COURT[r.periode] ?? r.periode,
                  },
                  {
                    label: 'État',
                    width: 180,
                    render: (r) => {
                      const e = ETAT_RENDU[r.etat];
                      return (
                        <StatusPill tone={e.tone} size="sm" icon={e.icon}>
                          {e.label}
                        </StatusPill>
                      );
                    },
                  },
                  {
                    label: 'Actions',
                    width: 270,
                    render: (r) => {
                      if (r.etat === 'apparie') {
                        return (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="CircleMinus"
                            onClick={() => setEtat(r.id, 'ecarte')}
                          >
                            Écarter
                          </Button>
                        );
                      }
                      if (r.etat === 'introuvable') {
                        return (
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon="UserPlus"
                              onClick={() => {
                                setEtat(r.id, 'apparie', { nom: 'Nouveau salarié' });
                                pousser({
                                  message: 'Salarié créé et apparié',
                                  tone: 'succes',
                                  icon: 'UserCheck',
                                });
                              }}
                            >
                              Créer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="Pencil"
                              onClick={() => {
                                setCorrection(r);
                                setMatSaisi('');
                              }}
                            >
                              Corriger
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="CircleMinus"
                              onClick={() => setEtat(r.id, 'ecarte')}
                            >
                              Écarter
                            </Button>
                          </div>
                        );
                      }
                      if (r.etat === 'doublon') {
                        return (
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon="RefreshCw"
                              onClick={() => {
                                setEtat(r.id, 'apparie');
                                pousser({
                                  message:
                                    'Le bulletin existant sera remplacé (action journalisée)',
                                  tone: 'info',
                                  icon: 'RefreshCw',
                                });
                              }}
                            >
                              Remplacer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="Archive"
                              onClick={() => {
                                setEtat(r.id, 'ecarte');
                                pousser({
                                  message: 'Document écarté — bulletin existant conservé',
                                  tone: 'neutre',
                                });
                              }}
                            >
                              Conserver l'existant
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="CircleMinus"
                              onClick={() => setEtat(r.id, 'ecarte')}
                            >
                              Écarter
                            </Button>
                          </div>
                        );
                      }
                      if (r.etat === 'faible_confiance') {
                        return (
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon="ScanSearch"
                              onClick={() => setVerif(r)}
                            >
                              Vérifier puis inclure
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="CircleMinus"
                              onClick={() => setEtat(r.id, 'ecarte')}
                            >
                              Écarter
                            </Button>
                          </div>
                        );
                      }
                      if (r.etat === 'ecarte') {
                        return (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="Undo2"
                            onClick={() => setEtat(r.id, r.etatInitial)}
                          >
                            Réintégrer
                          </Button>
                        );
                      }
                      return null;
                    },
                  },
                ]}
                data={rows}
              />
              <div className="p-5 border-t border-bordure flex items-center justify-between flex-wrap gap-3">
                <div className="text-[12.5px] text-texte-secondaire flex items-center gap-1.5">
                  <Icon name="ShieldCheck" size={13} className="text-succes" />
                  Seuls les <strong className="text-encre">{prets} bulletins appariés</strong>{' '}
                  seront distribués.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    icon="ArrowLeft"
                    onClick={() => setPhase('methode')}
                  >
                    Recommencer
                  </Button>
                  <Button
                    variant="primary"
                    icon="Send"
                    disabled={prets === 0 || distribuant}
                    loading={distribuant}
                    onClick={distribuer}
                  >
                    Distribuer ({prets})
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Modale : corriger le matricule */}
      <Modal
        open={!!correction}
        onClose={() => {
          setCorrection(null);
          setMatSaisi('');
        }}
        title="Corriger le matricule"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setCorrection(null);
                setMatSaisi('');
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              icon="UserCheck"
              disabled={!matSaisi.trim()}
              onClick={() => {
                void confirmerCorrection();
              }}
            >
              Réappairer
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-md bg-papier border border-bordure p-3 text-[12.5px] text-texte-secondaire">
            Document{' '}
            <span className="font-mono text-encre">{correction?.fichier}</span> — matricule
            détecté{' '}
            <span className="font-mono text-encre">{correction?.matriculeDetecte}</span>{' '}
            introuvable au registre.
          </div>
          <TextField
            label="Matricule correct"
            icon="Hash"
            value={matSaisi}
            onChange={(e) => setMatSaisi(e.target.value)}
            placeholder="Ex. MAT-00112"
            autoFocus
          />
          <div className="text-[12px] text-texte-secondaire">
            Pli vérifie le matricule dans le registre de {ENTREPRISE_NOM}.
          </div>
        </div>
      </Modal>

      {/* Modale : vérifier un document à faible confiance */}
      <Modal
        open={!!verif}
        onClose={() => setVerif(null)}
        title="Vérifier avant d'inclure"
        footer={
          <>
            <Button variant="ghost" onClick={() => setVerif(null)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon="Check"
              onClick={() => {
                if (verif) {
                  setEtat(verif.id, 'apparie', {
                    nom: (verif.nom ?? '').replace(/\s*\(\?\)/, '') || 'Salarié vérifié',
                  });
                  setVerif(null);
                  pousser({
                    message: 'Document vérifié et inclus',
                    tone: 'succes',
                    icon: 'FileCheck2',
                  });
                }
              }}
            >
              Confirmer et inclure
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-md bg-erreur/5 border border-erreur/25 p-3 flex items-start gap-3 text-[12.5px]">
            <Icon name="ScanLine" size={14} className="text-erreur shrink-0 mt-0.5" />
            <div className="text-encre">
              L'OCR/découpage de ce document est incertain (
              <strong>confiance {verif?.confiance}%</strong>). Vérifiez le matricule détecté avant
              de l'inclure dans la distribution.
            </div>
          </div>
          <div className="rounded-md border border-bordure p-3 text-[13px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-texte-secondaire">Document</span>
              <span className="font-mono text-encre">{verif?.fichier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-texte-secondaire">Matricule détecté</span>
              <span className="font-mono text-encre">{verif?.matriculeDetecte}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-texte-secondaire">Salarié probable</span>
              <span className="text-encre">{verif?.nom ?? '—'}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
