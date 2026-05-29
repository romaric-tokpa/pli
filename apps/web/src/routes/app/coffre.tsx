// Coffre-fort mobile salarié — port verbatim de _wireframe/src/mobile-coffre.jsx
// (MobileCoffre + CoffreSection).
//
// Invariant CLAUDE.md « net jamais en liste/résumé » : porté par le type
// `BulletinCoffreResume = Omit<BulletinCoffre, 'brut'|'cnps'|'its'|'net'>`.
// Le coffre n'a accès à aucun montant — même en lecture seule.
//
// L'agrégation multi-employeurs (Atlantique actuel + Comoé ancien dans la
// démo Aya) est ce qui rend cet écran unique — c'est le SEUL endroit où
// Pli traverse les tenants, et SEULEMENT en contexte personnel (CLAUDE.md
// invariant 5).

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EmptyState,
  Icon,
  SearchField,
  StatusPill,
} from '@pli/ui';
import type { BulletinCoffre, Rattachement } from '@pli/types';
import {
  creerCoffreServiceMock,
  type BulletinCoffreResume,
  type ContextePersonnel,
} from '../../services/index.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant()
const CONTEXTE_SALARIE: ContextePersonnel = {
  type: 'personnel',
  comptePersonnelId: 'cp-aya',
};

type StatutCarte = 'signe' | 'consulte' | 'nouveau';

function statutDeBulletin(b: Pick<BulletinCoffre, 'statutConsultation' | 'statutSignature'>): StatutCarte {
  if (b.statutSignature === 'signe') return 'signe';
  if (b.statutConsultation === 'consulte') return 'consulte';
  return 'nouveau';
}

function libelleStatut(s: StatutCarte): string {
  return s === 'signe' ? 'Signé' : s === 'consulte' ? 'Consulté' : 'Nouveau';
}

function toneStatut(s: StatutCarte): 'succes' | 'neutre' | 'attente' {
  return s === 'signe' ? 'succes' : s === 'consulte' ? 'neutre' : 'attente';
}

function grouperParAnnee(
  bulletins: BulletinCoffreResume[],
): Record<string, BulletinCoffreResume[]> {
  const out: Record<string, BulletinCoffreResume[]> = {};
  for (const b of bulletins) {
    const an = b.periode.split('-')[0] ?? '';
    if (!out[an]) out[an] = [];
    out[an]!.push(b);
  }
  return out;
}

interface SectionProps {
  rat: Rattachement;
  groupes: Record<string, BulletinCoffreResume[]>;
  total: number;
  openAnnees: Record<string, boolean>;
  toggleAnnee: (key: string) => void;
  defaultOpenAnnee?: string;
  ancien?: boolean;
}

