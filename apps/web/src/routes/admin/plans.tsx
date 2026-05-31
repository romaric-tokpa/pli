// AdminPlans — Plans & tarifs (sub-lot 12c).
//
// SOURCE UNIQUE 275 FCFA via `FacturationService.obtenirTarifs()` — couverte
// par le contrat `suiteContratFacturation` (composition 150 + 75 + 50).
// Cette page affiche, pas définit : changer un tarif passera par une action
// admin dédiée en Phase 1 (et sera journalisée).

import { useEffect, useMemo, useState } from 'react';
import type { Tarifs } from '../../services/index.js';
import { Card, Icon, KPICard } from '@pli/ui';
import {
  creerFacturationServiceMock,
  creerAdminServiceMock,
  type ContexteAdmin,
} from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';
import type { MetriquesEntreprisePlateforme } from '@pli/types';

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

export function AdminPlans() {
  const services = useMemo(
    () => ({
      facturation: creerFacturationServiceMock(),
      admin: creerAdminServiceMock(),
    }),
    [],
  );
  const [tarifs, setTarifs] = useState<Tarifs | null>(null);
  const [mets, setMets] = useState<MetriquesEntreprisePlateforme[]>([]);

  useEffect(() => {
    void (async () => {
      const [t, m] = await Promise.all([
        services.facturation.obtenirTarifs(),
        services.admin.listerMetriquesEntreprises(CONTEXTE_DEMO),
      ]);
      setTarifs(t);
      setMets(m);
    })();
  }, [services]);

  if (!tarifs) {
    return (
      <div className="p-12">
        <Card padding="p-6">
          <div className="h-6 w-48 bg-surface rounded animate-pulse" />
        </Card>
      </div>
    );
  }

  const entsMensuel = mets.filter((m) => m.planId === 'mensuel').length;
  const entsAnnuel = mets.filter((m) => m.planId === 'annuel').length;
  const entsEssai = mets.filter((m) => m.mrr === 0).length;

  return (
    <>
      <AdminPageHeader
        title="Plans & tarifs"
        subtitle="Modèle économique unique de la plateforme — forfait 275 FCFA / salarié actif / mois"
      />

      <div className="p-8 space-y-6">
        {/* Composition du forfait */}
        <Card padding="p-5">
          <h2 className="text-[16px] font-semibold text-encre">
            Composition du forfait — 275 FCFA = 150 + 75 + 50
          </h2>
          <p className="text-[12.5px] text-texte-secondaire mt-1">
            Transparence sur le découpage de la valeur facturée mensuellement.
          </p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-md border border-bordure p-4 bg-papier">
              <div className="flex items-center gap-2 text-encre">
                <Icon name="Send" size={16} className="text-encre" />
                <strong className="text-[13.5px]">Distribution des bulletins</strong>
              </div>
              <div className="mt-3 text-[28px] font-semibold text-encre tabular-nums">
                {tarifs.composition.distributionFCFA}
                <span className="text-[12px] text-texte-secondaire ml-1.5">FCFA</span>
              </div>
              <div className="text-[11.5px] text-texte-secondaire mt-0.5">
                {Math.round((tarifs.composition.distributionFCFA / tarifs.forfaitMois) * 100)}%
                du forfait
              </div>
            </div>
            <div className="rounded-md border border-bordure p-4 bg-papier">
              <div className="flex items-center gap-2 text-encre">
                <Icon name="PenLine" size={16} className="text-cachet" />
                <strong className="text-[13.5px]">Signature électronique</strong>
              </div>
              <div className="mt-3 text-[28px] font-semibold text-encre tabular-nums">
                {tarifs.composition.signatureFCFA}
                <span className="text-[12px] text-texte-secondaire ml-1.5">FCFA</span>
              </div>
              <div className="text-[11.5px] text-texte-secondaire mt-0.5">
                {Math.round((tarifs.composition.signatureFCFA / tarifs.forfaitMois) * 100)}% du
                forfait
              </div>
            </div>
            <div className="rounded-md border border-bordure p-4 bg-papier">
              <div className="flex items-center gap-2 text-encre">
                <Icon name="MessageSquareWarning" size={16} className="text-info" />
                <strong className="text-[13.5px]">Réclamations & fil RH</strong>
              </div>
              <div className="mt-3 text-[28px] font-semibold text-encre tabular-nums">
                {tarifs.composition.reclamationFCFA}
                <span className="text-[12px] text-texte-secondaire ml-1.5">FCFA</span>
              </div>
              <div className="text-[11.5px] text-texte-secondaire mt-0.5">
                {Math.round((tarifs.composition.reclamationFCFA / tarifs.forfaitMois) * 100)}%
                du forfait
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-bordure flex items-center gap-3 text-[12px] text-texte-secondaire">
            <Icon name="ShieldCheck" size={13} className="text-succes" />
            Toute évolution du forfait est journalisée — vue type «&nbsp;plan&nbsp;» dans
            le journal d'audit.
          </div>
        </Card>

        {/* Plans tarifaires (cycle) */}
        <Card padding="p-5">
          <h2 className="text-[16px] font-semibold text-encre">Cycles de facturation</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {tarifs.plans.map((p) => (
              <div
                key={p.id}
                className={`rounded-lg border p-5 ${p.id === 'mensuel' ? 'border-bordure bg-white' : 'border-cachet/30 bg-cachet/5'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[18px] font-semibold text-encre">{p.nom}</div>
                    <div className="text-[12px] text-texte-secondaire mt-0.5">
                      {p.description}
                    </div>
                  </div>
                  {p.remise > 0 && (
                    <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded bg-cachet/15 text-cachet font-medium">
                      −{p.remise} %
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-[36px] font-semibold text-encre tabular-nums">
                    {p.prixMois}
                  </span>
                  <span className="text-[14px] text-texte-secondaire">FCFA</span>
                  <span className="text-[12px] text-texte-secondaire ml-1">
                    / salarié / mois
                  </span>
                </div>
                <div className="mt-1 text-[11.5px] text-texte-secondaire tabular-nums">
                  Équivalent annuel : {formatNum(p.prixAnnuelEquiv)} FCFA / salarié
                </div>
                <div className="mt-5 pt-4 border-t border-bordure">
                  <div className="text-[11px] uppercase tracking-wide text-texte-secondaire mb-2"
                       style={{ letterSpacing: '.05em' }}>
                    Adoption
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="Building2" size={14} className="text-texte-secondaire" />
                    <strong className="text-encre tabular-nums">
                      {p.id === 'mensuel' ? entsMensuel : entsAnnuel}
                    </strong>
                    <span className="text-[12px] text-texte-secondaire">
                      entreprise{(p.id === 'mensuel' ? entsMensuel : entsAnnuel) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Essai gratuit */}
        <Card padding="p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="h-11 w-11 rounded-md bg-info/15 text-info flex items-center justify-center shrink-0">
              <Icon name="Sparkles" size={20} />
            </div>
            <div className="flex-1 min-w-[240px]">
              <h2 className="text-[15px] font-semibold text-encre">
                Essai gratuit — 20 bulletins offerts
              </h2>
              <p className="text-[12.5px] text-texte-secondaire mt-1">
                Toute nouvelle entreprise bénéficie de 20 bulletins gratuits à l'inscription,
                soit ≈ {formatNum(20 * 150)} FCFA de valeur de distribution. Permet de tester
                la distribution+consultation avant de souscrire.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KPICard label="En essai" value={entsEssai} icon="Clock" tone="info" />
              <KPICard
                label="Coût offert / entreprise"
                value={`${formatNum(20 * 150)} FCFA`}
                icon="Gift"
                tone="neutre"
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
