// SiteVerification — challenge 2FA standalone (A.1 — bloquant clôture).
// Port verbatim de _wireframe/src/site-auth-v2.jsx (SiteVerification).
//
// PARCOURS INDIVISIBLE — la connexion 2FA passe normalement par
// `/connexion` étape 2 (inline), mais cette route standalone existe pour :
//   - les liens directs depuis un e-mail de Pli (« vérifier la connexion »)
//   - le re-challenge après expiration de session côté Pro / Cabinet
//   - les pratiques de bookmark (l'utilisateur garde l'URL `/verification`)
//
// Le test e2e `auth-parcours.test.tsx` vérifie que la route répond et que
// le code à 6 chiffres déclenche la navigation vers /pro ou /cabinet selon
// le `pli_auth_target` stocké en sessionStorage (posé par /connexion).

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Icon, useToast } from '@pli/ui';
import { AuthShell, AuthFooterArtci } from './auth-shell.js';

function lireSessionStorage(cle: string, defaut: string): string {
  try {
    return sessionStorage.getItem(cle) ?? defaut;
  } catch {
    return defaut;
  }
}

export function SiteVerification() {
  const navigate = useNavigate();
  const pousser = useToast();

  const [target] = useState(() => lireSessionStorage('pli_auth_target', 'pro'));
  const [email] = useState(() => lireSessionStorage('pli_auth_email', 'vous'));
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const handleChange = (i: number, val: string) => {
    const v = val.replace(/[^0-9]/g, '').slice(0, 1);
    const next = (code.slice(0, i) + v + code.slice(i + 1)).slice(0, 6);
    setCode(next);
    setErreur(null);
    if (v && inputsRef.current[i + 1]) inputsRef.current[i + 1]!.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && inputsRef.current[i - 1])
      inputsRef.current[i - 1]!.focus();
    if (e.key === 'ArrowLeft' && inputsRef.current[i - 1])
      inputsRef.current[i - 1]!.focus();
    if (e.key === 'ArrowRight' && inputsRef.current[i + 1])
      inputsRef.current[i + 1]!.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (text) {
      e.preventDefault();
      setCode(text.padEnd(6, '').slice(0, 6));
      if (text.length === 6 && inputsRef.current[5]) inputsRef.current[5]!.focus();
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    if (code === '000000') {
      setErreur('Code invalide. Vérifiez les chiffres saisis ou demandez un nouveau code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(target === 'cabinet' ? '/cabinet' : '/pro');
      pousser({ message: 'Vérification réussie', tone: 'succes' });
    }, 700);
  };

  const renvoyer = () => {
    setResendCountdown(60);
    setErreur(null);
    pousser({ message: 'Nouveau code envoyé', tone: 'info', icon: 'Mail' });
  };

  return (
    <AuthShell
      eyebrow="Vérification"
      title="Saisissez votre code de sécurité"
      subtitle={`Un code à 6 chiffres a été envoyé à ${email}.`}
      footerNote={
        <Link to="/connexion" className="text-encre font-medium hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {erreur && (
          <div
            className="rounded-md bg-erreur/10 border border-erreur/30 p-3 flex items-start gap-2.5 text-[13px]"
            role="alert"
          >
            <Icon name="TriangleAlert" size={15} className="text-erreur shrink-0 mt-0.5" />
            <span className="text-encre">{erreur}</span>
          </div>
        )}

        <div onPaste={handlePaste}>
          <div
            className="flex justify-between gap-2"
            role="group"
            aria-label="Code à 6 chiffres"
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                value={code[i] || ''}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                autoFocus={i === 0}
                aria-label={`Chiffre ${i + 1}`}
                className={`w-12 h-14 text-center text-[22px] font-semibold rounded-md border transition tabular-nums ${
                  erreur
                    ? 'border-erreur'
                    : 'border-bordure focus:border-encre focus:ring-2 focus:ring-encre/15 focus:outline-none'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-center text-[11.5px] text-texte-secondaire">
            Code valable 10 minutes. Collez-le directement avec Ctrl+V.
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={code.length < 6}
        >
          Vérifier
        </Button>

        <div className="text-center text-[12.5px]">
          {resendCountdown > 0 ? (
            <span className="text-texte-secondaire">
              Renvoyer le code dans {resendCountdown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={renvoyer}
              className="text-encre font-medium hover:underline"
            >
              Renvoyer le code
            </button>
          )}
        </div>

        <div className="text-center text-[11.5px] text-texte-secondaire pt-2 border-t border-bordure">
          <AuthFooterArtci />
        </div>
      </form>
    </AuthShell>
  );
}
