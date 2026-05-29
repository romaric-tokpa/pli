// Écran de signature mobile — port verbatim de _wireframe/src/mobile-bulletin.jsx
// (MobileSignature).
//
// INVARIANTS JURIDIQUES VERROUILLÉS (cf. test `mobile-validation-horodatee.test.tsx`) :
//
//   1. Libellé « validation horodatée » présent.
//   2. Libellé « valeur probante » ABSENT (CLAUDE.md : interdit tant que le
//      partenaire de signature avancée n'est pas branché).
//   3. Note « Horodatage certifié. Signature avancée à venir. » présente.
//   4. La règle métier « accepte=true requis » vit dans
//      `CoffreService.signerBulletin` ; le bouton disabled est un miroir UX.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Icon,
  SealIcon,
  useToast,
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

// IP factice pour la démo Phase 0 — TODO(phase-1) renseigner par le serveur
// au moment de la signature.
const IP_DEMO = '196.207.34.41';

function horodatageMaintenant(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function MobileSignature() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pousser = useToast();
  const services = useMemo(() => ({ coffre: creerCoffreServiceMock() }), []);

  const [bulletin, setBulletin] = useState<BulletinCoffre | null>(null);
  const [rat, setRat] = useState<Rattachement | null>(null);
  const [accepte, setAccepte] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    dateSignature: string;
    certificat: string;
  } | null>(null);
  const [horodatePreuve] = useState(horodatageMaintenant());

  useEffect(() => {
    void (async () => {
      const [b, rats] = await Promise.all([
        services.coffre.obtenirBulletinComplet(CONTEXTE_SALARIE, id),
        services.coffre.listerRattachements(CONTEXTE_SALARIE),
      ]);
      setBulletin(b);
      setRat(b ? rats.find((r) => r.id === b.rattachementId) ?? null : null);
    })();
  }, [id, services]);

  async function valider() {
    if (!bulletin) return;
    setEnCours(true);
    const stamp = horodatageMaintenant();
    const res = await services.coffre.signerBulletin(
      CONTEXTE_SALARIE,
      bulletin.id,
      accepte,
      stamp,
    );
    setEnCours(false);
    if (res.ok) {
      setConfirmation({ dateSignature: res.dateSignature, certificat: res.certificat });
    } else {
      pousser({
        message:
          res.raison === 'non_acceptee'
            ? 'Cochez la case pour valider'
            : 'Validation impossible',
        tone: 'erreur',
      });
    }
  }

  if (!bulletin) {
    return (
      <>
        <MobileHeader title="Validation" onBack={() => navigate('/app/coffre')} />
        <div className="flex-1" />
      </>
    );
  }

  if (confirmation) {
    return (
      <>
        <MobileHeader title={`Validation · ${bulletin.periodeLibelle}`} />
        <div className="flex-1 flex flex-col items-center text-center px-8 py-10 overflow-y-auto">
          <div className="h-28 w-28 rounded-full bg-succes/10 flex items-center justify-center text-succes">
            <Icon name="BadgeCheck" size={64} strokeWidth={1.4} />
          </div>
          <h2 className="mt-5 text-[22px] font-semibold text-encre">Réception validée</h2>
          <p className="mt-1 text-[13.5px] text-texte-secondaire max-w-[280px]">
            Votre validation a été enregistrée et horodatée.
          </p>

          <div className="mt-6 w-full rounded-lg bg-papier border border-bordure p-4 text-left">
            <div className="flex items-center gap-2">
              <SealIcon size={28} />
              <div>
                <div className="text-[13px] font-semibold text-encre">
                  Validé le {confirmation.dateSignature}
                </div>
                <div className="text-[11.5px] text-texte-secondaire">
                  Validation horodatée — preuve conservée tant que votre compte est actif.
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-bordure text-[11px] text-texte-secondaire space-y-0.5">
              <div className="flex justify-between">
                <span>Certificat</span>
                <span className="font-mono text-encre">{confirmation.certificat}</span>
              </div>
              <div className="flex justify-between">
                <span>Algorithme</span>
                <span className="font-mono text-encre">RSA-2048 / SHA-256</span>
              </div>
            </div>
          </div>

          <div className="mt-auto w-full space-y-2 pt-6">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => navigate(`/app/bulletin/${bulletin.id}`)}
            >
              Revenir au bulletin
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/app')}>
              Aller à l'accueil
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileHeader
        title={`Validation · ${bulletin.periodeLibelle}`}
        onBack={() => navigate(`/app/bulletin/${bulletin.id}`)}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-4">
          <div>
            <div
              className="text-[12px] uppercase tracking-wide text-texte-secondaire"
              style={{ letterSpacing: '.06em' }}
            >
              Vous allez valider
            </div>
            <h2 className="text-[18px] font-semibold text-encre mt-1">
              Bulletin de {bulletin.periodeLibelle}
            </h2>
          </div>

          <Card padding="p-4">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <div className="text-[11px] text-texte-secondaire">Salarié</div>
                <div className="font-medium">{rat?.poste ?? '—'}</div>
                <div className="text-[12px] text-texte-secondaire">{rat?.matricule}</div>
              </div>
              <div>
                <div className="text-[11px] text-texte-secondaire">Employeur</div>
                <div className="font-medium">{rat?.entrepriseNom}</div>
                <div className="text-[12px] text-texte-secondaire">
                  RCCM CI-ABJ-2014-B-12378
                </div>
              </div>
            </div>
          </Card>

          {/* Bloc « Validation horodatée » — libellé juridique verrouillé */}
          <div
            className="rounded-lg bg-papier border border-bordure p-4 space-y-2.5"
            data-testid="bloc-validation-horodatee"
          >
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-encre">
              <Icon name="Stamp" size={14} className="text-cachet" />
              Validation horodatée
            </div>
            <div className="text-[12.5px] text-texte-secondaire">
              Aucun tracé manuscrit n'est requis. En validant ci-dessous, vous confirmez la
              réception et la prise de connaissance du bulletin. Pli appose alors :
            </div>
            <ul className="text-[12.5px] text-texte-secondaire space-y-1 pl-5 list-disc">
              <li>
                la <strong className="text-encre">date et l'heure exactes</strong> de votre
                validation,
              </li>
              <li>
                votre <strong className="text-encre">identité</strong> certifiée par Pli,
              </li>
              <li>
                un <strong className="text-encre">certificat unique</strong> conservé dans
                votre coffre-fort.
              </li>
            </ul>
            <div className="pt-2 mt-1 border-t border-bordure flex items-start gap-2 text-[11.5px] text-texte-secondaire">
              <Icon name="Info" size={12} className="text-info shrink-0 mt-0.5" />
              Horodatage certifié. Signature avancée à venir.
            </div>
          </div>

          <div className="rounded-md border border-bordure p-3 bg-white">
            <div
              className="text-[11px] uppercase tracking-wide text-texte-secondaire mb-1.5"
              style={{ letterSpacing: '.05em' }}
            >
              Aperçu de la preuve
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-texte-secondaire">Horodatage</span>
              <span className="font-mono text-encre">{horodatePreuve}</span>
            </div>
            <div className="flex justify-between text-[12px] mt-1">
              <span className="text-texte-secondaire">Certificat</span>
              <span className="font-mono text-encre">
                PLI-{bulletin.id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-[12px] mt-1">
              <span className="text-texte-secondaire">Adresse IP</span>
              <span className="font-mono text-encre">{IP_DEMO}</span>
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={accepte}
              onChange={() => setAccepte((v) => !v)}
              className="mt-1 accent-encre h-4 w-4"
            />
            <span className="text-[12.5px] text-encre">
              Je confirme avoir relu le bulletin et je valide sa réception, horodatée.
            </span>
          </label>
        </div>
      </div>

      <div className="shrink-0 px-5 pb-5 pt-3 border-t border-bordure bg-white">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          disabled={!accepte || enCours}
          icon="Stamp"
          onClick={valider}
        >
          Valider (horodaté)
        </Button>
      </div>
    </>
  );
}
