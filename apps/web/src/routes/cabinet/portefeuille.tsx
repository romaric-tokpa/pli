// CabinetPortefeuille — tableau de bord du portefeuille (sub-lot 11b).
//
// Porté de _wireframe/src/cabinet-layout.jsx (CabinetDashboard) :
//   - Synthèse du mois + accès rapides
//   - 4 KPIs (entreprises, salariés cumulés, bulletins ce mois, taux consult.)
//   - File « à traiter ce mois » (carte par entreprise avec actions)
//   - Table portefeuille (recherche + filtre statut + entrée → /cabinet/entreprises/:id)
//   - Modale « Créer une entreprise cliente » (création déléguée)
//
// AUCUN MONTANT n'est rendu sur ce dashboard (CLAUDE.md invariant 1) — KPIs
// et table portent compteurs et taux uniquement. Le service expose seulement
// `MetriquesPortefeuilleEntreprise` (compteurs + taux), pas de net/brut.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  Cabinet,
  Entreprise,
  GestionnaireCabinet,
  MetriquesPortefeuilleEntreprise,
  StatutEntreprise,
} from '@pli/types';
import {
  Button,
  Card,
  EmptyState,
  Icon,
  KPICard,
  Modal,
  SearchField,
  Select,
  StatusPill,
  Table,
  TextField,
  useToast,
  type StatusTone,
  type IconName,
} from '@pli/ui';
import {
  creerCabinetsServiceMock,
  type ContextePortefeuilleCabinet,
} from '../../services/index.js';
import { CabinetPageHeader } from './_page-header.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant()
const CONTEXTE_DEMO: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: 'cab-ebrie',
};
const GESTIONNAIRE_COURANT_ID = 'uc-1';

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

function statutEntreprisePill(statut: StatutEntreprise) {
  const map: Record<StatutEntreprise, { tone: StatusTone; libelle: string }> = {
    active: { tone: 'succes', libelle: 'Active' },
    essai: { tone: 'info', libelle: 'Essai' },
    impaye: { tone: 'erreur', libelle: 'Impayé' },
    suspendue: { tone: 'erreur', libelle: 'Suspendue' },
  };
  const { tone, libelle } = map[statut];
  return (
    <StatusPill tone={tone} size="sm">
      {libelle}
    </StatusPill>
  );
}

interface ATraiter {
  entreprise: Entreprise;
  metriques: MetriquesPortefeuilleEntreprise;
  items: { icon: IconName; tone: StatusTone; label: string }[];
}

function deriverATraiter(
  entreprises: Entreprise[],
  metriques: MetriquesPortefeuilleEntreprise[],
): ATraiter[] {
  const parId = new Map(metriques.map((m) => [m.entrepriseId, m]));
  const res: ATraiter[] = [];
  for (const e of entreprises) {
    const m = parId.get(e.id);
    if (!m) continue;
    const items: ATraiter['items'] = [];
    if (m.bulletinsAUploader > 0)
      items.push({
        icon: 'CloudUpload',
        tone: 'info',
        label: `${m.bulletinsAUploader} bulletins à téléverser`,
      });
    if (m.bulletinsADistribuer > 0)
      items.push({
        icon: 'Send',
        tone: 'attente',
        label: `${m.bulletinsADistribuer} bulletins à distribuer`,
      });
    if (m.relancesEnAttente > 0)
      items.push({
        icon: 'BellRing',
        tone: 'attente',
        label: `${m.relancesEnAttente} relances à envoyer`,
      });
    if (items.length > 0) res.push({ entreprise: e, metriques: m, items });
  }
  return res;
}

interface NouvelleEnt {
  raisonSociale: string;
  secteur: string;
  idFiscal: string;
  salariesEstimes: string;
  lectureSeule: boolean;
}

const NOUVELLE_ENT_VIDE: NouvelleEnt = {
  raisonSociale: '',
  secteur: '',
  idFiscal: '',
  salariesEstimes: '',
  lectureSeule: false,
};

