// Activation salarié — port focalisé sur les étapes critiques de
// _wireframe/src/mobile-auth.jsx (MobileActivation).
//
// INVARIANT JURIDIQUE VERROUILLÉ : acceptation des CGU bloquante côté
// SERVICE. Si le caller bypass le `disabled` du bouton « Envoyer le code SMS »,
// `ActivationService.activerCompte` refuse avec `cgu_non_acceptees`. Cf.
// `apps/web/src/services/activation-service.ts`.
//
// Le port simplifié couvre les étapes 3 (email pro) + 6 (tel perso + CGU) +
// 7 (confirmation) qui suffisent à exercer l'invariant. Les étapes 4 (mot de
// passe), 5 (code email) et 8 (compte existant) sont incluses sous forme
// résumée mais ne portent pas d'invariant.

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Icon,
  Logo,
  TextField,
  useToast,
} from '@pli/ui';
import {
  creerActivationServiceMock,
  type ActivationService,
} from '../../services/index.js';
import { PhoneFrame } from './_phone-shell.js';

type Etape =
  | 'intro'
  | 'email_pro'
  | 'mot_de_passe'
  | 'code_email'
  | 'tel_perso_cgu'
  | 'confirmation';

const ETAPES_NUMEROTEES: Etape[] = [
  'email_pro',
  'mot_de_passe',
  'code_email',
  'tel_perso_cgu',
  'confirmation',
];

export interface MobileActivationProps {
  /** Injectable pour les tests : remplace la factory mock par un espion. */
  services?: { activation: ActivationService };
}

