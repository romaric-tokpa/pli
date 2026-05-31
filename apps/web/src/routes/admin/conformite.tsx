// AdminConformite — hébergement, certificat, rétention, RGPD (sub-lot 12d).
// Porté de _wireframe/src/admin-ops.jsx (AdminConformite).
//
// LIBELLÉS JURIDIQUES VERROUILLÉS (CLAUDE.md — décisions wireframe) :
//   ✓ « validation horodatée »     (Phase 0 : horodatage certifié, signature avancée à venir)
//   ✓ « Conformité ARTCI »           (hébergement Côte d'Ivoire)
//   ✓ « tant que le compte est actif » (rétention bulletins)
//   ✗ « valeur probante »             (interdit Phase 0)
//   ✗ « à vie »                        (interdit — rétention conditionnelle)
//
// Vérifié par `admin-conformite-libelles.test.tsx` (présence + absence).
//
// Action sensible journalisée : « Traiter une demande RGPD ».

import { useEffect, useMemo, useState } from 'react';
import type { Conformite } from '@pli/types';
import {
  Button,
  Card,
  Icon,
  IconButton,
  StatusPill,
  useToast,
  type IconName,
} from '@pli/ui';
import { creerAdminServiceMock, type ContexteAdmin } from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

export function AdminConformite() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);
  const pousser = useToast();

  const [conformite, setConformite] = useState<Conformite | null>(null);

  useEffect(() => {
    void (async () => {
      const c = await services.admin.obtenirConformite(CONTEXTE_DEMO);
      setConformite(c);
    })();
  }, [services]);

  const traiterDemande = async (demandeId: string) => {
    await services.admin.traiterDemandeRgpd(CONTEXTE_DEMO, demandeId);
    pousser({ message: 'Demande RGPD marquée comme traitée', tone: 'succes' });
  };

  if (!conformite) {
    return (
      <>
        <AdminPageHeader title="Conformité & sécurité" />
        <div className="p-12">
          <Card padding="p-6">
            <div className="h-6 w-48 bg-surface rounded animate-pulse" />
          </Card>
        </div>
      </>
    );
  }

  const expireBientot = conformite.certificatSignature.joursAvantExpiration < 120;

  return (
    <>
      <AdminPageHeader
        title="Conformité & sécurité"
        subtitle="Hébergement, certificat de signature, rétention, demandes RGPD"
        actions={
          <Button variant="secondary" icon="Download">
            Export de conformité
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Hébergement & souveraineté — verrouille « Conformité ARTCI » */}
        <Card padding="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-md bg-succes/15 text-succes flex items-center justify-center">
              <Icon name="ShieldCheck" size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-encre">
                  Hébergement & souveraineté
                </h2>
                <StatusPill tone="succes" size="sm">
                  Conforme
                </StatusPill>
              </div>
              <p className="text-[13px] text-texte-secondaire mt-1">
                Toutes les données sont hébergées en Côte d'Ivoire conformément à la{' '}
                <strong className="text-encre">Conformité ARTCI</strong>.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-[13px]">
                <div>
                  <span className="text-texte-secondaire">Fournisseur : </span>
                  <strong className="text-encre">{conformite.hebergement.fournisseur}</strong>
                </div>
                <div>
                  <span className="text-texte-secondaire">Ville : </span>
                  {conformite.hebergement.ville}
                </div>
                <div>
                  <span className="text-texte-secondaire">Certification : </span>
                  {conformite.hebergement.certification}
                </div>
                <div>
                  <span className="text-texte-secondaire">Convention signée le : </span>
                  {conformite.hebergement.dateConvention}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Certificat signature — verrouille « validation horodatée » */}
        <Card padding="p-6" className={expireBientot ? 'border-attente/30' : ''}>
          <div className="flex items-start gap-4">
            <div
              className={`h-12 w-12 rounded-md flex items-center justify-center ${expireBientot ? 'bg-attente/15 text-attente' : 'bg-succes/15 text-succes'}`}
            >
              <Icon name="BadgeCheck" size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[16px] font-semibold text-encre">
                  Certificat de signature électronique
                </h2>
                <StatusPill tone={expireBientot ? 'attente' : 'succes'} size="sm">
                  {conformite.certificatSignature.statut}
                </StatusPill>
                {expireBientot && (
                  <span className="text-[11.5px] text-attente">
                    Expire dans {conformite.certificatSignature.joursAvantExpiration} jours
                  </span>
                )}
              </div>
              <p className="text-[13px] text-texte-secondaire mt-1">
                Utilisé pour la <strong className="text-encre">validation horodatée</strong>{' '}
                de chaque bulletin distribué. Horodatage certifié — signature avancée à
                venir (Phase 1, partenaire signataire).
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-[13px]">
                <div>
                  <span className="text-texte-secondaire">Fournisseur : </span>
                  <strong className="text-encre">
                    {conformite.certificatSignature.fournisseur}
                  </strong>
                </div>
                <div>
                  <span className="text-texte-secondaire">Numéro de série : </span>
                  <span className="font-mono">{conformite.certificatSignature.serie}</span>
                </div>
                <div>
                  <span className="text-texte-secondaire">Délivré le : </span>
                  {conformite.certificatSignature.delivreLe}
                </div>
                <div>
                  <span className="text-texte-secondaire">Expire le : </span>
                  <strong className={expireBientot ? 'text-attente' : 'text-encre'}>
                    {conformite.certificatSignature.expireLe}
                  </strong>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="secondary" size="sm" icon="ArrowRightLeft">
                  Renouveler
                </Button>
                <Button variant="ghost" size="sm" icon="Download">
                  Télécharger
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Rétention + RGPD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card padding="p-5">
            <h2 className="text-[16px] font-semibold text-encre">
              Politique de rétention
            </h2>
            <p className="text-[12.5px] text-texte-secondaire">
              Durées de conservation par type de donnée
            </p>
            <div className="mt-4 space-y-2 divide-y divide-bordure">
              {(
                [
                  ['Bulletins de paie', conformite.retention.bulletins, 'FileText'],
                  ["Journal d'audit", conformite.retention.audit, 'ScrollText'],
                  ['Sessions actives', conformite.retention.sessions, 'MonitorSmartphone'],
                ] as const
              ).map(([titre, valeur, icon]) => (
                <div key={titre} className="flex items-center gap-3 py-3">
                  <div className="h-9 w-9 rounded-md bg-surface flex items-center justify-center text-encre">
                    <Icon name={icon as IconName} size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium text-encre">{titre}</div>
                  </div>
                  <span className="text-[13px] font-medium text-encre tabular-nums">
                    {valeur}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="p-5">
            <h2 className="text-[16px] font-semibold text-encre">Demandes RGPD</h2>
            <p className="text-[12.5px] text-texte-secondaire">
              Accès, suppression, portabilité
            </p>
            <div className="mt-3 divide-y divide-bordure">
              {conformite.demandesRgpd.map((d) => (
                <div key={d.id} className="flex items-center gap-3 py-3">
                  <div className="h-9 w-9 rounded-md bg-surface flex items-center justify-center text-encre">
                    <Icon name="UserCheck" size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium text-encre">
                      {d.type} — {d.demandeur}
                    </div>
                    <div className="text-[11.5px] text-texte-secondaire">
                      {d.entreprise} · le {d.date}
                    </div>
                  </div>
                  {d.statut === 'traitee' ? (
                    <StatusPill tone="succes" size="sm">
                      Traitée
                    </StatusPill>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="Check"
                      onClick={() => traiterDemande(d.id)}
                    >
                      Traiter
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Exports de conformité */}
        <Card padding="p-5">
          <h2 className="text-[16px] font-semibold text-encre">
            Exports de conformité
          </h2>
          <p className="text-[12.5px] text-texte-secondaire">
            Documents prêts à l'audit (CNDP, commissaire aux comptes…)
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {(
              [
                ['Registre des traitements', 'PDF · 18 pages', 'FileText'],
                ['Politique de sécurité', 'PDF · 24 pages', 'ShieldCheck'],
                ['Mesures techniques', 'PDF · 12 pages', 'ScrollText'],
              ] as const
            ).map(([t, d, ic]) => (
              <div
                key={t}
                className="rounded-md border border-bordure p-4 flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded bg-surface text-encre flex items-center justify-center">
                  <Icon name={ic as IconName} size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-medium text-encre">{t}</div>
                  <div className="text-[11.5px] text-texte-secondaire">{d}</div>
                </div>
                <IconButton icon="Download" ariaLabel="Télécharger" size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
