// Facturation Pli Pro — port verbatim de pro-facturation-securite.jsx (ProFacturation).
//
// Toutes les données passent par FacturationService (tenant-scopé) +
// SalariesService.lister({statut: 'actif'}) pour la base de calcul du
// forfait. Le tarif 275 FCFA, la composition 150/75/50, le plan annuel −15 %
// sont la source de vérité du service — l'écran ne fait QUE projeter.

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Button,
  Card,
  Icon,
  IconButton,
  Modal,
  ProgressBar,
  StatusPill,
  Table,
  type IconName,
} from '@pli/ui';
import type {
  Abonnement,
  CycleAbonnement,
  Facture,
  ModePaiement,
} from '@pli/types';
import {
  creerFacturationServiceMock,
  type ContexteEntreprise,
  type Tarifs,
} from '../../services/index.js';
import { ProPageHeader } from './_page-header.js';

const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

// TODO(phase-1) — wallet Wave par tenant.
const WALLET_WAVE = '+225 07 23 45 67 89';

function formatFCFA(n: number): string {
  return `${n.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA`;
}

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

const ICON_COMPOSITION: Record<string, IconName> = {
  distribution: 'Send',
  signature: 'PenLine',
  reclamation: 'MessagesSquare',
};

export function ProFacturation() {
  const services = useMemo(() => ({ facturation: creerFacturationServiceMock() }), []);

  const [tarifs, setTarifs] = useState<Tarifs | null>(null);
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('wave');
  const [salariesActifs, setSalariesActifs] = useState(0);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showChangePay, setShowChangePay] = useState(false);
  const [planChoisi, setPlanChoisi] = useState<CycleAbonnement>('mensuel');
  const [modeChoisi, setModeChoisi] = useState<ModePaiement>('wave');

  useEffect(() => {
    void (async () => {
      const [t, ab, f, m, n] = await Promise.all([
        services.facturation.obtenirTarifs(),
        services.facturation.obtenirAbonnement(CONTEXTE_PRO),
        services.facturation.listerFactures(CONTEXTE_PRO),
        services.facturation.obtenirModePaiement(CONTEXTE_PRO),
        services.facturation.compterSalariesActifs(CONTEXTE_PRO),
      ]);
      setTarifs(t);
      setAbonnement(ab);
      setFactures(f);
      setModePaiement(m ?? 'wave');
      setModeChoisi(m ?? 'wave');
      setSalariesActifs(n);
      if (ab) setPlanChoisi(ab.cycle);
    })();
  }, [services]);

  if (!tarifs || !abonnement) {
    return (
      <>
        <ProPageHeader title="Facturation" subtitle="Chargement…" />
        <div className="p-8" />
      </>
    );
  }

  const planMensuel = tarifs.plans.find((p) => p.id === 'mensuel')!;
  const planAnnuel = tarifs.plans.find((p) => p.id === 'annuel')!;
  const planActuel = tarifs.plans.find((p) => p.id === abonnement.cycle)!;

  const montantMensuel = salariesActifs * planMensuel.prixMois;
  const montantAnnuel = salariesActifs * planAnnuel.prixAnnuelEquiv;
  const economieAnnuelle = montantMensuel * 12 - montantAnnuel;

  const enEssai = abonnement.statut === 'essai';
  const essaiTotal = tarifs.essaiBulletins;
  const essaiRestant = abonnement.essaiBulletinsRestants ?? 0;
  const essaiUtilises = essaiTotal - essaiRestant;

  const composition: { id: string; nom: string; prix: number }[] = [
    { id: 'distribution', nom: 'Distribution sécurisée des bulletins', prix: abonnement.composition.distributionFCFA },
    { id: 'signature', nom: 'Signature électronique horodatée', prix: abonnement.composition.signatureFCFA },
    { id: 'reclamation', nom: 'Réclamations & fil de discussion RH', prix: abonnement.composition.reclamationFCFA },
  ];

  const carteEncreStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #15294E 0%, #0F1F3D 100%)',
  };

  return (
    <>
      <ProPageHeader
        title="Facturation"
        subtitle="Plan en cours, prochaine échéance et historique des paiements."
      />

      <div className="p-8 space-y-6">
        {/* Bandeau essai */}
        {enEssai && (
          <Card padding="p-5" className="border-cachet/40">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="h-11 w-11 rounded-md bg-cachet/15 text-cachet flex items-center justify-center shrink-0">
                <Icon name="Sparkles" size={20} />
              </div>
              <div className="flex-1 min-w-[260px]">
                <div
                  className="text-[12px] uppercase tracking-wide text-cachet"
                  style={{ letterSpacing: '.06em' }}
                >
                  Essai gratuit
                </div>
                <div className="text-[18px] font-semibold text-encre">
                  {essaiRestant} bulletins restants sur {essaiTotal}
                </div>
                <p className="text-[13px] text-texte-secondaire mt-1">
                  Vous testez Pli avec les fonctions complètes. Souscrivez avant épuisement pour
                  continuer à distribuer.
                </p>
                <div className="mt-3">
                  <ProgressBar value={essaiUtilises} max={essaiTotal} tone="encre" />
                </div>
              </div>
              <Button
                variant="primary"
                icon="ArrowRight"
                onClick={() => setShowChangePlan(true)}
              >
                Souscrire maintenant
              </Button>
            </div>
          </Card>
        )}

        {/* Plan en cours */}
        <Card
          padding="p-6"
          bg="bg-encre"
          className="text-white border-encre"
          style={carteEncreStyle}
        >
          <div className="flex items-start justify-between flex-wrap gap-5">
            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center gap-2">
                <div
                  className="text-[12px] uppercase tracking-wide text-white/60"
                  style={{ letterSpacing: '.06em' }}
                >
                  Plan en cours
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-cachet/25 text-cachet border border-cachet/30">
                  <Icon name="Check" size={10} />
                  {planActuel.nom.toUpperCase()}
                </span>
              </div>
              <div className="text-[26px] font-semibold mt-1.5">Forfait tout-compris</div>
              <p className="mt-1 text-[13px] text-white/70 max-w-md">
                {planActuel.cycle}. Tarif unique couvrant la distribution, la signature et les
                réclamations.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-white/60">
                Tarif {planActuel.nom.toLowerCase()}
              </div>
              <div className="text-[36px] font-semibold tabular-nums leading-none mt-1">
                {planActuel.prixMois}
                <span className="text-[16px] text-white/70 ml-1">FCFA</span>
              </div>
              <div className="text-[12px] text-white/60 mt-1">par salarié actif / mois</div>
            </div>
          </div>

          {/* Composition */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div
              className="text-[11px] uppercase tracking-wide text-white/55 mb-2"
              style={{ letterSpacing: '.06em' }}
            >
              Ce que comprend le forfait
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {composition.map((c) => (
                <div
                  key={c.id}
                  className="rounded-md bg-white/5 border border-white/10 p-3"
                >
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <Icon
                      name={ICON_COMPOSITION[c.id] ?? 'Check'}
                      size={14}
                      className="text-cachet"
                    />
                    <span className="text-white">{c.nom}</span>
                  </div>
                  <div className="mt-1 text-[16px] font-semibold tabular-nums">
                    +{c.prix} FCFA
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Récap */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] text-white/55">Salariés facturés</div>
              <div className="text-[20px] font-semibold tabular-nums">{salariesActifs}</div>
            </div>
            <div>
              <div className="text-[11px] text-white/55">
                Montant {planActuel.id === 'mensuel' ? 'mensuel' : 'annuel'}
              </div>
              <div className="text-[20px] font-semibold tabular-nums">
                {formatNum(planActuel.id === 'mensuel' ? montantMensuel : montantAnnuel)}{' '}
                <span className="text-[12px] text-white/70 font-normal">FCFA</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-white/55">Prochaine échéance</div>
              <div className="text-[15px] font-semibold tabular-nums">
                {enEssai ? '—' : '01/04/2026'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-white/55">Mode de paiement</div>
              <div className="text-[15px] font-semibold flex items-center gap-1.5">
                <Icon
                  name={modePaiement === 'wave' ? 'Smartphone' : 'Receipt'}
                  size={14}
                  className="text-cachet"
                />
                {modePaiement === 'wave' ? 'Wave' : 'Chèque'}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Button
              variant="secondary"
              icon="ArrowRightLeft"
              onClick={() => setShowChangePlan(true)}
            >
              Changer de plan
            </Button>
            <Button
              variant="secondary"
              icon="Wallet"
              onClick={() => setShowChangePay(true)}
            >
              Changer le mode de paiement
            </Button>
          </div>
        </Card>

        {/* Comparaison plans côte à côte */}
        <Card padding="p-5">
          <h2 className="text-[16px] font-semibold text-encre">Comparaison des plans</h2>
          <p className="text-[12px] text-texte-secondaire">
            Le montant facturé dépend du nombre de salariés actifs ({salariesActifs}{' '}
            actuellement).
          </p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {tarifs.plans.map((p) => {
              const isCurrent = p.id === abonnement.cycle;
              const total = p.id === 'mensuel' ? montantMensuel : montantAnnuel;
              return (
                <div
                  key={p.id}
                  className={`rounded-lg border p-5 transition ${
                    isCurrent ? 'border-encre bg-papier' : 'border-bordure'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[16px] font-semibold text-encre">{p.nom}</h3>
                      {p.remise > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cachet text-white">
                          −{p.remise}%
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <StatusPill tone="succes" size="sm">
                        Plan actuel
                      </StatusPill>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="text-[32px] font-semibold text-encre tabular-nums leading-none">
                      {p.prixMois}
                      <span className="text-[14px] text-texte-secondaire ml-1">FCFA</span>
                    </div>
                    <div className="text-[12px] text-texte-secondaire">
                      par salarié actif / mois
                    </div>
                  </div>
                  <p className="mt-3 text-[12.5px] text-texte-secondaire">{p.description}</p>
                  <div className="mt-4 pt-3 border-t border-bordure text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-texte-secondaire">
                        {p.id === 'mensuel'
                          ? 'Facturé chaque mois'
                          : 'Facturé une fois par an'}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-encre font-medium">
                        {p.id === 'mensuel' ? 'Total mensuel' : 'Total annuel'} pour{' '}
                        {salariesActifs} salariés
                      </span>
                      <span className="text-encre font-semibold tabular-nums">
                        {formatFCFA(total)}
                      </span>
                    </div>
                    {p.id === 'annuel' && (
                      <div className="mt-2 text-[12px] text-succes flex items-center gap-1">
                        <Icon name="TrendingDown" size={12} />
                        Soit ≈ {formatFCFA(economieAnnuelle)} économisés par an (≈ 2 mois
                        offerts)
                      </div>
                    )}
                  </div>
                  {!isCurrent && (
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={async () => {
                          const res = await services.facturation.changerPlan(
                            CONTEXTE_PRO,
                            p.id,
                          );
                          if (res.ok) setAbonnement(res.abonnement);
                        }}
                      >
                        Choisir ce plan
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Liste des factures */}
        <Card padding="p-0">
          <div className="p-5 border-b border-bordure">
            <h2 className="text-[16px] font-semibold text-encre">Historique des paiements</h2>
            <p className="text-[13px] text-texte-secondaire">
              Factures émises et paiements reçus.
            </p>
          </div>
          <Table<Facture>
            columns={[
              {
                label: 'Numéro',
                width: 160,
                render: (r) => <span className="font-mono text-[12.5px]">{r.numero}</span>,
              },
              { label: 'Période', width: 180, render: (r) => r.periode },
              {
                label: 'Salariés',
                width: 100,
                render: (r) => <span className="tabular-nums">{r.salariesFactures}</span>,
              },
              {
                label: 'Émise le',
                width: 140,
                render: (r) => (
                  <span className="text-texte-secondaire tabular-nums">{r.dateEmission}</span>
                ),
              },
              {
                label: 'Mode',
                width: 120,
                render: (r) => (
                  <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                    <Icon
                      name={r.mode === 'Wave' ? 'Smartphone' : 'Receipt'}
                      size={12}
                      className="text-cachet"
                    />
                    {r.mode}
                  </span>
                ),
              },
              {
                label: 'Statut',
                width: 140,
                render: (r) =>
                  r.statut === 'payee' ? (
                    <div>
                      <StatusPill tone="succes" size="sm" icon="Check">
                        Payée
                      </StatusPill>
                      {r.payeLe && (
                        <div className="text-[10.5px] text-texte-secondaire mt-0.5">
                          le {r.payeLe}
                        </div>
                      )}
                    </div>
                  ) : (
                    <StatusPill tone="attente" size="sm">
                      En attente
                    </StatusPill>
                  ),
              },
              {
                label: 'Montant',
                width: 140,
                render: (r) => (
                  <span className="tabular-nums font-medium">{formatFCFA(r.montant)}</span>
                ),
              },
              {
                label: '',
                width: 130,
                render: () => (
                  <div className="flex justify-end gap-1">
                    <IconButton icon="Eye" ariaLabel="Voir" size="sm" />
                    <IconButton icon="Download" ariaLabel="Télécharger" size="sm" />
                  </div>
                ),
              },
            ]}
            data={factures}
          />
        </Card>
      </div>

      {/* Modale : Changer de plan */}
      <Modal
        open={showChangePlan}
        onClose={() => setShowChangePlan(false)}
        title="Changer de plan"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowChangePlan(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon="Check"
              onClick={async () => {
                const res = await services.facturation.changerPlan(CONTEXTE_PRO, planChoisi);
                if (res.ok) setAbonnement(res.abonnement);
                setShowChangePlan(false);
              }}
            >
              Confirmer le changement
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[13px] text-texte-secondaire">
            Choisissez le plan adapté à votre rythme de facturation. Le passage à l'annuel donne
            accès à une réduction de 15 %.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tarifs.plans.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setPlanChoisi(p.id)}
                className={`text-left rounded-lg border p-4 transition ${
                  planChoisi === p.id
                    ? 'border-encre bg-papier'
                    : 'border-bordure hover:border-[#B8C0CE]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[15px] font-semibold text-encre">{p.nom}</h3>
                  {p.remise > 0 && (
                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-cachet text-white">
                      −{p.remise}%
                    </span>
                  )}
                </div>
                <div className="text-[24px] font-semibold text-encre tabular-nums">
                  {p.prixMois}
                  <span className="text-[12px] text-texte-secondaire ml-1">
                    FCFA / salarié / mois
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-texte-secondaire">{p.cycle}</div>
                <div className="mt-3 pt-2 border-t border-bordure text-[12px] flex justify-between">
                  <span className="text-texte-secondaire">Pour {salariesActifs} salariés</span>
                  <span className="font-semibold text-encre tabular-nums">
                    {formatFCFA(p.id === 'mensuel' ? montantMensuel : montantAnnuel)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modale : Changer le mode de paiement */}
      <Modal
        open={showChangePay}
        onClose={() => setShowChangePay(false)}
        title="Mode de paiement"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowChangePay(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon="Check"
              onClick={async () => {
                const res = await services.facturation.changerModePaiement(
                  CONTEXTE_PRO,
                  modeChoisi,
                );
                if (res.ok) setModePaiement(res.mode);
                setShowChangePay(false);
              }}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[13px] text-texte-secondaire">
            Sélectionnez votre moyen de règlement.
          </p>
          <div className="space-y-2">
            {(
              [
                {
                  id: 'wave' as ModePaiement,
                  icon: 'Smartphone' as IconName,
                  nom: 'Wave',
                  desc: 'Paiement instantané via Mobile Money',
                  complement: `Wallet : ${WALLET_WAVE}`,
                },
                {
                  id: 'cheque' as ModePaiement,
                  icon: 'Receipt' as IconName,
                  nom: 'Chèque',
                  desc: "À l'ordre de Pli SARL — encaissé sous 5 jours ouvrés",
                  complement: 'Adresse de remise communiquée par e-mail',
                },
              ] as const
            ).map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setModeChoisi(m.id)}
                className={`w-full text-left rounded-lg border p-4 flex items-start gap-3 transition ${
                  modeChoisi === m.id
                    ? 'border-encre bg-papier'
                    : 'border-bordure hover:border-[#B8C0CE]'
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${
                    modeChoisi === m.id ? 'bg-encre text-white' : 'bg-surface text-encre'
                  }`}
                >
                  <Icon name={m.icon} size={16} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-encre">{m.nom}</div>
                  <div className="text-[12.5px] text-texte-secondaire">{m.desc}</div>
                  <div className="text-[11.5px] text-texte-secondaire mt-1 font-mono">
                    {m.complement}
                  </div>
                </div>
                {modeChoisi === m.id && (
                  <Icon name="CircleCheckBig" size={16} className="text-succes mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
