// SiteMotDePasseOublie — utilise l'AuthShell 2-colonnes.
// Port verbatim 3 étapes : e-mail → code (10 min) → nouveau mot de passe.

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Icon, TextField, useToast } from '@pli/ui';
import { AuthShell } from './auth-shell.js';

export function SiteMotDePasseOublie() {
  const navigate = useNavigate();
  const pousser = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [mdpConf, setMdpConf] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (step === 1) setStep(2);
      else if (step === 2) setStep(3);
      else {
        navigate('/connexion');
        pousser({ message: 'Mot de passe réinitialisé', tone: 'succes' });
      }
    }, 600);
  };

  const renduFooter = (
    <Link to="/connexion" className="text-encre hover:underline">
      Retour à la connexion
    </Link>
  );

  if (step === 1) {
    return (
      <AuthShell
        eyebrow="Mot de passe oublié"
        title="Réinitialiser mon mot de passe"
        subtitle="Saisissez l'e-mail professionnel de votre compte."
        footerNote={renduFooter}
      >
        <form onSubmit={submit} className="space-y-4">
          <TextField
            label="E-mail professionnel"
            type="email"
            icon="Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" variant="primary" fullWidth loading={loading} disabled={!email}>
            Envoyer le code
          </Button>
        </form>
      </AuthShell>
    );
  }

  if (step === 2) {
    return (
      <AuthShell
        eyebrow="Mot de passe oublié"
        title="Vérifiez votre e-mail"
        subtitle={`Code valable 10 minutes — envoyé à ${email}.`}
        footerNote={renduFooter}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="mdp-code" className="block text-[13px] font-medium text-encre mb-1.5">
              Code reçu
            </label>
            <input
              id="mdp-code"
              className="w-full h-11 px-3 rounded-md border border-bordure focus:border-encre focus:outline-none tabular-nums text-center text-[16px] font-semibold tracking-widest"
              placeholder="000000"
              maxLength={6}
            />
          </div>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Vérifier
          </Button>
          <button
            type="button"
            className="block w-full text-center text-[12.5px] text-encre hover:underline"
          >
            <Icon name="Clock" size={11} className="inline mr-1" />
            Renvoyer le code
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Mot de passe oublié"
      title="Nouveau mot de passe"
      footerNote={renduFooter}
    >
      <form onSubmit={submit} className="space-y-4">
        <TextField
          label="Nouveau mot de passe"
          type="password"
          icon="KeyRound"
          value={mdp}
          onChange={(e) => setMdp(e.target.value)}
          hint="8 caractères minimum"
          required
          autoFocus
        />
        <TextField
          label="Confirmer"
          type="password"
          icon="KeyRound"
          value={mdpConf}
          onChange={(e) => setMdpConf(e.target.value)}
          required
          error={
            mdpConf && mdpConf !== mdp ? 'Les mots de passe ne correspondent pas' : undefined
          }
        />
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={!mdp || mdp !== mdpConf}
        >
          Mettre à jour le mot de passe
        </Button>
      </form>
    </AuthShell>
  );
}