function CoffreSection({
  rat,
  groupes,
  total,
  openAnnees,
  toggleAnnee,
  defaultOpenAnnee,
  ancien,
}: SectionProps) {
  const annees = Object.keys(groupes).sort().reverse();
  return (
    <div className="pt-4">
      <div className="px-5 pb-2 flex items-center gap-2.5">
        <div
          className={`h-9 w-9 rounded-md flex items-center justify-center ${
            ancien
              ? 'bg-white border border-bordure text-texte-secondaire'
              : 'bg-encre text-white'
          }`}
        >
          <Icon name={ancien ? 'Archive' : 'Building2'} size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-encre truncate">
            {rat.entrepriseNom}
          </div>
          <div className="text-[11.5px] text-texte-secondaire">
            {ancien
              ? `Jusqu'au ${rat.dateFin} · ${total} bulletin${total > 1 ? 's' : ''}`
              : `Employeur actuel · ${rat.service} · ${total} bulletin${
                  total > 1 ? 's' : ''
                }`}
          </div>
        </div>
        {ancien && (
          <StatusPill tone="neutre" size="sm" icon="Archive">
            Archivé
          </StatusPill>
        )}
      </div>

      {annees.map((annee) => {
        const key = `${rat.id}-${annee}`;
        const explicite = openAnnees[key];
        const isOpen = explicite !== undefined ? explicite : annee === defaultOpenAnnee;
        const bulls = groupes[annee] ?? [];
        return (
          <div key={annee}>
            <button
              type="button"
              onClick={() => toggleAnnee(key)}
              className="w-full px-5 py-2.5 flex items-center gap-2 bg-papier border-y border-bordure"
            >
              <Icon
                name={isOpen ? 'ChevronDown' : 'ChevronRight'}
                size={13}
                className="text-texte-secondaire"
              />
              <span className="text-[13px] font-semibold text-encre">{annee}</span>
              <span className="text-[11.5px] text-texte-secondaire">
                · {bulls.length} bulletin{bulls.length > 1 ? 's' : ''}
              </span>
            </button>
            {isOpen && (
              <div className="bg-white">
                {bulls.map((b) => {
                  const stat = statutDeBulletin(b);
                  return (
                    <Link
                      key={b.id}
                      to={`/app/bulletin/${b.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-surface/60 transition border-b border-bordure last:border-b-0"
                    >
                      <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre shrink-0">
                        <Icon name="FileText" size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-medium text-encre">
                          {b.periodeLibelle}
                        </div>
                        <div className="text-[11.5px] text-texte-secondaire">
                          {b.dateAccuseReception
                            ? `Reçu le ${b.dateAccuseReception.split(' ')[0]}`
                            : 'Non consulté'}
                        </div>
                      </div>
                      <StatusPill tone={toneStatut(stat)} size="sm">
                        {libelleStatut(stat)}
                      </StatusPill>
                      <Icon
                        name="ChevronRight"
                        size={14}
                        className="text-texte-secondaire shrink-0"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function MobileCoffre() {
  const services = useMemo(() => ({ coffre: creerCoffreServiceMock() }), []);
  const [recherche, setRecherche] = useState('');
  const [openAnciens, setOpenAnciens] = useState(false);
  const [openAnnees, setOpenAnnees] = useState<Record<string, boolean>>({});
  const [rattachements, setRattachements] = useState<Rattachement[]>([]);
  const [bulletins, setBulletins] = useState<BulletinCoffreResume[]>([]);

  useEffect(() => {
    void (async () => {
      const [r, b] = await Promise.all([
        services.coffre.listerRattachements(CONTEXTE_SALARIE),
        services.coffre.listerBulletins(CONTEXTE_SALARIE),
      ]);
      setRattachements(r);
      setBulletins(b);
    })();
  }, [services]);

  const toggleAnnee = (k: string) =>
    setOpenAnnees((prev) => ({ ...prev, [k]: !prev[k] }));

  const ratActuel = rattachements.find((r) => r.statut === 'actif');
  const ratsAnciens = rattachements.filter((r) => r.statut !== 'actif');

  const ratParId = useMemo(() => {
    const map: Record<string, Rattachement> = {};
    for (const r of rattachements) map[r.id] = r;
    return map;
  }, [rattachements]);

  const bulletinsFiltres = useMemo(() => {
    if (!recherche.trim()) return bulletins;
    const aig = recherche.toLowerCase();
    return bulletins.filter((b) => {
      const rat = ratParId[b.rattachementId];
      const cible = `${b.periodeLibelle} ${rat?.entrepriseNom ?? ''}`.toLowerCase();
      return cible.includes(aig);
    });
  }, [bulletins, recherche, ratParId]);

  const groupActuel = ratActuel
    ? grouperParAnnee(bulletinsFiltres.filter((b) => b.rattachementId === ratActuel.id))
    : {};
  const totalActuel = Object.values(groupActuel).reduce((s, arr) => s + arr.length, 0);

  const totalEmployeurs = (ratActuel ? 1 : 0) + ratsAnciens.length;
  const totalBulletins = bulletinsFiltres.length;

  return (
    <>
      {/* En-tête */}
      <div className="px-5 pt-4 pb-3 shrink-0 bg-white border-b border-bordure">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-encre">Mon coffre-fort</h1>
          <button
            type="button"
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-surface text-encre"
            aria-label="Filtres"
          >
            <Icon name="SlidersHorizontal" size={18} />
          </button>
        </div>
        <div className="mt-3">
          <SearchField
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un bulletin…"
            size="sm"
          />
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11.5px] text-texte-secondaire">
          <span className="inline-flex items-center gap-1">
            <Icon name="FileText" size={11} />
            {totalBulletins} bulletins
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="Building2" size={11} />
            {totalEmployeurs} employeur{totalEmployeurs > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="Infinity" size={11} />
            Lecture durable
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-3">
        {totalBulletins === 0 ? (
          <EmptyState
            icon="Vault"
            title="Coffre-fort vide"
            description="Aucun bulletin pour cette recherche."
          />
        ) : (
          <>
            {ratActuel && (
              <CoffreSection
                rat={ratActuel}
                groupes={groupActuel}
                total={totalActuel}
                openAnnees={openAnnees}
                toggleAnnee={toggleAnnee}
                defaultOpenAnnee={Object.keys(groupActuel).sort().reverse()[0]}
              />
            )}

            {ratsAnciens.length > 0 && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setOpenAnciens((v) => !v)}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-surface/40 transition"
                >
                  <Icon
                    name={openAnciens ? 'ChevronDown' : 'ChevronRight'}
                    size={14}
                    className="text-texte-secondaire"
                  />
                  <div className="h-8 w-8 rounded-md bg-surface flex items-center justify-center text-texte-secondaire">
                    <Icon name="Archive" size={14} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[13.5px] font-semibold text-encre">
                      Anciens employeurs
                    </div>
                    <div className="text-[11.5px] text-texte-secondaire">
                      {ratsAnciens.length} archivé{ratsAnciens.length > 1 ? 's' : ''} ·
                      lecture seule
                    </div>
                  </div>
                </button>
                {openAnciens &&
                  ratsAnciens.map((rat) => {
                    const groupes = grouperParAnnee(
                      bulletinsFiltres.filter((b) => b.rattachementId === rat.id),
                    );
                    const total = Object.values(groupes).reduce(
                      (s, arr) => s + arr.length,
                      0,
                    );
                    if (total === 0) return null;
                    return (
                      <div key={rat.id} className="bg-surface/30">
                        <CoffreSection
                          rat={rat}
                          groupes={groupes}
                          total={total}
                          openAnnees={openAnnees}
                          toggleAnnee={toggleAnnee}
                          ancien
                        />
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
