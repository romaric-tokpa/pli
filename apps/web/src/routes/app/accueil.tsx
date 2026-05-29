// Accueil mobile salarié — port verbatim de _wireframe/src/mobile-coffre.jsx
// (MobileAccueil).
//
// Invariant CLAUDE.md « net jamais en liste/carte/résumé » : porté par le
// type `BulletinCoffreResume = Omit<BulletinCoffre, 'brut'|'cnps'|'its'|'net'>`.
// L'écran ne lit JAMAIS ces 4 champs — le compilateur en empêche l'accès.
//
// Toutes les données passent par `CoffreService` (scoping `ContextePersonnel`,
// agrégation multi-employeurs autorisée — invariant CLAUDE.md 5).

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Icon, SealIcon, StatusPill } from '@pli/ui';
import type {
  BulletinCoffre,
  ComptePersonnel,
  Rattachement,
} from '@pli/types';
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

function comparerPeriodes(a: string, b: string): number {
  // Format "YYYY-MM" — comparaison lexicographique = comparaison chronologique.
  return b.localeCompare(a);
}

export function MobileAccueil() {
  const services = useMemo(() => ({ coffre: creerCoffreServiceMock() }), []);
  const [compte, setCompte] = useState<ComptePersonnel | null>(null);
  const [rattachements, setRattachements] = useState<Rattachement[]>([]);
  const [bulletins, setBulletins] = useState<BulletinCoffreResume[]>([]);

  useEffect(() => {
    void (async () => {
      const [c, r, b] = await Promise.all([
        services.coffre.obtenirCompte(CONTEXTE_SALARIE),
        services.coffre.listerRattachements(CONTEXTE_SALARIE),
        services.coffre.listerBulletins(CONTEXTE_SALARIE),
      ]);
      setCompte(c);
      setRattachements(r);
      setBulletins(b);
    })();
  }, [services]);

  const ratActuel = rattachements.find((r) => r.statut === 'actif');
  const ratsAnciens = rattachements.filter((r) => r.statut !== 'actif');

  const bulletinsTries = useMemo(
    () => [...bulletins].sort((a, b) => comparerPeriodes(a.periode, b.periode)),
    [bulletins],
  );
  const bulletinDernier = bulletinsTries[0];
  const bulletinsRecents = bulletinsTries.slice(0, 3);

  const ratParId = useMemo(() => {
    const map: Record<string, Rattachement> = {};
    for (const r of rattachements) map[r.id] = r;
    return map;
  }, [rattachements]);

  return (
    <>
      {/* Bandeau salutation */}
      <div className="px-5 pt-4 pb-3 bg-encre text-white shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] text-white/70">Bonjour,</div>
            <div className="text-[20px] font-semibold">{compte?.prenom ?? 'Aya'}</div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/app/notifications"
              className="relative h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition"
            >
              <Icon name="Bell" size={18} />
              <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-cachet" />
            </Link>
            <Link
              to="/app/profil"
              className="h-10 w-10 rounded-full flex items-center justify-center"
            >
              <Avatar
                name={compte ? `${compte.prenom} ${compte.nom}` : 'Aya Koffi'}
                size={36}
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Alerte nouveau bulletin */}
        {bulletinDernier && (
          <div className="px-5 pt-4">
            <Link
              to={`/app/bulletin/${bulletinDernier.id}`}
              className="block rounded-xl p-4 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #B85737 0%, #9F4A2F 100%)' }}
            >
              <div className="absolute -right-6 -bottom-6 opacity-15">
                <SealIcon size={140} variant="blanc" />
              </div>
              <div className="relative">
                <div
                  className="flex items-center gap-2 text-[11.5px] uppercase tracking-wide text-white/80"
                  style={{ letterSpacing: '.05em' }}
                >
                  <Icon name="BellRing" size={13} />
                  Nouveau bulletin disponible
                </div>
                <div className="mt-2 text-[20px] font-semibold leading-tight">
                  Bulletin de {bulletinDernier.periodeLibelle}
                </div>
                <div className="mt-1 text-[13px] text-white/85">
                  {bulletinDernier.employeurNom}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-white text-encre text-[13px] font-medium"
                  >
                    <Icon name="FileText" size={14} />
                    Ouvrir le bulletin
                  </button>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Accès rapides */}
        <div className="px-5 mt-5 grid grid-cols-3 gap-2.5">
          {(
            [
              { icon: 'Vault', label: 'Coffre-fort', to: '/app/coffre' },
              { icon: 'History', label: 'Historique', to: '/app/coffre' },
              {
                icon: 'MessageSquareWarning',
                label: 'Signaler',
                to: '/app/reclamation/nouvelle',
              },
            ] as const
          ).map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="rounded-lg bg-white border border-bordure py-3 flex flex-col items-center justify-center gap-1.5 hover:bg-surface transition"
            >
              <Icon name={a.icon} size={20} className="text-encre" />
              <span className="text-[11.5px] font-medium text-encre text-center">
                {a.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Vos employeurs (résumé) */}
        {ratsAnciens.length > 0 && (
          <div className="px-5 mt-5">
            <div className="rounded-lg bg-white border border-bordure p-3.5">
              <div className="flex items-center justify-between">
                <div
                  className="text-[12px] uppercase tracking-wide text-texte-secondaire"
                  style={{ letterSpacing: '.05em' }}
                >
                  Vos employeurs
                </div>
                <Link
                  to="/app/profil"
                  className="text-[11.5px] text-encre hover:underline inline-flex items-center gap-1"
                >
                  Gérer
                  <Icon name="ChevronRight" size={11} />
                </Link>
              </div>
              <div className="mt-2.5 space-y-2">
                {ratActuel && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre">
                      <Icon name="Building2" size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-encre truncate">
                        {ratActuel.entrepriseNom}
                      </div>
                      <div className="text-[11px] text-texte-secondaire">
                        Employeur actuel · {ratActuel.service}
                      </div>
                    </div>
                    <StatusPill tone="succes" size="sm">
                      Actuel
                    </StatusPill>
                  </div>
                )}
                {ratsAnciens.map((r) => (
                  <div key={r.id} className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-surface flex items-center justify-center text-texte-secondaire">
                      <Icon name="Archive" size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-encre truncate">
                        {r.entrepriseNom}
                      </div>
                      <div className="text-[11px] text-texte-secondaire">
                        Jusqu'au {r.dateFin}
                      </div>
                    </div>
                    <StatusPill tone="neutre" size="sm">
                      Archivé
                    </StatusPill>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dernière activité */}
        <div className="px-5 mt-5 mb-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-encre">Dernière activité</h3>
            <Link
              to="/app/coffre"
              className="text-[12px] text-texte-secondaire hover:text-encre"
            >
              Voir tout
            </Link>
          </div>
          <div className="mt-2.5 space-y-1.5">
            {bulletinsRecents.map((b) => {
              const rat = ratParId[b.rattachementId];
              const stat = statutDeBulletin(b);
              return (
                <Link
                  key={b.id}
                  to={`/app/bulletin/${b.id}`}
                  className="flex items-center gap-3 rounded-lg bg-white border border-bordure p-3 hover:border-encre transition"
                >
                  <div className="h-10 w-10 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre shrink-0">
                    <Icon name="FileText" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium text-encre">
                      {b.periodeLibelle}
                    </div>
                    <div className="text-[11.5px] text-texte-secondaire truncate">
                      {rat?.entrepriseNom}
                    </div>
                  </div>
                  <StatusPill tone={toneStatut(stat)} size="sm">
                    {libelleStatut(stat)}
                  </StatusPill>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
