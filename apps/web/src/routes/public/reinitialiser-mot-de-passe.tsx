// SiteReinitialiserMotDePasse — landing depuis l'e-mail de récupération
// (A.1 — bloquant clôture). Port verbatim de
// _wireframe/src/site-auth-v2.jsx (SiteReinitialiserMotDePasse).
//
// PARCOURS INDIVISIBLE — l'utilisateur clique le lien dans son e-mail de
// récupération et arrive directement ici. Le code a déjà été validé par le
// token dans l'URL (à brancher en Phase 1). On lui demande seulement le
// nouveau mot de passe + confirmation.
//
// Distinct de `/mot-de-passe-oublie` qui gère le flow saisir e-mail → code,
// et qui PEUT (en démo) terminer en interne — cette route reste accessible
// pour les liens deep, et garantit qu'aucun lien d'e-mail ne tombe en 404.

import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Icon, TextField, useToast } from '@pli/ui';
import { AuthShell } from './auth-shell.js';

interface ForceMdp {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

function evaluerForce(mdp: string): ForceMdp {
  if (!mdp) return { score: 0, label: '' };
  let s = 0;
  if (mdp.length >= 8) s++;
  if (/[A-Z]/.test(mdp)) s++;
  if (/[0-9]/.test(mdp)) s++;
  if (/[^A-Za-z0-9]/.test(mdp)) s++;
  const labels = ['Trop faible', 'Faible', 'Correct', 'Fort', 'Excellent'] as const;
  return { score: s as ForceMdp['score'], label: labels[s] ?? '' };
}

export function SiteReinitialiserMotDePasse() {
  const navigate = useNavigate();
  const pousser = useToast();

  const [mdp, setMdp] = useState('');
  const [mdpConf, setMdpConf] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ mdp?: string; mdpConf?: string }>({});

  const force = useMemo(() => evaluerForce(mdp), [mdp]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!mdp || mdp.length < 8) errs.mdp = '8 caractères minimum';
    if (mdpConf !== mdp) errs.mdpConf = 'Les mots de passe ne correspondent pas';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 600);
  };

  if (success) {
    return (
      <AuthShell eyebrow="Réinitialisation">
        <div
          className="rounded-lg bg-white border border-bordure p-6 text-center"
          data-testid="mdp-success"
        >
          <div className="h-16 w-16 rounded-full bg-succes/10 text-succes flex items-center justify-center mx-auto">
            <Icon name="CircleCheckBig" size={32} strokeWidth={2.2} />
          </div>
          <h2 className="mt-4 text-[20px] font-semibold text-encre">
            Votre mot de passe a été réinitialisé
          </h2>
          <p className="mt-2 text-[13px] text-texte-secondaire">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          <button
            type="button"
            onClick={() => {
              navigate('/connexion');
              pousser({ message: 'Mot de passe réinitialisé', tone: 'succes' });
            }}
            className="mt-5 inline-flex items-center justify-center gap-2 h-11 px-5 bg-encre text-white text-[14px] font-medium rounded-md hover:bg-[#0F1F3D] transition"
          >
            Se connecter
            <Icon name="ArrowRight" size={13} />
          </button>
        </div>
      </AuthShell>
    );
  }

  const barresForce = [0, 1, 2, 3].map((i) => {
    const filled = i < force.score;
    const color =
      force.score <= 1 ? '#CB3B33' : force.score === 2 ? '#D9A227' : '#2F8F5B';
    return (
      <div
        key={i}
        className="h-1 flex-1 rounded-full transition-all"
        style={{ backgroundColor: filled ? color : '#DCE1E9' }}
      />
    );
  });

  return (
    <AuthShell
      eyebrow="Réinitialisation"
      title="Définir un nouveau mot de passe"
      subtitle="Choisissez un mot de passe robuste pour sécuriser votre compte Pli."
      footerNote={
        <Link to="/connexion" className="text-encre font-medium hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <TextField
            label="Nouveau mot de passe"
            type="password"
            icon="KeyRound"
            value={mdp}
            onChange={(e) => {
              setMdp(e.target.value);
              setErrors({});
            }}
            required
            autoFocus
            hint="8 caractères minimum, dont une majuscule et un chiffre"
            error={errors.mdp}
          />
          {mdp && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">{barresForce}</div>
              <div className="text-[11px] text-texte-secondaire">
                Robustesse :{' '}
                <span className="text-encre font-medium">{force.label}</span>
              </div>
            </div>
          )}
        </div>
        <TextField
          label="Confirmer le mot de passe"
          type="password"
          icon="KeyRound"
          value={mdpConf}
          onChange={(e) => {
            setMdpConf(e.target.value);
            setErrors({});
          }}
          required
          error={errors.mdpConf}
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