const SECTEURS = [
  { value: 'agroalimentaire', label: 'Agroalimentaire' },
  { value: 'transport', label: 'Transport / Logistique' },
  { value: 'commerce', label: 'Commerce / Distribution' },
  { value: 'services', label: 'Services' },
  { value: 'finance', label: 'Banque / Finance' },
  { value: 'informatique', label: 'Informatique / Télécoms' },
  { value: 'sante', label: 'Santé / Pharmaceutique' },
  { value: 'industrie', label: 'Industrie / Manufacturing' },
  { value: 'autre', label: 'Autre' },
];

const STATUTS_FILTRE = [
  { value: 'active', label: 'Active' },
  { value: 'essai', label: 'Essai' },
  { value: 'impaye', label: 'Impayé' },
];

export function CabinetPortefeuille() {
  const services = useMemo(() => ({ cabinets: creerCabinetsServiceMock() }), []);
  const pousser = useToast();

  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [gestionnaire, setGestionnaire] = useState<GestionnaireCabinet | null>(null);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [metriques, setMetriques] = useState<MetriquesPortefeuilleEntreprise[]>([]);

  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [creerOpen, setCreerOpen] = useState(false);
  const [nouvelleEnt, setNouvelleEnt] = useState<NouvelleEnt>(NOUVELLE_ENT_VIDE);

  useEffect(() => {
    void (async () => {
      const [cab, gest, port, met] = await Promise.all([
        services.cabinets.obtenirCabinet(CONTEXTE_DEMO),
        services.cabinets.obtenirGestionnaire(CONTEXTE_DEMO, GESTIONNAIRE_COURANT_ID),
        services.cabinets.obtenirPortefeuille(CONTEXTE_DEMO),
        services.cabinets.obtenirMetriquesPortefeuille(CONTEXTE_DEMO),
      ]);
      setCabinet(cab);
      setGestionnaire(gest);
      setEntreprises(port);
      setMetriques(met);
    })();
  }, [services]);

  const prenom = gestionnaire?.nom.split(' ')[0] ?? '—';

  // Filtrage UI (par recherche + statut)
  const entreprisesFiltrees = useMemo(() => {
    return entreprises.filter((e) => {
      if (
        recherche &&
        !`${e.nom} ${e.secteur ?? ''}`.toLowerCase().includes(recherche.toLowerCase())
      )
        return false;
      if (filtreStatut && e.statut !== filtreStatut) return false;
      return true;
    });
  }, [entreprises, recherche, filtreStatut]);

  // Indicateurs sur l'ensemble (pas le filtré — KPIs portefeuille global)
  const metriquesParId = useMemo(
    () => new Map(metriques.map((m) => [m.entrepriseId, m])),
    [metriques],
  );
  const totalSalaries = entreprises.reduce(
    (s, e) => s + (metriquesParId.get(e.id)?.salaries ?? 0),
    0,
  );
  const totalBulletinsMois = entreprises.reduce(
    (s, e) => s + (metriquesParId.get(e.id)?.bulletinsMois ?? 0),
    0,
  );
  const totalADistribuer = entreprises.reduce(
    (s, e) =>
      s +
      ((metriquesParId.get(e.id)?.bulletinsAUploader ?? 0) +
        (metriquesParId.get(e.id)?.bulletinsADistribuer ?? 0)),
    0,
  );
  const totalRelances = entreprises.reduce(
    (s, e) => s + (metriquesParId.get(e.id)?.relancesEnAttente ?? 0),
    0,
  );
  const reclamationsOuvertes = entreprises.length * 2;
  const tauxConsultMoyen = entreprises.length
    ? Math.round(
        (metriques.reduce((s, m) => s + m.consultation, 0) / entreprises.length) * 100,
      )
    : 0;

  const aTraiter = deriverATraiter(entreprises, metriques);
  const totalActions = aTraiter.reduce((s, x) => s + x.items.length, 0);

  const creerEntreprise = () => {
    pousser({
      message: `${nouvelleEnt.raisonSociale} ajoutée à votre portefeuille`,
      tone: 'succes',
    });
    setCreerOpen(false);
    setNouvelleEnt(NOUVELLE_ENT_VIDE);
  };

  return (
    <>
      <CabinetPageHeader
        title={`Bonjour, ${prenom}`}
        subtitle={
          cabinet
            ? `Portefeuille de ${cabinet.nom} — ${entreprises.length} entreprise${entreprises.length > 1 ? 's' : ''} sous gestion`
            : '—'
        }
        actions={
          <>
            <span className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface text-[12.5px] text-encre">
              <Icon name="ShieldCheck" size={12} className="text-succes" />
              Cloisonnement strict entre entreprises
            </span>
            <Button variant="primary" icon="CirclePlus" onClick={() => setCreerOpen(true)}>
              Créer une entreprise cliente
            </Button>
          </>
        }
      />

      <div className="p-8 space-y-6">
        {/* Synthèse + accès rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-encre">
                Synthèse du portefeuille — Février 2026
              </h2>
              <Link
                to="/cabinet/statistiques"
                className="inline-flex items-center gap-1 text-[12px] text-encre hover:underline"
              >
                Toutes les statistiques
                <Icon name="ChevronRight" size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-md bg-papier border border-bordure p-3">
                <div
                  className="text-[11px] text-texte-secondaire uppercase tracking-wide"
                  style={{ letterSpacing: '.05em' }}
                >
                  Taux consult.
                </div>
                <div className="text-[22px] font-semibold text-succes tabular-nums">
                  {tauxConsultMoyen}%
                </div>
                <div className="text-[10.5px] text-texte-secondaire">moyenne</div>
              </div>
              <div className="rounded-md bg-papier border border-bordure p-3">
                <div
                  className="text-[11px] text-texte-secondaire uppercase tracking-wide"
                  style={{ letterSpacing: '.05em' }}
                >
                  À distribuer
                </div>
                <div className="text-[22px] font-semibold text-attente tabular-nums">
                  {totalADistribuer}
                </div>
                <div className="text-[10.5px] text-texte-secondaire">bulletins</div>
              </div>
              <div className="rounded-md bg-papier border border-bordure p-3">
                <div
                  className="text-[11px] text-texte-secondaire uppercase tracking-wide"
                  style={{ letterSpacing: '.05em' }}
                >
                  Relances
                </div>
                <div className="text-[22px] font-semibold text-encre tabular-nums">
                  {totalRelances}
                </div>
                <div className="text-[10.5px] text-texte-secondaire">en attente</div>
              </div>
              <div className="rounded-md bg-papier border border-bordure p-3">
                <div
                  className="text-[11px] text-texte-secondaire uppercase tracking-wide"
                  style={{ letterSpacing: '.05em' }}
                >
                  Réclamations
                </div>
                <div className="text-[22px] font-semibold text-encre tabular-nums">
                  {reclamationsOuvertes}
                </div>
                <div className="text-[10.5px] text-texte-secondaire">ouvertes</div>
              </div>
            </div>
          </Card>

          <Card padding="p-5">
            <h2 className="text-[14px] font-semibold text-encre mb-3">Accès rapides</h2>
            <div className="space-y-2">
              <Link
                to="/cabinet/suivi"
                className="flex items-center gap-3 p-2.5 rounded-md border border-bordure hover:border-encre transition"
              >
                <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre">
                  <Icon name="Eye" size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-encre">Suivi consolidé</div>
                  <div className="text-[11px] text-texte-secondaire">
                    Consultations et relances
                  </div>
                </div>
                <Icon name="ChevronRight" size={13} className="text-texte-secondaire" />
              </Link>
              <Link
                to="/cabinet/statistiques"
                className="flex items-center gap-3 p-2.5 rounded-md border border-bordure hover:border-encre transition"
              >
                <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre">
                  <Icon name="ChartBarBig" size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-encre">Statistiques</div>
                  <div className="text-[11px] text-texte-secondaire">
                    Analyse du portefeuille
                  </div>
                </div>
                <Icon name="ChevronRight" size={13} className="text-texte-secondaire" />
              </Link>
            </div>
          </Card>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            label="Entreprises gérées"
            value={entreprises.length}
            icon="Building2"
            tone="info"
          />
          <KPICard
            label="Salariés cumulés"
            value={formatNum(totalSalaries)}
            icon="Users"
            tone="neutre"
          />
          <KPICard
            label="Bulletins ce mois"
            value={formatNum(totalBulletinsMois)}
            icon="FileText"
            tone="neutre"
            hint="Février 2026"
          />
          <KPICard
            label="Taux de consultation"
            value={`${tauxConsultMoyen}%`}
            icon="Eye"
            tone="succes"
            hint="Moyenne portefeuille"
          />
        </div>

        {/* À traiter ce mois */}
        <Card padding="p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-[16px] font-semibold text-encre flex items-center gap-2">
                <Icon name="ListChecks" size={16} className="text-cachet" />À traiter ce mois
              </h2>
              <p className="text-[12px] text-texte-secondaire">
                Pilotage quotidien de votre portefeuille — Février 2026
              </p>
            </div>
            <span className="text-[12px] text-texte-secondaire">{totalActions} actions</span>
          </div>
          {aTraiter.length === 0 ? (
            <EmptyState
              icon="CircleCheckBig"
              title="Tout est à jour"
              description="Aucune action en attente sur votre portefeuille."
            />
          ) : (
            <div className="space-y-2">
              {aTraiter.map((x) => (
                <div
                  key={x.entreprise.id}
                  className="rounded-md border border-bordure p-3 flex items-start gap-3"
                >
                  <div className="h-10 w-10 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre shrink-0">
                    <Icon name="Building2" size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-encre text-[14px]">
                      {x.entreprise.nom}
                    </div>
                    <div className="text-[11.5px] text-texte-secondaire">
                      {x.entreprise.secteur ?? '—'} · {x.metriques.salaries} salariés
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {x.items.map((it, i) => (
                        <StatusPill key={i} tone={it.tone} size="sm" icon={it.icon}>
                          {it.label}
                        </StatusPill>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={`/cabinet/entreprises/${x.entreprise.id}`}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-encre text-white text-[12.5px] font-medium hover:bg-[#0F1F3D] transition self-center"
                  >
                    <Icon name="LogIn" size={12} />
                    Entrer
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Table portefeuille */}
        <Card padding="p-0">
          <div className="p-4 border-b border-bordure flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <SearchField
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher une entreprise…"
                size="sm"
              />
            </div>
            <Select
              size="sm"
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              placeholder="Tous les statuts"
              icon="SlidersHorizontal"
              options={STATUTS_FILTRE}
              className="min-w-[180px]"
            />
            <div className="ml-auto text-[12px] text-texte-secondaire">
              {entreprisesFiltrees.length} entreprise{entreprisesFiltrees.length > 1 ? 's' : ''}
            </div>
          </div>
          {entreprisesFiltrees.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="SlidersHorizontal"
                title="Aucune entreprise ne correspond"
                description="Modifiez la recherche ou le filtre de statut pour voir plus d'entreprises."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setRecherche('');
                      setFiltreStatut('');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                }
              />
            </div>
          ) : (
            <Table
              columns={[
                {
                  label: 'Entreprise',
                  render: (r) => (
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre">
                        <Icon name="Building2" size={14} />
                      </div>
                      <div>
                        <div className="font-medium text-encre">{r.nom}</div>
                        <div className="text-[12px] text-texte-secondaire">
                          {r.secteur ?? '—'}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  label: 'Salariés',
                  width: 110,
                  render: (r) => {
                    const n = metriquesParId.get(r.id)?.salaries ?? 0;
                    return <span className="tabular-nums">{formatNum(n)}</span>;
                  },
                },
                {
                  label: 'Bulletins du mois',
                  width: 200,
                  render: (r) => {
                    const m = metriquesParId.get(r.id);
                    if (!m) return null;
                    if (m.bulletinsAUploader > 0)
                      return (
                        <StatusPill tone="info" size="sm" icon="CloudUpload">
                          {m.bulletinsAUploader} à téléverser
                        </StatusPill>
                      );
                    if (m.bulletinsADistribuer > 0)
                      return (
                        <StatusPill tone="attente" size="sm" icon="Send">
                          {m.bulletinsADistribuer} à distribuer
                        </StatusPill>
                      );
                    return (
                      <StatusPill tone="succes" size="sm" icon="Check">
                        {m.bulletinsMois} distribués
                      </StatusPill>
                    );
                  },
                },
                {
                  label: 'Consultation',
                  width: 160,
                  render: (r) => {
                    const c = metriquesParId.get(r.id)?.consultation ?? 0;
                    return (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className="h-full bg-encre rounded-full"
                            style={{ width: `${Math.round(c * 100)}%` }}
                          />
                        </div>
                        <span className="text-[12px] text-texte-secondaire tabular-nums">
                          {Math.round(c * 100)}%
                        </span>
                      </div>
                    );
                  },
                },
                {
                  label: 'Statut',
                  width: 110,
                  render: (r) => statutEntreprisePill(r.statut),
                },
                {
                  label: '',
                  width: 100,
                  render: (r) => (
                    <Link
                      to={`/cabinet/entreprises/${r.id}`}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-encre text-white text-[12.5px] font-medium hover:bg-[#0F1F3D] transition"
                    >
                      <Icon name="LogIn" size={12} />
                      Entrer
                    </Link>
                  ),
                },
              ]}
              data={entreprisesFiltrees}
            />
          )}
        </Card>
      </div>

      <Modal
        open={creerOpen}
        onClose={() => setCreerOpen(false)}
        title="Créer une entreprise cliente"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreerOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon="CirclePlus"
              disabled={!nouvelleEnt.raisonSociale || !nouvelleEnt.secteur}
              onClick={creerEntreprise}
            >
              Créer et ajouter au portefeuille
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-md bg-papier border border-bordure p-3 flex items-start gap-3 text-[12.5px]">
            <Icon name="Info" size={14} className="text-info shrink-0 mt-0.5" />
            <span className="text-texte-secondaire">
              L'entreprise sera créée en mode{' '}
              <strong className="text-encre">gestion déléguée</strong>. Aucune inscription
              côté entreprise n'est nécessaire — vous l'opérez directement depuis votre
              espace. Tout salarié et tout bulletin ajoutés ensuite{' '}
              <strong className="text-encre">appartiennent à cette entreprise</strong> et
              restent invisibles aux autres entreprises de votre portefeuille.
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Raison sociale"
              required
              value={nouvelleEnt.raisonSociale}
              onChange={(e) =>
                setNouvelleEnt({ ...nouvelleEnt, raisonSociale: e.target.value })
              }
              icon="Building2"
              placeholder="Ex. Cacao Plus SARL"
            />
            <Select
              label="Secteur"
              value={nouvelleEnt.secteur}
              onChange={(e) => setNouvelleEnt({ ...nouvelleEnt, secteur: e.target.value })}
              placeholder="Sélectionner…"
              icon="Briefcase"
              options={SECTEURS}
            />
            <TextField
              label="Identifiant fiscal (facultatif)"
              value={nouvelleEnt.idFiscal}
              onChange={(e) => setNouvelleEnt({ ...nouvelleEnt, idFiscal: e.target.value })}
              icon="Hash"
              placeholder="N° RCCM ou NCC"
            />
            <TextField
              label="Nombre estimé de salariés"
              value={nouvelleEnt.salariesEstimes}
              onChange={(e) =>
                setNouvelleEnt({ ...nouvelleEnt, salariesEstimes: e.target.value })
              }
              icon="Users"
              placeholder="Ex. 25"
            />
          </div>
          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={nouvelleEnt.lectureSeule}
              onChange={() =>
                setNouvelleEnt({ ...nouvelleEnt, lectureSeule: !nouvelleEnt.lectureSeule })
              }
              className="mt-1 accent-encre h-4 w-4"
            />
            <span className="text-[12.5px] text-texte-secondaire">
              <Icon name="Eye" size={11} className="inline mr-1 text-encre" />
              Inviter l'entreprise à un{' '}
              <strong className="text-encre">accès en lecture seule</strong> (supervision
              uniquement)
            </span>
          </label>
        </div>
      </Modal>
    </>
  );
}
