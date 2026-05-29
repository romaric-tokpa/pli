// Viewer bulletin mobile — port verbatim de _wireframe/src/mobile-bulletin.jsx
// (MobileBulletin).
//
// SEULE EXCEPTION à l'invariant « net jamais visible » sur la surface mobile :
// le viewer affiche le bulletin entier, montants compris. La frontière est
// PORTÉE PAR LE TYPE :
//   - liste/coffre → `BulletinCoffreResume` (Omit montants)
//   - viewer      → `BulletinCoffreDetail` (Bulletin entier, RÉSERVÉ ici)
//
// Le service distingue les deux par le nom de la méthode :
// `obtenirBulletinComplet` — son nom rend EXPLICITE l'exposition des
// montants au caller (cf. bulletins-service.ts Pro).
//
// L'accusé de réception est enregistré DÈS l'arrivée sur l'écran, via
// `CoffreService.enregistrerAccuse(ctx, id, horodate)` — c'est la RÈGLE
// MÉTIER, pas un effet de bord composant. Idempotent côté service.

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  EmptyState,
  Icon,
  IconButton,
  Modal,
  SealIcon,
  useToast,
  type IconName,
} from '@pli/ui';
import type { BulletinCoffre, Rattachement } from '@pli/types';
import {
  creerCoffreServiceMock,
  type ContextePersonnel,
} from '../../services/index.js';
import { MobileHeader } from './_phone-shell.js';

const CONTEXTE_SALARIE: ContextePersonnel = {
  type: 'personnel',
  comptePersonnelId: 'cp-aya',
};

