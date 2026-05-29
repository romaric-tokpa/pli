// Réclamations RH — port verbatim de pro-suivi-reclamations.jsx (ProReclamations).
//
// Données via ReclamationsService.lister(ctx) / .statistiques(ctx) — toutes
// les opérations scopées au tenant du contexte (CLAUDE.md isolation tenant).
// L'écran ne touche JAMAIS aux montants des bulletins liés (l'invariant « net
// jamais en liste » est porté par le type Bulletin → BulletinResume, mais ici
// on ne lit pas du tout les bulletins — la réclamation contient son propre
// résumé sujet/type/derniereActivite).
//
// recharts est chargé en lazy via ChartTendanceReclamations (chunk séparé) —
// invisible tant que l'onglet Statistiques n'est pas ouvert.

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Icon,
  KPICard,
  SearchField,
  Skeleton,
  StatusPill,
  useToast,
  type StatusTone,
} from '@pli/ui';
import type { Reclamation, Salarie, StatutReclamation } from '@pli/types';
import {
  creerReclamationsServiceMock,
  creerSalariesServiceMock,
  type ContexteEntreprise,
  type StatistiquesReclamations,
} from '../../services/index.js';
import { ProPageHeader } from './_page-header.js';

const ChartTendanceReclamations = lazy(
  () => import('./charts/chart-tendance-reclamations.js'),
);

// ─── Contexte tenant — TODO(phase-1) wirer à AuthService.contexteCourant() ──
const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

// ─── RH connecté — TODO(phase-1) wirer à AuthService.utilisateurCourant() ──
const UTILISATEUR_RH_NOM = 'Sylvie Aké';

type VueReclamations = 'conversations' | 'statistiques';
type FiltreStatut = 'toutes' | StatutReclamation;

const TONE_PAR_STATUT: Record<StatutReclamation, StatusTone> = {
  nouvelle: 'info',
  en_cours: 'attente',
  resolue: 'succes',
};

const LIBELLE_PAR_STATUT: Record<StatutReclamation, string> = {
  nouvelle: 'Nouvelle',
  en_cours: 'En cours',
  resolue: 'Résolue',
};

