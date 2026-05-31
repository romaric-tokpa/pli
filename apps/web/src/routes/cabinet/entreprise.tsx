// CabinetEntreprise — espace scellé d'une entreprise du portefeuille.
//
// Sub-lot 11b — version minimale qui pose les invariants :
//
//   1. GARDE DE PONT : avant de rendre quoi que ce soit, appelle
//      `appartientAuPortefeuille(ctx, id)`. Si l'entreprise n'appartient PAS
//      au portefeuille du cabinet courant, on rend un EmptyState
//      « Entreprise introuvable » avec un retour au portefeuille — JAMAIS
//      d'accès aux données. L'invariant cloisonnement CLAUDE.md 5 est porté
//      ici à l'écran : un id forgé dans l'URL ne traverse pas.
//
//   2. ACTIVATION DE LA CONTEXTBAR : une fois la garde franchie, on récupère
//      l'entreprise et on appelle `setEntrepriseActive(e)` via le contexte
//      Outlet du `CabinetLayout`. La topbar standard est remplacée par la
//      bande Encre « Revenir au portefeuille — Vous gérez : <Nom> ».
//
// Les actions principales (Salariés / Upload bulletins / Suivi / Réclamations),
// la table d'aperçu et la modale d'invitation arrivent au sub-lot 11c.

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Entreprise, MetriquesPortefeuilleEntreprise } from '@pli/types';
import { Button, Card, EmptyState, Icon, KPICard } from '@pli/ui';
import {
  creerCabinetsServiceMock,
  type ContextePortefeuilleCabinet,
} from '../../services/index.js';
import { useCabinetOutletContext } from './_layout.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant()
const CONTEXTE_DEMO: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: 'cab-ebrie',
};

type EtatGarde = 'verification' | 'autorise' | 'refuse';

export function CabinetEntreprise() {
  const { id } = useParams<{ id: string }>();
  const services = useMemo(() => ({ cabinets: creerCabinetsServiceMock() }), []);
  const { setEntrepriseActive } = useCabinetOutletContext();

  const [etat, setEtat] = useState<EtatGarde>('verification');
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [metriques, setMetriques] = useState<MetriquesPortefeuilleEntreprise | null>(null);

  useEffect(() => {
    if (!id) {
      setEtat('refuse');
      return;
    }
    let actif = true;
    void (async () => {
      // GARDE DE PONT — le service est l'unique source de vérité du
      // cloisonnement. Un `true` est le seul ticket d'entrée.
      const autorise = await services.cabinets.appartientAuPortefeuille(CONTEXTE_DEMO, id);
      if (!actif) return;
      if (!autorise) {
        setEtat('refuse');
        return;
      }
      const [portefeuille, mets] = await Promise.all([
        services.cabinets.obtenirPortefeuille(CONTEXTE_DEMO),
        services.cabinets.obtenirMetriquesPortefeuille(CONTEXTE_DEMO),
      ]);
      if (!actif) return;
      const e = portefeuille.find((x) => x.id === id) ?? null;
      const m = mets.find((x) => x.entrepriseId === id) ?? null;
      setEntreprise(e);
      setMetriques(m);
      setEtat('autorise');
    })();
    return () => {
      actif = false;
    };
  }, [id, services]);

  // Active la contextbar uniquement quand l'entrée est autorisée — un id
  // forgé ne doit pas faire basculer le layout.
  useEffect(() => {
    if (etat === 'autorise' && entreprise) {
      setEntrepriseActive(entreprise);
      return () => setEntrepriseActive(null);
    }
    return undefined;
  }, [etat, entreprise, setEntrepriseActive]);

  if (etat === 'verification') {
    return (
      <div className="p-12" aria-hidden>
        <Card padding="p-6">
          <div className="h-6 w-48 bg-surface rounded animate-pulse" />
        </Card>
      </div>
    );
  }

  if (etat === 'refuse' || !entreprise) {
    return (
      <div className="p-12" data-testid="cabinet-entreprise-introuvable">
        <EmptyState
          icon="Building2"
          title="Entreprise introuvable"
          description="Cette entreprise ne fait pas partie de votre portefeuille."
          action={
            <Link
              to="/cabinet"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-encre text-white text-[13px] font-medium hover:bg-[#0F1F3D] transition"
            >
              <Icon name="ArrowLeft" size={13} />
              Retour au portefeuille
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* KPIs entreprise — AUCUN MONTANT. Effectif, bulletins du mois,
          taux de consultation, relances. */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard
          label="Salariés actifs"
          value={metriques?.salaries ?? 0}
          icon="Users"
          tone="info"
        />
        <KPICard
          label="Bulletins ce mois"
          value={metriques?.bulletinsMois ?? 0}
          icon="FileText"
          tone="neutre"
        />
        <KPICard
          label="Taux de consultation"
          value={`${Math.round((metriques?.consultation ?? 0) * 100)}%`}
          icon="Eye"
          tone="succes"
        />
        <KPICard
          label="Relances en attente"
          value={metriques?.relancesEnAttente ?? 0}
          icon="BellRing"
          tone="attente"
        />
      </div>

      {/* Bandeau cloisonnement — invariant à l'écran. */}
      <Card padding="p-4" className="border-bordure" bg="bg-papier">
        <div className="flex items-start gap-3 text-[12.5px] text-texte-secondaire">
          <Icon name="ShieldCheck" size={14} className="text-succes shrink-0 mt-0.5" />
          <div>
            <strong className="text-encre">Cloisonnement strict.</strong> Vous ne voyez que{' '}
            {entreprise.nom}. Les autres entreprises de votre portefeuille restent invisibles
            depuis cet écran. Le salarié ne sait pas qu'un cabinet opère pour son employeur —
            l'identité affichée reste {entreprise.nom}.
          </div>
        </div>
      </Card>

      {/* Placeholder 11c — les actions principales et l'aperçu du registre
          arrivent au prochain sub-lot. */}
      <Card padding="p-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre shrink-0">
            <Icon name="LogIn" size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-semibold text-encre">
              Entrée scellée vers {entreprise.nom}
            </h2>
            <p className="mt-1 text-[13px] text-texte-secondaire">
              La garde de pont a accepté l'entrée — cette entreprise appartient au
              portefeuille de votre cabinet. La contextbar Encre en haut de page le
              confirme. Les actions principales (Salariés, Upload bulletins, Suivi,
              Réclamations), l'aperçu du registre et l'avertissement « lecture seule » si
              vous n'êtes pas affecté arrivent au sub-lot 11c.
            </p>
            <div className="mt-4">
              <Button
                variant="secondary"
                icon="ArrowLeft"
                onClick={() => {
                  window.location.assign('/cabinet');
                }}
              >
                Revenir au portefeuille
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