function horodatageMaintenant(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function formatFCFA(n: number): string {
  return `${n.toLocaleString('fr-FR').replace(/\s/g, ' ')} FCFA`;
}

export function MobileBulletin() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pousser = useToast();
  const services = useMemo(() => ({ coffre: creerCoffreServiceMock() }), []);

  const [bulletin, setBulletin] = useState<BulletinCoffre | null>(null);
  const [chargement, setChargement] = useState(true);
  const [rat, setRat] = useState<Rattachement | null>(null);
  const [horodate, setHorodate] = useState('');
  const [inviteSignature, setInviteSignature] = useState(false);

  useEffect(() => {
    void (async () => {
      const [b, rats] = await Promise.all([
        services.coffre.obtenirBulletinComplet(CONTEXTE_SALARIE, id),
        services.coffre.listerRattachements(CONTEXTE_SALARIE),
      ]);
      setBulletin(b);
      const ratCible = b ? rats.find((r) => r.id === b.rattachementId) ?? null : null;
      setRat(ratCible);
      setChargement(false);
      if (!b) return;

      // Règle métier : enregistrer l'accusé HORODATÉ via le service.
      const stamp = horodatageMaintenant();
      const res = await services.coffre.enregistrerAccuse(CONTEXTE_SALARIE, b.id, stamp);
      if (res.ok) {
        setHorodate(res.dateAccuse);
        if (!res.dejaEnregistre) {
          pousser({
            message: 'Accusé de réception enregistré',
            tone: 'info',
            icon: 'MailCheck',
          });
          // Proposer la signature seulement si pas déjà signé et employeur actif
          if (b.statutSignature !== 'signe' && ratCible?.statut === 'actif') {
            const t = setTimeout(() => setInviteSignature(true), 1100);
            return () => clearTimeout(t);
          }
        }
      }
      return undefined;
    })();
  }, [id, services, pousser]);

  if (chargement) {
    return (
      <>
        <MobileHeader title="…" onBack={() => navigate('/app/coffre')} />
        <div className="flex-1" />
      </>
    );
  }

  if (!bulletin) {
    return (
      <>
        <MobileHeader
          title="Bulletin introuvable"
          onBack={() => navigate('/app/coffre')}
        />
        <EmptyState icon="FileX" title="Bulletin introuvable" />
      </>
    );
  }

  const employeurArchive = rat?.statut !== 'actif';
  const signatureRequise = bulletin.statutSignature !== 'signe';
  const sealNom = rat
    ? rat.entrepriseNom
    : bulletin.employeurNom ?? 'Groupe Atlantique CI';

  const actions: Array<{
    icon: IconName;
    label: string;
    primary?: boolean;
    disabled?: boolean;
    onClick?: () => void;
  }> = [
    {
      icon: 'Download',
      label: 'Télécharger',
      onClick: () => pousser({ message: 'Téléchargement (démo)', tone: 'info' }),
    },
    {
      icon: 'Share2',
      label: 'Partager',
      onClick: () => pousser({ message: 'Partage (démo)', tone: 'info' }),
    },
    {
      icon: 'PenLine',
      label: bulletin.statutSignature === 'signe' ? 'Signé' : 'Signer',
      primary: signatureRequise && !employeurArchive,
      disabled: employeurArchive || bulletin.statutSignature === 'signe',
      onClick: () => navigate(`/app/bulletin/${bulletin.id}/signer`),
    },
    {
      icon: 'MessageSquareWarning',
      label: 'Signaler',
      disabled: employeurArchive,
      onClick: () => pousser({ message: 'Signalement (démo)', tone: 'info' }),
    },
  ];

  return (
    <>
      <MobileHeader
        title={bulletin.periodeLibelle}
        onBack={() => navigate('/app/coffre')}
        right={<IconButton icon="EllipsisVertical" ariaLabel="Plus" size="sm" />}
      />

      {employeurArchive && (
        <div className="px-4 py-2.5 bg-surface border-b border-bordure flex items-center gap-2.5 shrink-0">
          <Icon name="Archive" size={14} className="text-texte-secondaire" />
          <div className="flex-1 text-[12.5px] text-encre">
            <strong>Ancien employeur · lecture seule.</strong> Bulletin conservé tant que
            votre compte est actif, dans votre coffre-fort.
          </div>
        </div>
      )}
      {signatureRequise && !employeurArchive && (
        <div className="px-4 py-2.5 bg-attente/15 border-b border-attente/30 flex items-center gap-2.5 shrink-0">
          <Icon name="PenLine" size={14} className="text-attente" />
          <div className="flex-1 text-[12.5px] text-encre">
            <strong>Signature requise.</strong> Vous pouvez consulter puis signer.
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 bg-[#444]">
        <div
          className="mx-auto bg-white shadow-lg"
          style={{ maxWidth: 340, aspectRatio: '210/297' }}
        >
          <div
            className="p-5 text-[10.5px] text-[#1a1a1a]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="flex items-start justify-between border-b border-[#1a1a1a]/20 pb-3">
              <div>
                <div className="font-semibold text-[12px] text-encre">{sealNom}</div>
                <div className="text-[8.5px] text-[#5B6577] leading-snug mt-0.5">
                  BP 1234 — Abidjan, Plateau
                  <br />
                  RCCM CI-ABJ-2014-B-12378
                </div>
              </div>
              <div className="text-right">
                <SealIcon size={28} />
                <div className="text-[7px] mt-1 text-cachet font-semibold tracking-wider">
                  SCELLÉ PAR PLI
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div
                  className="text-[7.5px] uppercase tracking-wide text-[#5B6577]"
                  style={{ letterSpacing: '.06em' }}
                >
                  Salarié
                </div>
                <div className="font-semibold mt-0.5">
                  {rat ? `${rat.poste}` : '—'}
                </div>
                <div className="text-[8.5px] text-[#5B6577]">{rat?.matricule}</div>
                <div className="text-[8.5px] text-[#5B6577]">{rat?.service}</div>
              </div>
              <div className="text-right">
                <div
                  className="text-[7.5px] uppercase tracking-wide text-[#5B6577]"
                  style={{ letterSpacing: '.06em' }}
                >
                  Période de paie
                </div>
                <div className="font-semibold mt-0.5">{bulletin.periodeLibelle}</div>
                <div className="text-[8.5px] text-[#5B6577]">
                  Émis le {bulletin.dateRemise ?? '—'}
                </div>
              </div>
            </div>

            <div className="mt-4 border border-[#1a1a1a]/15 rounded">
              <div
                className="grid grid-cols-12 gap-1 px-2 py-1.5 border-b border-[#1a1a1a]/10 bg-[#F6F2EB] text-[7.5px] uppercase tracking-wide font-semibold"
                style={{ letterSpacing: '.05em' }}
              >
                <div className="col-span-6">Libellé</div>
                <div className="col-span-3 text-right">Base</div>
                <div className="col-span-3 text-right">Montant</div>
              </div>
              {(
                [
                  ['Salaire brut', formatFCFA(bulletin.brut), formatFCFA(bulletin.brut), 'encre'],
                  [
                    'CNPS (6,3 %)',
                    formatFCFA(bulletin.brut),
                    `- ${formatFCFA(bulletin.cnps)}`,
                    'neg',
                  ],
                  [
                    'ITS (Impôt)',
                    formatFCFA(bulletin.brut - bulletin.cnps),
                    `- ${formatFCFA(bulletin.its)}`,
                    'neg',
                  ],
                ] as const
              ).map(([libelle, base, mt, t]) => (
                <div
                  key={libelle}
                  className="grid grid-cols-12 gap-1 px-2 py-1.5 border-b border-[#1a1a1a]/05 text-[9.5px]"
                >
                  <div className="col-span-6">{libelle}</div>
                  <div className="col-span-3 text-right tabular-nums text-[#5B6577]">
                    {base}
                  </div>
                  <div
                    className={`col-span-3 text-right tabular-nums ${
                      t === 'neg' ? 'text-[#CB3B33]' : ''
                    }`}
                  >
                    {mt}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-1 px-2 py-2 bg-encre text-white text-[10px] font-semibold">
                <div className="col-span-9">Net à payer</div>
                <div className="col-span-3 text-right tabular-nums">
                  {formatFCFA(bulletin.net)}
                </div>
              </div>
            </div>

            {bulletin.statutSignature === 'signe' && bulletin.dateSignature && (
              <div className="mt-4 border-t border-dashed border-[#1a1a1a]/30 pt-3 flex items-center gap-2">
                <Icon name="BadgeCheck" size={14} className="text-succes" />
                <div className="text-[9px]">
                  <div className="font-semibold text-encre">Signé</div>
                  <div className="text-[#5B6577]">
                    le {bulletin.dateSignature} · certificat PLI-
                    {bulletin.id.slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white border-t border-bordure pb-2">
        <div className="grid grid-cols-4 gap-1 p-2">
          {actions.map((a) => (
            <button
              type="button"
              key={a.label}
              disabled={a.disabled}
              onClick={a.onClick}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-md transition ${
                a.disabled
                  ? 'opacity-40 cursor-not-allowed text-encre'
                  : a.primary
                    ? 'bg-encre text-white'
                    : 'text-encre hover:bg-surface'
              }`}
            >
              <Icon name={a.icon} size={18} />
              <span className="text-[10px] font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Modal
        open={inviteSignature}
        onClose={() => setInviteSignature(false)}
        title="Ajouter une validation horodatée ?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviteSignature(false)}>
              Plus tard
            </Button>
            <Button
              variant="primary"
              icon="Stamp"
              onClick={() => {
                setInviteSignature(false);
                navigate(`/app/bulletin/${bulletin.id}/signer`);
              }}
            >
              Valider (horodaté)
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-md bg-papier border border-bordure p-3 flex items-start gap-3">
            <Icon name="MailCheck" size={16} className="text-succes shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-medium text-encre">
                Accusé de réception enregistré
              </div>
              <div className="text-[12.5px] text-texte-secondaire mt-0.5">
                Réception enregistrée le{' '}
                <strong className="text-encre">{horodate}</strong> — empreinte du document
                horodatée.
              </div>
            </div>
          </div>
          <p className="text-[13px] text-texte-secondaire">
            Souhaitez-vous également ajouter une{' '}
            <strong className="text-encre">validation horodatée</strong> du bulletin ? Cela
            ajoute un certificat à la preuve, utile en cas de litige.
          </p>
          <div className="text-[12px] text-texte-secondaire">
            <Link to="/conformite-artci" className="text-encre underline">
              Conformité ARTCI
            </Link>{' '}
            · Horodatage certifié. Signature avancée à venir.
          </div>
        </div>
      </Modal>
    </>
  );
}