export function ProReclamations() {
  const pousser = useToast();
  const services = useMemo(
    () => ({
      reclamations: creerReclamationsServiceMock(),
      salaries: creerSalariesServiceMock(),
    }),
    [],
  );

  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [salariesParId, setSalariesParId] = useState<Record<string, Salarie>>({});
  const [stats, setStats] = useState<StatistiquesReclamations | null>(null);
  const [filtre, setFiltre] = useState<FiltreStatut>('toutes');
  const [recherche, setRecherche] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [vue, setVue] = useState<VueReclamations>('conversations');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [liste, s] = await Promise.all([
        services.reclamations.lister(CONTEXTE_PRO),
        services.reclamations.statistiques(CONTEXTE_PRO),
      ]);
      setReclamations(liste);
      setStats(s);
      const ids = Array.from(new Set(liste.map((r) => r.salarieId)));
      const fetched = await Promise.all(
        ids.map(
          async (id) => [id, await services.salaries.obtenir(CONTEXTE_PRO, id)] as const,
        ),
      );
      const map: Record<string, Salarie> = {};
      for (const [id, sal] of fetched) if (sal) map[id] = sal;
      setSalariesParId(map);
      setLoading(false);
      // Ouvre la première réclamation par défaut
      if (liste.length > 0 && !selectedId) setSelectedId(liste[0]!.id);
    })();
    // services et selectedId sont volontairement exclus — chargement initial uniquement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liste = useMemo(
    () =>
      reclamations
        .filter((r) => (filtre === 'toutes' ? true : r.statut === filtre))
        .filter((r) => {
          if (!recherche.trim()) return true;
          const aig = recherche.toLowerCase();
          const sal = salariesParId[r.salarieId];
          return (
            r.sujet.toLowerCase().includes(aig) ||
            r.type.toLowerCase().includes(aig) ||
            (sal?.nom.toLowerCase().includes(aig) ?? false)
          );
        }),
    [reclamations, filtre, recherche, salariesParId],
  );

  const courante = useMemo(() => {
    if (selectedId) return reclamations.find((r) => r.id === selectedId) ?? null;
    return reclamations[0] ?? null;
  }, [reclamations, selectedId]);
  const salCourant = courante ? salariesParId[courante.salarieId] : null;

  const compteurs = useMemo(() => {
    const compteur: Record<FiltreStatut, number> = {
      toutes: reclamations.length,
      nouvelle: 0,
      en_cours: 0,
      resolue: 0,
    };
    for (const r of reclamations) compteur[r.statut]++;
    return compteur;
  }, [reclamations]);

  const totalParType = stats
    ? stats.parType.reduce((s, x) => s + x.count, 0)
    : 0;

  async function envoyerReponse() {
    if (!courante || !reply.trim()) return;
    const res = await services.reclamations.envoyerReponse(
      CONTEXTE_PRO,
      courante.id,
      reply.trim(),
      UTILISATEUR_RH_NOM,
    );
    if (res.ok) {
      setReclamations((prev) => prev.map((r) => (r.id === res.reclamation.id ? res.reclamation : r)));
      setReply('');
      pousser({ message: 'Réponse envoyée', tone: 'succes' });
    } else {
      pousser({ message: 'Impossible d’envoyer la réponse', tone: 'erreur' });
    }
  }

  async function marquerResolue() {
    if (!courante) return;
    const res = await services.reclamations.marquerResolue(CONTEXTE_PRO, courante.id);
    if (res.ok) {
      setReclamations((prev) => prev.map((r) => (r.id === res.reclamation.id ? res.reclamation : r)));
      pousser({ message: 'Réclamation marquée résolue', tone: 'succes' });
    }
  }

  return (
    <>
      <ProPageHeader
        title="Réclamations"
        subtitle="Fil de discussion bidirectionnel entre vos salariés et l'équipe RH."
        actions={
          <div className="flex items-center gap-1 bg-surface p-1 rounded-md">
            {(
              [
                ['conversations', 'Conversations', 'MessagesSquare'],
                ['statistiques', 'Statistiques', 'ChartBarBig'],
              ] as const
            ).map(([k, l, ic]) => (
              <button
                type="button"
                key={k}
                onClick={() => setVue(k)}
                className={`inline-flex items-center gap-1.5 h-8 px-3 text-[13px] rounded font-medium transition ${
                  vue === k
                    ? 'bg-white text-encre shadow-sm'
                    : 'text-texte-secondaire hover:text-encre'
                }`}
              >
                <Icon name={ic} size={14} />
                {l}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-8 pb-8 pt-6">
        {vue === 'statistiques' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <KPICard
                label="Total"
                value={stats?.total ?? 0}
                icon="MessageSquareWarning"
                tone="neutre"
              />
              <KPICard
                label="Nouvelles"
                value={compteurs.nouvelle}
                icon="Inbox"
                tone="info"
              />
              <KPICard
                label="En cours"
                value={compteurs.en_cours}
                icon="Clock"
                tone="attente"
              />
              <KPICard
                label="Résolues"
                value={compteurs.resolue}
                icon="CircleCheckBig"
                tone="succes"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card padding="p-5">
                <h2 className="text-[16px] font-semibold text-encre">
                  Répartition par type d'anomalie
                </h2>
                <p className="text-[12px] text-texte-secondaire">
                  Sur l'ensemble des réclamations
                </p>
                <div className="mt-4 space-y-3">
                  {(stats?.parType ?? []).map((t) => {
                    const pct =
                      totalParType > 0 ? Math.round((t.count / totalParType) * 100) : 0;
                    return (
                      <div key={t.type}>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-encre font-medium">{t.type}</span>
                          <span className="text-texte-secondaire tabular-nums">
                            {t.count} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: t.couleur }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card padding="p-5">
                <h2 className="text-[16px] font-semibold text-encre">
                  Tendance — 6 derniers mois
                </h2>
                <p className="text-[12px] text-texte-secondaire">
                  Ouvertes vs résolues par mois
                </p>
                <div style={{ width: '100%', height: 220 }} className="mt-3">
                  <Suspense fallback={<Skeleton height={220} />}>
                    <ChartTendanceReclamations data={stats?.tendance6Mois ?? []} />
                  </Suspense>
                </div>
              </Card>
            </div>

            <Card padding="p-5">
              <h2 className="text-[16px] font-semibold text-encre">
                Délai moyen de résolution
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-md bg-papier border border-bordure p-4">
                  <div
                    className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.05em' }}
                  >
                    Première réponse
                  </div>
                  <div className="text-[24px] font-semibold text-encre tabular-nums">
                    {stats?.delaiPremiereReponse ?? '—'}
                  </div>
                  <div className="text-[12px] text-succes">−15 % vs janvier</div>
                </div>
                <div className="rounded-md bg-papier border border-bordure p-4">
                  <div
                    className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.05em' }}
                  >
                    Résolution complète
                  </div>
                  <div className="text-[24px] font-semibold text-encre tabular-nums">
                    {stats?.delaiResolutionMoyen ?? '—'}
                  </div>
                  <div className="text-[12px] text-succes">Stable</div>
                </div>
                <div className="rounded-md bg-papier border border-bordure p-4">
                  <div
                    className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.05em' }}
                  >
                    Taux de résolution
                  </div>
                  <div className="text-[24px] font-semibold text-encre tabular-nums">
                    {stats?.tauxResolution ?? 0}%
                  </div>
                  <div className="text-[12px] text-texte-secondaire">
                    Sur le mois écoulé
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card padding="p-0" className="overflow-hidden">
            <div
              className="grid grid-cols-1 lg:grid-cols-[360px_1fr]"
              style={{ minHeight: 640 }}
            >
              {/* Liste */}
              <div className="border-r border-bordure flex flex-col">
                <div className="p-4 border-b border-bordure space-y-3">
                  <SearchField
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    placeholder="Rechercher une réclamation…"
                    size="sm"
                  />
                  <div className="flex items-center gap-1 bg-surface p-1 rounded-md">
                    {(
                      [
                        ['toutes', 'Toutes'],
                        ['nouvelle', 'Nouvelles'],
                        ['en_cours', 'En cours'],
                        ['resolue', 'Résolues'],
                      ] as const
                    ).map(([k, l]) => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setFiltre(k)}
                        className={`flex-1 h-7 text-[12px] rounded font-medium transition ${
                          filtre === k
                            ? 'bg-white text-encre shadow-sm'
                            : 'text-texte-secondaire hover:text-encre'
                        }`}
                      >
                        {l}{' '}
                        <span className="text-texte-secondaire">({compteurs[k]})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-bordure">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[0, 1, 2].map((i) => (
                        <Skeleton key={i} height={56} />
                      ))}
                    </div>
                  ) : liste.length === 0 ? (
                    <EmptyState icon="MessageSquareWarning" title="Aucune réclamation" />
                  ) : (
                    liste.map((r) => {
                      const sal = salariesParId[r.salarieId];
                      const active = r.id === courante?.id;
                      const tone = TONE_PAR_STATUT[r.statut];
                      return (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => setSelectedId(r.id)}
                          className={`w-full text-left p-4 transition flex items-start gap-3 ${
                            active ? 'bg-papier' : 'hover:bg-surface/60'
                          }`}
                        >
                          <Avatar name={sal?.nom ?? ''} size={36} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-[13.5px] font-medium text-encre truncate">
                                {sal?.nom ?? '—'}
                              </div>
                              <span className="text-[11px] text-texte-secondaire shrink-0">
                                {r.derniereActivite}
                              </span>
                            </div>
                            <div className="text-[12.5px] text-encre truncate">
                              {r.sujet}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              <StatusPill tone={tone} size="sm">
                                {LIBELLE_PAR_STATUT[r.statut]}
                              </StatusPill>
                              <span className="text-[11px] text-texte-secondaire">
                                {r.type}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Détail */}
              {!courante ? (
                <EmptyState
                  icon="MessageSquareWarning"
                  title="Sélectionnez une réclamation"
                />
              ) : (
                <div className="flex flex-col">
                  {/* En-tête conversation */}
                  <div className="p-5 border-b border-bordure flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                      <Avatar name={salCourant?.nom ?? ''} size={44} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[16px] font-semibold text-encre">
                            {salCourant?.nom ?? '—'}
                          </h2>
                          <StatusPill tone={TONE_PAR_STATUT[courante.statut]} size="sm">
                            {LIBELLE_PAR_STATUT[courante.statut]}
                          </StatusPill>
                        </div>
                        <div className="text-[13px] text-texte-secondaire mt-0.5">
                          {courante.sujet}
                        </div>
                        <div className="text-[12px] text-texte-secondaire mt-0.5">
                          {courante.type} · ouverte le {courante.dateOuverture}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" icon="FileText">
                        Voir le bulletin
                      </Button>
                      {courante.statut !== 'resolue' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon="Check"
                          onClick={marquerResolue}
                        >
                          Marquer comme résolue
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Fil */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-papier/40">
                    {courante.messages.map((m, i) => {
                      const isSalarie = m.auteur === 'salarie';
                      return (
                        <div
                          key={i}
                          className={`flex items-end gap-2.5 ${
                            isSalarie ? 'flex-row' : 'flex-row-reverse'
                          }`}
                        >
                          <Avatar name={m.nom} size={28} />
                          <div
                            className={`max-w-[70%] ${
                              isSalarie ? '' : 'items-end flex flex-col'
                            }`}
                          >
                            <div
                              className={`text-[11px] text-texte-secondaire mb-1 ${
                                isSalarie ? '' : 'text-right'
                              }`}
                            >
                              <span className="font-medium text-encre">{m.nom}</span> ·{' '}
                              {m.date}
                            </div>
                            <div
                              className={`rounded-lg px-3 py-2 text-[13.5px] ${
                                isSalarie
                                  ? 'bg-white border border-bordure text-encre'
                                  : 'bg-encre text-white'
                              }`}
                            >
                              {m.texte}
                            </div>
                            {m.piecesJointes?.map((p, pi) => (
                              <button
                                type="button"
                                key={pi}
                                className={`mt-1.5 inline-flex items-center gap-1.5 text-[12px] px-2 py-1 rounded border ${
                                  isSalarie
                                    ? 'bg-white border-bordure text-encre'
                                    : 'bg-encre/10 border-encre/20 text-white'
                                }`}
                              >
                                <Icon name="Paperclip" size={12} />
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Champ de réponse */}
                  {courante.statut !== 'resolue' && (
                    <div className="p-4 border-t border-bordure bg-white">
                      <div className="flex items-end gap-2">
                        <div className="flex-1 rounded-md border border-bordure focus-within:border-encre transition">
                          <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder={
                              salCourant
                                ? `Écrivez votre réponse à ${salCourant.nom.split(' ')[0]}…`
                                : 'Écrivez votre réponse…'
                            }
                            className="w-full p-3 bg-transparent outline-none text-[14px] resize-none"
                            rows={3}
                          />
                          <div className="flex items-center justify-between px-3 py-2 border-t border-bordure">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 text-[12px] text-texte-secondaire hover:text-encre"
                            >
                              <Icon name="Paperclip" size={14} />
                              Joindre un fichier
                            </button>
                            <span className="text-[11px] text-texte-secondaire">
                              {reply.length} caractères
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          icon="Send"
                          disabled={!reply.trim()}
                          onClick={envoyerReponse}
                        >
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  )}

                  {courante.statut === 'resolue' && (
                    <div className="p-4 border-t border-bordure bg-papier flex items-center gap-2 justify-center">
                      <Icon name="CircleCheckBig" size={16} className="text-succes" />
                      <span className="text-[13px] text-texte-secondaire">
                        Cette réclamation a été marquée comme résolue.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
