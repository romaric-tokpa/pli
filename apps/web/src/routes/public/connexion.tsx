// SiteConnexion — utilise l'AuthShell 2-colonnes (panneau encre + form papier).
// Détection cabinet/suspension verbatim de site-auth-v2.jsx.
// Flow 2 étapes (email/MDP → 2FA inline) conservé pour couvrir l'invariant
// CLAUDE.md « code valable 10 minutes ».

import { useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Icon, TextField, useToast } from '@pli/ui';
import { AuthShell } from './auth-shell.js';

type TypeCompte = 'entreprise' | 'cabinet' | 'suspendu' | null;

function detecterTypeCompte(email: string): TypeCompte {
  const e = email.trim().toLowerCase();
  if (e.endsWith('@cabinet-ebrie.ci') || e.endsWith('@lagune-interim.ci')) return 'cabinet';
  if (e === 'p.ndoli@sanpedromar.ci') return 'suspendu';
  if (!e) return null;
  return 'entreprise';
}

export function SiteConnexion() {
  const navigate = useNavigate();
  const pousser = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('sylvie.ake@atlantique.ci');
  const [mdp, setMdp] = useState('••••••••');
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const typeCompte = useMemo(() => detecterTypeCompte(email), [email]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (step === 1) {
      if (typeCompte === 'suspendu') {
        setErreur('Ce compte a été suspendu. Contactez le support à contact@pli.ci.');
        return;
      }
      if (!email || !mdp || mdp === 'wrong') {
        setErreur('Identifiants invalides. Vérifiez votre e-mail et votre mot de passe.');
        return;
      }
      setErreur(null);
      setStep(2);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (typeCompte === 'cabinet') {
        navigate('/cabinet');
        pousser({ message: 'Bienvenue sur votre espace cabinet', tone: 'succes' });
      } else {
        navigate('/pro');
        pousser({ message: 'Connexion réussie', tone: 'succes' });
      }
    }, 700);
  };

  const onCellChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = (code.slice(0, i) + e.target.value.replace(/[^0-9]/g, '') + code.slice(i + 1)).slice(
      0,
      6,
    );
    setCode(v);
    if (e.target.value && e.target.nextElementSibling instanceof HTMLInputElement) {
      e.target.nextElementSibling.focus();
    }
  };

  return (
    <AuthShell
      eyebrow="Connexion"
      title={step === 1 ? 'Accédez à votre espace' : 'Vérification à deux facteurs'}
      subtitle={
        step === 1
          ? "Entreprises et cabinets. Le salarié se connecte depuis l'application mobile."
          : 'Saisissez le code à 6 chiffres reçu par e-mail.'
      }
      footerNote={
        step === 1 ? (
          <>
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-encre font-medium hover:underline">
              Créer un compte
            </Link>
          </>
        ) : null
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {erreur && (
          <div className="rounded-md bg-erreur/10 border border-erreur/30 p-3 flex items-start gap-2.5 text-[13px]">
            <Icon name="TriangleAlert" size={15} className="text-erreur shrink-0 mt-0.5" />
            <span className="text-encre">{erreur}</span>
          </div>
        )}

        {step === 1 ? (
          <>
            <TextField
              label="E-mail professionnel"
              icon="Mail"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErreur(null);
              }}
              placeholder="prenom.nom@entreprise.ci"
              required
              autoFocus
            />
            <div>
              <TextField
                label="Mot de passe"
                icon="KeyRound"
                type="password"
                value={mdp}
                onChange={(e) => {
                  setMdp(e.target.value);
                  setErreur(null);
                }}
                required
              />
              <div className="mt-2 text-right">
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-[12.5px] text-encre hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
            {typeCompte === 'cabinet' && (
              <div className="rounded-md bg-cachet/10 border border-cachet/30 p-2.5 text-[12px] text-encre flex items-center gap-2">
                <Icon name="Briefcase" size={12} className="text-cachet" />
                Compte cabinet détecté — redirection vers votre espace cabinet.
              </div>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={!email || !mdp}>
              Continuer
            </Button>
          </>
        ) : (
          <>
            <div>
              <div className="block text-[13px] font-medium text-encre mb-1.5">Code 2FA</div>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`Chiffre ${i + 1}`}
                    value={code[i] ?? ''}
                    onChange={onCellChange(i)}
                    className="w-11 h-12 text-center text-[18px] font-semibold rounded-md border border-bordure focus:border-encre focus:outline-none tabular-nums"
                  />
                ))}
              </div>
              <div className="mt-2 text-[12px] text-texte-secondaire flex items-center justify-between">
                <span>Code valable 10 minutes</span>
                <button type="button" className="text-encre hover:underline">
                  Renvoyer
                </button>
              </div>
            </div>
            <Button type="submit" variant="primary" fullWidth loading={loading} disabled={code.length < 6}>
              {typeCompte === 'cabinet' ? 'Accéder à mon espace cabinet' : 'Accéder à mon espace'}
            </Button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="block w-full text-center text-[13px] text-encre hover:underline"
            >
              Retour
            </button>
          </>
        )}
      </form>

      <div className="mt-6 rounded-md bg-papier border border-bordure p-3 text-[11.5px] text-texte-secondaire flex items-start gap-2">
        <Icon name="Smartphone" size={12} className="text-encre shrink-0 mt-0.5" />
        <span>
          <strong className="text-encre">Vous êtes salarié ?</strong> Téléchargez l'application Pli
          pour accéder à votre coffre-fort.
        </span>
      </div>
    </AuthShell>
  );
}