export function MobileActivation({ services: servicesProp }: MobileActivationProps = {}) {
  const navigate = useNavigate();
  const pousser = useToast();
  const services = useMemo(
    () => servicesProp ?? { activation: creerActivationServiceMock() },
    [servicesProp],
  );

  const [etape, setEtape] = useState<Etape>('intro');
  const [emailPro, setEmailPro] = useState('');
  const [erreurEmail, setErreurEmail] = useState<string | null>(null);
  const [mdp, setMdp] = useState('');
  const [mdpConf, setMdpConf] = useState('');
  const [codeEmail, setCodeEmail] = useState('');
  const [telPerso, setTelPerso] = useState('');
  const [emailPersoOpt, setEmailPersoOpt] = useState('');
  const [cguAcceptees, setCguAcceptees] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function verifierEmail() {
    const res = await services.activation.verifierEmailPro(emailPro);
    if (!res.ok) {
      setErreurEmail(res.erreur ?? 'Adresse inconnue.');
      return;
    }
    setErreurEmail(null);
    setEtape('mot_de_passe');
  }

  async function envoyerCodeSms() {
    setEnCours(true);
    const res = await services.activation.activerCompte({
      emailPro,
      telPerso,
      emailPersoOpt: emailPersoOpt || undefined,
      cguAcceptees,
    });
    setEnCours(false);
    if (!res.ok) {
      pousser({
        message:
          res.raison === 'cgu_non_acceptees'
            ? "Veuillez accepter les CGU pour continuer"
            : res.raison === 'compte_existant'
              ? 'Un coffre Pli existe déjà pour ce numéro'
              : 'Activation impossible',
        tone: 'erreur',
      });
      return;
    }
    setEtape('confirmation');
  }

  const indexEtape = ETAPES_NUMEROTEES.indexOf(etape);

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col">
        {etape === 'intro' && (
          <>
            <div className="px-7 pt-8 pb-4 flex items-center justify-between">
              <Logo size={28} withWordmark />
              <button
                type="button"
                onClick={() => setEtape('email_pro')}
                className="text-[13px] text-texte-secondaire"
              >
                Passer
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <div
                className="h-28 w-28 rounded-3xl flex items-center justify-center bg-encre/10 text-encre"
              >
                <Icon name="Vault" size={56} strokeWidth={1.3} />
              </div>
              <h1 className="mt-8 text-[24px] font-semibold text-encre leading-tight">
                Votre coffre-fort de paie
              </h1>
              <p className="mt-3 text-[14px] text-texte-secondaire max-w-[280px]">
                Tous vos bulletins, sécurisés et accessibles tant que votre compte est
                actif, depuis votre téléphone.
              </p>
            </div>
            <div className="px-7 pb-8">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => setEtape('email_pro')}
              >
                Commencer
              </Button>
            </div>
          </>
        )}

        {indexEtape >= 0 && (
          <div className="px-4 pt-3 pb-2 shrink-0 border-b border-bordure">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const idx = indexEtape;
                  if (idx > 0) setEtape(ETAPES_NUMEROTEES[idx - 1]!);
                  else setEtape('intro');
                }}
                className="h-9 w-9 rounded-full flex items-center justify-center text-encre hover:bg-surface"
                aria-label="Retour"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
              <div className="flex-1 flex items-center justify-center gap-1.5">
                {ETAPES_NUMEROTEES.map((s, i) => (
                  <span
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      i === indexEtape
                        ? 'w-6 bg-encre'
                        : i < indexEtape
                          ? 'w-1.5 bg-encre'
                          : 'w-1.5 bg-bordure'
                    }`}
                  />
                ))}
              </div>
              <div className="w-9 h-9" />
            </div>
          </div>
        )}

        {etape === 'email_pro' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 px-6 py-5 overflow-y-auto space-y-5">
              <div>
                <div
                  className="text-[12px] uppercase tracking-wide text-cachet"
                  style={{ letterSpacing: '.06em' }}
                >
                  Étape 1 sur 5
                </div>
                <h1 className="mt-1 text-[22px] font-semibold text-encre">
                  Votre e-mail professionnel
                </h1>
                <p className="mt-1 text-[13px] text-texte-secondaire">
                  Saisissez l'adresse que votre employeur a enregistrée pour vous.
                </p>
              </div>
              <TextField
                label="E-mail professionnel"
                icon="Mail"
                type="email"
                value={emailPro}
                onChange={(e) => {
                  setEmailPro(e.target.value);
                  setErreurEmail(null);
                }}
                placeholder="prenom.nom@entreprise.ci"
                error={erreurEmail ?? undefined}
                autoFocus
              />
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-bordure">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                disabled={!emailPro.trim()}
                onClick={verifierEmail}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {etape === 'mot_de_passe' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 px-6 py-5 overflow-y-auto space-y-5">
              <div>
                <div
                  className="text-[12px] uppercase tracking-wide text-cachet"
                  style={{ letterSpacing: '.06em' }}
                >
                  Étape 2 sur 5
                </div>
                <h1 className="mt-1 text-[22px] font-semibold text-encre">
                  Créer votre mot de passe
                </h1>
              </div>
              <TextField
                label="Mot de passe"
                icon="KeyRound"
                type="password"
                value={mdp}
                onChange={(e) => setMdp(e.target.value)}
                hint="8 caractères minimum, dont une majuscule et un chiffre"
                autoFocus
              />
              <TextField
                label="Confirmer le mot de passe"
                icon="KeyRound"
                type="password"
                value={mdpConf}
                onChange={(e) => setMdpConf(e.target.value)}
                error={
                  mdpConf && mdpConf !== mdp
                    ? 'Les mots de passe ne correspondent pas'
                    : undefined
                }
              />
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-bordure">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                disabled={mdp.length < 8 || mdp !== mdpConf}
                onClick={() => setEtape('code_email')}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {etape === 'code_email' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 px-6 py-5 overflow-y-auto space-y-5">
              <div>
                <div
                  className="text-[12px] uppercase tracking-wide text-cachet"
                  style={{ letterSpacing: '.06em' }}
                >
                  Étape 3 sur 5
                </div>
                <h1 className="mt-1 text-[22px] font-semibold text-encre">
                  Vérification de votre e-mail
                </h1>
                <p className="mt-1 text-[13px] text-texte-secondaire">
                  Code à 6 chiffres envoyé à <strong>{emailPro}</strong>.
                </p>
              </div>
              <TextField
                label="Code à 6 chiffres"
                value={codeEmail}
                onChange={(e) => setCodeEmail(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
              />
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-bordure">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                disabled={codeEmail.length < 6}
                onClick={() => setEtape('tel_perso_cgu')}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {etape === 'tel_perso_cgu' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 px-6 py-5 overflow-y-auto space-y-4">
              <div>
                <div
                  className="text-[12px] uppercase tracking-wide text-cachet"
                  style={{ letterSpacing: '.06em' }}
                >
                  Étape 4 sur 5
                </div>
                <h1 className="mt-1 text-[22px] font-semibold text-encre">
                  Sécuriser durablement votre coffre-fort
                </h1>
              </div>
              <div className="rounded-lg border border-cachet/30 bg-cachet/5 p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Smartphone" size={18} className="text-cachet shrink-0 mt-0.5" />
                  <div className="text-[12.5px] text-encre">
                    Indiquez votre <strong>numéro de téléphone personnel</strong>. C'est la
                    clé durable qui vous permettra d'accéder à votre coffre-fort
                    <strong> même si vous changez d'employeur</strong> ou perdez l'accès à
                    votre e-mail pro.
                  </div>
                </div>
              </div>
              <TextField
                label="Téléphone personnel"
                icon="Smartphone"
                type="tel"
                value={telPerso}
                onChange={(e) => setTelPerso(e.target.value)}
                placeholder="+225 …"
                hint="Format international"
                required
              />
              <TextField
                label="E-mail personnel (facultatif)"
                icon="Mail"
                type="email"
                value={emailPersoOpt}
                onChange={(e) => setEmailPersoOpt(e.target.value)}
                hint="Filet de récupération si vous perdez votre téléphone"
              />
              <div className="rounded-md bg-papier border border-bordure p-3 text-[12px] text-texte-secondaire">
                <Icon name="Lock" size={12} className="inline mr-1 text-encre" />
                Votre numéro personnel n'est jamais communiqué à votre employeur. Il est
                utilisé uniquement pour sécuriser votre compte Pli.
              </div>

              <div className="rounded-lg border border-encre/20 bg-encre/5 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold text-encre">
                  <Icon name="UserRoundCheck" size={14} className="text-cachet" />
                  Votre compte personnel Pli
                </div>
                <p className="text-[12px] text-texte-secondaire">
                  Votre coffre vous appartient. Il est lié à votre numéro personnel,
                  indépendamment de votre employeur, et vous suit si vous changez
                  d'entreprise.
                </p>
              </div>

              {/* Acceptation CGU — bloquante. Le service refuse si false. */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <span
                  className={`mt-0.5 inline-flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border transition shrink-0 ${
                    cguAcceptees
                      ? 'bg-encre border-encre'
                      : 'bg-white border-[#B8C0CE]'
                  }`}
                >
                  {cguAcceptees && (
                    <Icon name="Check" size={12} className="text-white" strokeWidth={3} />
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={cguAcceptees}
                  onChange={() => setCguAcceptees((v) => !v)}
                  className="sr-only"
                  data-testid="checkbox-cgu"
                />
                <span className="text-[12px] text-encre">
                  J'accepte les{' '}
                  <Link to="/cgu" className="text-cachet underline">
                    conditions générales d'utilisation
                  </Link>{' '}
                  de Pli et la création de mon coffre-fort personnel.
                </span>
              </label>
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-bordure">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                loading={enCours}
                disabled={!telPerso.trim() || !cguAcceptees}
                onClick={envoyerCodeSms}
              >
                Envoyer le code SMS
              </Button>
            </div>
          </div>
        )}

        {etape === 'confirmation' && (
          <div className="flex-1 flex flex-col items-center text-center px-8 py-10">
            <div className="h-24 w-24 rounded-full bg-succes/10 flex items-center justify-center text-succes">
              <Icon name="CircleCheckBig" size={56} strokeWidth={1.4} />
            </div>
            <h2 className="mt-6 text-[22px] font-semibold text-encre">
              Compte personnel créé
            </h2>
            <p className="mt-2 text-[14px] text-texte-secondaire max-w-[260px]">
              Votre coffre-fort Pli vous appartient. Vous pouvez accéder à vos bulletins.
            </p>
            <div className="mt-auto w-full">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => navigate('/app')}
              >
                Accéder à mon coffre-fort
              </Button>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
