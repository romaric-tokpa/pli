// SiteInscription — utilise l'AuthShell 2-colonnes.
// Toggle Entreprise/Cabinet en haut du formulaire — un seul écran qui gère
// les deux cas (port verbatim site-auth-v2.jsx SiteInscription).

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Icon, Select, TextField, useToast } from '@pli/ui';
import { AuthShell } from './auth-shell.js';

type TypeInscription = 'entreprise' | 'cabinet';

const SECTEURS_ENTREPRISE = [
  { value: 'industrie', label: 'Industrie / Manufacturing' },
  { value: 'agroalimentaire', label: 'Agroalimentaire' },
  { value: 'transport', label: 'Transport / Logistique' },
  { value: 'commerce', label: 'Commerce / Distribution' },
  { value: 'services', label: 'Services' },
  { value: 'finance', label: 'Banque / Finance' },
  { value: 'informatique', label: 'Informatique / Télécoms' },
  { value: 'sante', label: 'Santé / Pharmaceutique' },
  { value: 'energie', label: 'Énergie' },
  { value: 'autre', label: 'Autre' },
];

const TYPES_CABINET = [
  { value: 'comptable', label: 'Cabinet comptable' },
  { value: 'interim', label: "Cabinet d'intérim" },
];

export function SiteInscription() {
  const navigate = useNavigate();
  const pousser = useToast();
  const [type, setType] = useState<TypeInscription>('entreprise');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    raisonSociale: '',
    secteur: '',
    typeCabinet: '',
    nomAdmin: '',
    emailPro: '',
    telephone: '',
    mdp: '',
    mdpConf: '',
    accepte: false,
  });

  const validEntreprise =
    type === 'entreprise' &&
    form.raisonSociale.length > 0 &&
    form.secteur !== '' &&
    form.nomAdmin.length > 0 &&
    form.emailPro.includes('@') &&
    form.mdp.length >= 8 &&
    form.mdp === form.mdpConf &&
    form.accepte;

  const validCabinet =
    type === 'cabinet' &&
    form.raisonSociale.length > 0 &&
    form.typeCabinet !== '' &&
    form.nomAdmin.length > 0 &&
    form.emailPro.includes('@') &&
    form.mdp.length >= 8 &&
    form.mdp === form.mdpConf &&
    form.accepte;

  const valid = validEntreprise || validCabinet;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (type === 'cabinet') {
        navigate('/cabinet');
        pousser({ message: 'Compte cabinet créé — bienvenue', tone: 'succes' });
      } else {
        navigate('/pro/onboarding');
        pousser({ message: 'Compte entreprise créé — bienvenue', tone: 'succes' });
      }
    }, 700);
  };

  return (
    <AuthShell
      eyebrow="Inscription"
      title="Créer mon compte Pli"
      subtitle="Démarrez avec 20 bulletins offerts. Sans carte bancaire."
      footerNote={
        <>
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-encre hover:underline font-medium">
            Se connecter
          </Link>
        </>
      }
    >
      {/* Toggle Entreprise / Cabinet — pattern v2 */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-papier border border-bordure mb-5">
        {(
          [
            { v: 'entreprise', l: 'Entreprise', i: 'Building2' },
            { v: 'cabinet', l: 'Cabinet', i: 'Briefcase' },
          ] as const
        ).map((opt) => (
          <button
            key={opt.v}
            type="button"
            onClick={() => setType(opt.v)}
            className={`h-10 px-3 rounded text-[13.5px] font-medium inline-flex items-center justify-center gap-2 transition focus-ring ${
              type === opt.v
                ? 'bg-encre text-white shadow-sm'
                : 'text-encre hover:bg-white/60'
            }`}
          >
            <Icon name={opt.i} size={14} />
            {opt.l}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        {type === 'entreprise' ? (
          <>
            <TextField
              label="Raison sociale"
              value={form.raisonSociale}
              onChange={(e) => setForm({ ...form, raisonSociale: e.target.value })}
              icon="Building2"
              required
              placeholder="Ex. Groupe Atlantique CI"
            />
            <Select
              label="Secteur d'activité"
              value={form.secteur}
              onChange={(e) => setForm({ ...form, secteur: e.target.value })}
              placeholder="Sélectionner…"
              icon="Briefcase"
              options={SECTEURS_ENTREPRISE}
            />
          </>
        ) : (
          <>
            <TextField
              label="Nom du cabinet"
              value={form.raisonSociale}
              onChange={(e) => setForm({ ...form, raisonSociale: e.target.value })}
              icon="Briefcase"
              required
              placeholder="Ex. Cabinet Comptable Ébrié"
            />
            <Select
              label="Type"
              value={form.typeCabinet}
              onChange={(e) => setForm({ ...form, typeCabinet: e.target.value })}
              placeholder="Sélectionner…"
              icon="SlidersHorizontal"
              options={TYPES_CABINET}
            />
          </>
        )}

        <TextField
          label={type === 'entreprise' ? "Nom de l'administrateur" : 'Personne de contact'}
          value={form.nomAdmin}
          onChange={(e) => setForm({ ...form, nomAdmin: e.target.value })}
          icon="User"
          required
          placeholder="Prénom Nom"
        />
        <TextField
          label="E-mail professionnel"
          type="email"
          value={form.emailPro}
          onChange={(e) => setForm({ ...form, emailPro: e.target.value })}
          icon="Mail"
          required
          placeholder="prenom.nom@entreprise.ci"
        />
        <TextField
          label="Téléphone"
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          icon="Phone"
          placeholder="+225 27 20 30 40 50"
          hint="Format ivoirien : +225 …"
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={form.mdp}
          onChange={(e) => setForm({ ...form, mdp: e.target.value })}
          icon="KeyRound"
          required
          hint="8 caractères minimum"
        />
        <TextField
          label="Confirmer le mot de passe"
          type="password"
          value={form.mdpConf}
          onChange={(e) => setForm({ ...form, mdpConf: e.target.value })}
          icon="KeyRound"
          required
          error={
            form.mdpConf && form.mdpConf !== form.mdp
              ? 'Les mots de passe ne correspondent pas'
              : undefined
          }
        />

        {type === 'cabinet' && (
          <div className="rounded-md bg-papier border border-bordure p-3 text-[12px] text-texte-secondaire flex items-start gap-2">
            <Icon name="Info" size={13} className="text-cachet shrink-0 mt-0.5" />
            <span>
              Tarif partenaire à choisir lors de l'activation :{' '}
              <strong className="text-encre">consolidé (−10 %)</strong> ou{' '}
              <strong className="text-encre">commission (15 %)</strong>.
            </span>
          </div>
        )}

        <label className="flex items-start gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={form.accepte}
            onChange={() => setForm({ ...form, accepte: !form.accepte })}
            className="mt-1 accent-encre h-4 w-4"
          />
          <span className="text-[12.5px] text-texte-secondaire">
            J'accepte les{' '}
            <Link to="/cgu" className="text-encre hover:underline">
              CGU
            </Link>{' '}
            et la{' '}
            <Link to="/confidentialite" className="text-encre hover:underline">
              politique de confidentialité
            </Link>{' '}
            de Pli.
          </span>
        </label>

        <Button type="submit" variant="primary" fullWidth loading={loading} disabled={!valid}>
          {type === 'entreprise' ? 'Créer mon compte entreprise' : 'Créer mon compte cabinet'}
        </Button>
      </form>
    </AuthShell>
  );
}
