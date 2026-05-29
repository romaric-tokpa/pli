// Profil mobile — port focalisé de _wireframe/src/mobile-other.jsx (MobileProfil).
// Bandeau encre + bloc « Mes employeurs » (cœur de la fonctionnalité,
// l'agrégation multi-employeurs visible côté salarié). Réglages détaillés
// (édition photo, paramètres, sessions) en sub-lot 10c+ si besoin.

import { useEffect, useMemo, useState } from 'react';
import { Avatar, Icon, StatusPill } from '@pli/ui';
import type { ComptePersonnel, Rattachement } from '@pli/types';
import {
  creerCoffreServiceMock,
  type ContextePersonnel,
} from '../../services/index.js';

const CONTEXTE_SALARIE: ContextePersonnel = {
  type: 'personnel',
  comptePersonnelId: 'cp-aya',
};

export function MobileProfil() {
  const services = useMemo(() => ({ coffre: creerCoffreServiceMock() }), []);
  const [compte, setCompte] = useState<ComptePersonnel | null>(null);
  const [rattachements, setRattachements] = useState<Rattachement[]>([]);

  useEffect(() => {
    void (async () => {
      const [c, r] = await Promise.all([
        services.coffre.obtenirCompte(CONTEXTE_SALARIE),
        services.coffre.listerRattachements(CONTEXTE_SALARIE),
      ]);
      setCompte(c);
      setRattachements(r);
    })();
  }, [services]);

  const ratActuel = rattachements.find((r) => r.statut === 'actif');
  const ratsAnciens = rattachements.filter((r) => r.statut !== 'actif');
  const totalEmployeurs = (ratActuel ? 1 : 0) + ratsAnciens.length;

  return (
    <>
      <div className="px-5 pt-4 pb-5 shrink-0 bg-encre text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-semibold">Mon profil</h1>
          <button
            type="button"
            className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center"
            aria-label="Paramètres"
          >
            <Icon name="Settings" size={16} />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Avatar
            name={compte ? `${compte.prenom} ${compte.nom}` : 'Aya Koffi'}
            size={64}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">
              {compte?.prenom} {compte?.nom}
            </div>
            <div className="text-[12px] text-white/70 truncate">
              {ratActuel?.poste ?? 'Salariée'}
            </div>
            <div className="text-[11.5px] text-white/60 truncate">
              Compte créé le {compte?.dateCreation}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-3">
        <section className="px-5 pt-5">
          <div className="flex items-center justify-between mb-2">
            <div
              className="text-[11px] uppercase tracking-wide text-texte-secondaire"
              style={{ letterSpacing: '.06em' }}
            >
              Mes employeurs
            </div>
            <span className="text-[11px] text-texte-secondaire">
              {totalEmployeurs} au total
            </span>
          </div>
          <div className="rounded-lg bg-white border border-bordure divide-y divide-bordure">
            {ratActuel && (
              <div className="px-4 py-3.5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-encre text-white flex items-center justify-center shrink-0">
                  <Icon name="Building2" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[13.5px] font-semibold text-encre truncate">
                      {ratActuel.entrepriseNom}
                    </div>
                    <StatusPill tone="succes" size="sm">
                      Actuel
                    </StatusPill>
                  </div>
                  <div className="text-[11.5px] text-texte-secondaire mt-0.5">
                    {ratActuel.poste} · {ratActuel.service}
                  </div>
                  <div className="text-[11px] text-texte-secondaire">
                    Depuis le {ratActuel.dateDebut} · matricule {ratActuel.matricule}
                  </div>
                </div>
              </div>
            )}
            {ratsAnciens.map((r) => (
              <div key={r.id} className="px-4 py-3.5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-surface flex items-center justify-center text-texte-secondaire shrink-0">
                  <Icon name="Archive" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[13.5px] font-semibold text-encre truncate">
                      {r.entrepriseNom}
                    </div>
                    <StatusPill tone="neutre" size="sm" icon="Archive">
                      Archivé
                    </StatusPill>
                  </div>
                  <div className="text-[11.5px] text-texte-secondaire mt-0.5">
                    {r.poste} · {r.service}
                  </div>
                  <div className="text-[11px] text-texte-secondaire">
                    {r.dateDebut} → {r.dateFin} · matricule {r.matricule}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-md bg-papier border border-bordure p-3 flex items-start gap-2 text-[11.5px] text-texte-secondaire">
            <Icon name="ShieldCheck" size={12} className="text-encre shrink-0 mt-0.5" />
            <div>
              Vos employeurs ne se voient pas entre eux. Seul vous voyez l'agrégation de
              tous vos bulletins.
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
