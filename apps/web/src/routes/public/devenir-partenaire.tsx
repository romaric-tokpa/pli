// SiteDevenirPartenaire — port verbatim de site-auth.jsx.
// Stepper 4 étapes : Cabinet → Sécurité 2FA → Portefeuille → C'est parti.
// Cloisonnement strict + tarif partenaire (consolidé −10 % / commission 15 %).

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Icon, IconButton, Select, Stepper, TextField, useToast } from '@pli/ui';
import { Logo } from '@pli/ui';

const TYPES_CABINET = [
  { value: 'comptable', label: 'Cabinet comptable' },
  { value: 'interim', label: "Cabinet d'intérim" },
];

const SECTEURS_CLIENT = [
  { value: 'agroalimentaire', label: 'Agroalimentaire' },
  { value: 'transport', label: 'Transport / Logistique' },
  { value: 'commerce', label: 'Commerce / Distribution' },
  { value: 'services', label: 'Services' },
  { value: 'finance', label: 'Banque / Finance' },
  { value: 'informatique', label: 'Informatique / Télécoms' },
  { value: 'sante', label: 'Santé / Pharmaceutique' },
  { value: 'industrie', label: 'Industrie / Manufacturing' },
  { value: 'autre', label: 'Autre' },
];

const ETAPES = ['Cabinet', 'Sécurité 2FA', 'Portefeuille', "C'est parti"];

interface EntreprisePortefeuille {
  id: string;
  raisonSociale: string;
  secteur: string;
  idFiscal: string;
  salariesEstimes: string;
  lectureSeule: boolean;
}

export function SiteDevenirPartenaire() {
  const navigate = useNavigate();
  const pousser = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Étape 1
  const [cabinet, setCabinet] = useState({
    nom: '',
    type: '',
    contact: '',
    email: '',
    telephone: '',
    mdp: '',
    accepte: false,
  });
  const validInfos =
    cabinet.nom.length > 0 &&
    cabinet.type.length > 0 &&
    cabinet.contact.length > 0 &&
    cabinet.email.includes('@') &&
    cabinet.mdp.length >= 8 &&
    cabinet.accepte;

  // Étape 2
  const [code2fa, setCode2fa] = useState('');

  // Étape 3
  const [portefeuille, setPortefeuille] = useState<EntreprisePortefeuille[]>([]);
  const [entForm, setEntForm] = useState({
    raisonSociale: '',
    secteur: '',
    idFiscal: '',
    salariesEstimes: '',
    lectureSeule: false,
  });

  const ajouterEntreprise = () => {
    if (!entForm.raisonSociale || !entForm.secteur) return;
    const nouveau: EntreprisePortefeuille = { ...entForm, id: `new-${Date.now()}` };
    setPortefeuille([...portefeuille, nouveau]);
    pousser({ message: `${entForm.raisonSociale} ajoutée à votre portefeuille`, tone: 'succes' });
    setEntForm({
      raisonSociale: '',
      secteur: '',
      idFiscal: '',
      salariesEstimes: '',
      lectureSeule: false,
    });
  };
  const retirerEntreprise = (id: string) =>
    setPortefeuille(portefeuille.filter((e) => e.id !== id));

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(3);
        pousser({ message: 'Compte cabinet créé', tone: 'succes' });
      }, 700);
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }
    // Étape 4 — accès final
    navigate('/cabinet');
    pousser({
      message: `${portefeuille.length} entreprises ajoutées à votre portefeuille`,
      tone: 'succes',
    });
  };

  const onCellChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = (
      code2fa.slice(0, i) +
      e.target.value.replace(/[^0-9]/g, '') +
      code2fa.slice(i + 1)
    ).slice(0, 6);
    setCode2fa(v);
    if (e.target.value && e.target.nextElementSibling instanceof HTMLInputElement) {
      e.target.nextElementSibling.focus();
    }
  };

  return (
    <div className="min-h-screen bg-papier flex flex-col">
      <header className="px-5 md:px-8 py-4 flex items-center justify-between border-b border-bordure bg-white">
        <Link to="/" className="flex items-center focus-ring rounded">
          <Logo size={32} withWordmark descripteur />
        </Link>
        <Link
          to="/"
          className="text-[13px] text-encre/85 hover:text-encre inline-flex items-center gap-1 focus-ring rounded"
        >
          <Icon name="ArrowLeft" size={13} />
          Retour au site
        </Link>
      </header>

      <main className="flex-1 px-5 md:px-8 py-8 md:py-10">
        <div className="max-w-3xl mx-auto">
          <Card padding="p-5">
            <Stepper steps={ETAPES} current={step} />
          </Card>

          {/* Étape 1 — Infos cabinet */}
          {step === 1 && (
            <Card padding="p-7" className="mt-6">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Briefcase" size={16} className="text-cachet" />
                <span
                  className="text-[12px] uppercase tracking-wide text-texte-secondaire"
                  style={{ letterSpacing: '.06em' }}
                >
                  Cabinet partenaire
                </span>
              </div>
              <h1 className="text-[22px] font-semibold text-encre">Créer votre espace cabinet</h1>
              <p className="mt-1 text-[13px] text-texte-secondaire">
                Un seul espace pour gérer toutes vos entreprises clientes.
              </p>

              <form onSubmit={submit} className="mt-5 space-y-3.5">
                <TextField
                  label="Nom du cabinet"
                  value={cabinet.nom}
                  onChange={(e) => setCabinet({ ...cabinet, nom: e.target.value })}
                  icon="Briefcase"
                  required
                  placeholder="Ex. Cabinet Comptable Ébrié"
                />
                <Select
                  label="Type"
                  value={cabinet.type}
                  onChange={(e) => setCabinet({ ...cabinet, type: e.target.value })}
                  placeholder="Sélectionner…"
                  icon="SlidersHorizontal"
                  options={TYPES_CABINET}
                />
                <TextField
                  label="Nom du contact"
                  value={cabinet.contact}
                  onChange={(e) => setCabinet({ ...cabinet, contact: e.target.value })}
                  icon="User"
                  required
                  placeholder="Prénom Nom"
                />
                <TextField
                  label="E-mail professionnel"
                  type="email"
                  value={cabinet.email}
                  onChange={(e) => setCabinet({ ...cabinet, email: e.target.value })}
                  icon="Mail"
                  required
                />
                <TextField
                  label="Téléphone"
                  value={cabinet.telephone}
                  onChange={(e) => setCabinet({ ...cabinet, telephone: e.target.value })}
                  icon="Phone"
                  placeholder="+225 …"
                />
                <TextField
                  label="Mot de passe"
                  type="password"
                  value={cabinet.mdp}
                  onChange={(e) => setCabinet({ ...cabinet, mdp: e.target.value })}
                  icon="KeyRound"
                  required
                  hint="8 caractères minimum"
                />

                <div className="rounded-md bg-papier border border-bordure p-3 text-[12px] text-texte-secondaire flex items-start gap-2">
                  <Icon name="Info" size={12} className="text-info shrink-0 mt-0.5" />
                  <span>
                    Tarif partenaire à choisir lors de l'activation :{' '}
                    <strong className="text-encre">consolidé (−10 %)</strong> ou{' '}
                    <strong className="text-encre">commission (15 %)</strong>.
                  </span>
                </div>

                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={cabinet.accepte}
                    onChange={() => setCabinet({ ...cabinet, accepte: !cabinet.accepte })}
                    className="mt-1 accent-encre h-4 w-4"
                  />
                  <span className="text-[12.5px] text-texte-secondaire">
                    J'accepte les{' '}
                    <Link to="/cgu" className="text-encre hover:underline">
                      conditions partenaires
                    </Link>{' '}
                    et la{' '}
                    <Link to="/confidentialite" className="text-encre hover:underline">
                      politique de confidentialité
                    </Link>
                    .
                  </span>
                </label>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={!validInfos}
                  iconRight="ArrowRight"
                >
                  Continuer
                </Button>
              </form>
            </Card>
          )}

          {/* Étape 2 — 2FA */}
          {step === 2 && (
            <Card padding="p-7" className="mt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-papier flex items-center justify-center text-cachet">
                  <Icon name="ShieldCheck" size={28} strokeWidth={1.5} />
                </div>
                <h1 className="mt-4 text-[22px] font-semibold text-encre">
                  Sécuriser votre compte
                </h1>
                <p className="mt-1 text-[13px] text-texte-secondaire max-w-[320px]">
                  Saisissez le code à 6 chiffres envoyé à{' '}
                  <strong className="text-encre break-all">{cabinet.email}</strong> pour activer la
                  double authentification.
                </p>
              </div>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      maxLength={1}
                      inputMode="numeric"
                      aria-label={`Chiffre ${i + 1}`}
                      value={code2fa[i] ?? ''}
                      onChange={onCellChange(i)}
                      className="w-11 h-12 text-center text-[18px] font-semibold rounded-md border border-bordure focus:border-encre focus:outline-none tabular-nums"
                    />
                  ))}
                </div>
                <div className="text-center text-[12px] text-texte-secondaire">
                  <button type="button" className="text-encre hover:underline">
                    Renvoyer le code
                  </button>
                </div>
                <div className="rounded-md bg-papier border border-bordure p-3 text-[12px] text-texte-secondaire flex items-start gap-2">
                  <Icon name="Lock" size={12} className="text-encre shrink-0 mt-0.5" />
                  <span>
                    La 2FA sera <strong className="text-encre">obligatoire</strong> pour tous les
                    gestionnaires de votre cabinet.
                  </span>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={code2fa.length < 6}
                >
                  Activer mon espace cabinet
                </Button>
              </form>
            </Card>
          )}

          {/* Étape 3 — Portefeuille */}
          {step === 3 && (
            <div className="mt-6 space-y-5">
              <Card padding="p-7">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="ListChecks" size={16} className="text-cachet" />
                  <span
                    className="text-[12px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.06em' }}
                  >
                    Onboarding cabinet
                  </span>
                </div>
                <h1 className="text-[22px] font-semibold text-encre">
                  Ajoutez vos entreprises clientes
                </h1>
                <p className="mt-1 text-[13.5px] text-texte-secondaire">
                  C'est <strong className="text-encre">vous</strong> qui créez les entreprises que
                  vous gérez — pas elles qui s'inscrivent. Ajoutez-en autant que nécessaire, vous
                  pourrez en ajouter d'autres à tout moment depuis votre tableau de bord.
                </p>

                <div className="mt-5 rounded-lg border border-bordure p-5 bg-papier/40">
                  <div
                    className="text-[12px] uppercase tracking-wide text-texte-secondaire mb-3"
                    style={{ letterSpacing: '.06em' }}
                  >
                    Nouvelle entreprise cliente
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <TextField
                      label="Raison sociale"
                      value={entForm.raisonSociale}
                      onChange={(e) => setEntForm({ ...entForm, raisonSociale: e.target.value })}
                      icon="Building2"
                      required
                      placeholder="Ex. Cacao Plus SARL"
                    />
                    <Select
                      label="Secteur"
                      value={entForm.secteur}
                      onChange={(e) => setEntForm({ ...entForm, secteur: e.target.value })}
                      placeholder="Sélectionner…"
                      icon="Briefcase"
                      options={SECTEURS_CLIENT}
                    />
                    <TextField
                      label="Identifiant fiscal (facultatif)"
                      value={entForm.idFiscal}
                      onChange={(e) => setEntForm({ ...entForm, idFiscal: e.target.value })}
                      icon="Hash"
                      placeholder="N° RCCM ou NCC"
                    />
                    <TextField
                      label="Nombre estimé de salariés"
                      value={entForm.salariesEstimes}
                      onChange={(e) => setEntForm({ ...entForm, salariesEstimes: e.target.value })}
                      icon="Users"
                      placeholder="Ex. 25"
                    />
                  </div>
                  <label className="mt-3 flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entForm.lectureSeule}
                      onChange={() =>
                        setEntForm({ ...entForm, lectureSeule: !entForm.lectureSeule })
                      }
                      className="mt-1 accent-encre h-4 w-4"
                    />
                    <span className="text-[12.5px] text-texte-secondaire">
                      <Icon name="Eye" size={11} className="inline mr-1 text-encre" />
                      Inviter l'entreprise à un{' '}
                      <strong className="text-encre">accès en lecture seule</strong> (supervision
                      uniquement, sans pouvoir éditer)
                    </span>
                  </label>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="secondary"
                      icon="CirclePlus"
                      onClick={ajouterEntreprise}
                      disabled={!entForm.raisonSociale || !entForm.secteur}
                    >
                      Ajouter à mon portefeuille
                    </Button>
                  </div>
                </div>

                {portefeuille.length > 0 && (
                  <div className="mt-5">
                    <div
                      className="text-[12px] uppercase tracking-wide text-texte-secondaire mb-2"
                      style={{ letterSpacing: '.06em' }}
                    >
                      Portefeuille en construction — {portefeuille.length} entreprise
                      {portefeuille.length > 1 ? 's' : ''}
                    </div>
                    <div className="space-y-2">
                      {portefeuille.map((e) => (
                        <div
                          key={e.id}
                          className="rounded-md border border-bordure p-3 flex items-center gap-3"
                        >
                          <div className="h-9 w-9 rounded-md bg-papier border border-bordure flex items-center justify-center text-encre">
                            <Icon name="Building2" size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13.5px] font-medium text-encre truncate">
                              {e.raisonSociale}
                            </div>
                            <div className="text-[11.5px] text-texte-secondaire">
                              {e.secteur}
                              {e.salariesEstimes ? ` · ${e.salariesEstimes} salariés estimés` : ''}
                              {e.lectureSeule ? ' · Lecture seule activée' : ''}
                            </div>
                          </div>
                          <IconButton
                            icon="X"
                            ariaLabel="Retirer"
                            onClick={() => retirerEntreprise(e.id)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {portefeuille.length === 0 && (
                  <div className="mt-5 rounded-md bg-papier border border-bordure p-4 text-[12.5px] text-texte-secondaire text-center">
                    Aucune entreprise ajoutée pour l'instant. Vous pouvez en ajouter quelques-unes
                    maintenant ou les créer plus tard depuis votre tableau de bord.
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-2">
                  <Button variant="ghost" onClick={() => setStep(4)}>
                    Sauter cette étape
                  </Button>
                  <Button
                    variant="primary"
                    iconRight="ArrowRight"
                    onClick={() => setStep(4)}
                    disabled={portefeuille.length === 0}
                  >
                    Continuer{portefeuille.length > 0 ? ` (${portefeuille.length})` : ''}
                  </Button>
                </div>
              </Card>

              <div className="rounded-md bg-papier border border-bordure p-3.5 text-[12.5px] text-texte-secondaire flex items-start gap-2">
                <Icon name="ShieldCheck" size={13} className="text-succes shrink-0 mt-0.5" />
                <span>
                  <strong className="text-encre">Cloisonnement automatique :</strong> chaque
                  entreprise créée appartient à votre portefeuille. Vos clients ne se voient jamais
                  entre eux. Les salariés ne savent pas qu'un cabinet opère pour leur employeur.
                </span>
              </div>
            </div>
          )}

          {/* Étape 4 — Succès */}
          {step === 4 && (
            <Card padding="p-7" className="mt-6 text-center">
              <div className="h-16 w-16 rounded-full bg-succes/10 text-succes flex items-center justify-center mx-auto">
                <Icon name="Check" size={32} strokeWidth={2.5} />
              </div>
              <h1 className="mt-5 text-[22px] font-semibold text-encre">
                Votre espace cabinet est prêt
              </h1>
              <p className="mt-2 text-[13.5px] text-texte-secondaire max-w-md mx-auto">
                {portefeuille.length > 0
                  ? `${portefeuille.length} entreprise${portefeuille.length > 1 ? 's' : ''} ajoutée${portefeuille.length > 1 ? 's' : ''} à votre portefeuille.`
                  : 'Vous pourrez ajouter vos entreprises depuis le tableau de bord.'}
              </p>
              {portefeuille.length > 0 && (
                <div className="mt-5 rounded-lg bg-papier border border-bordure p-4 text-left">
                  <div
                    className="text-[11px] text-texte-secondaire uppercase tracking-wide mb-2"
                    style={{ letterSpacing: '.06em' }}
                  >
                    Portefeuille initial
                  </div>
                  <ul className="space-y-1.5">
                    {portefeuille.map((e) => (
                      <li key={e.id} className="flex items-center gap-2 text-[13px] text-encre">
                        <Icon name="Building2" size={12} className="text-cachet" />
                        {e.raisonSociale}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6 rounded-md bg-papier border border-bordure p-3 text-[12.5px] text-texte-secondaire text-left">
                <strong className="text-encre">Prochaines étapes côté espace cabinet :</strong>{' '}
                importez les salariés de chaque entreprise (référentiel matricule), déposez vos
                premiers bulletins, suivez consultations et signatures.
              </div>
              <Button
                variant="primary"
                icon="LayoutGrid"
                fullWidth
                onClick={() => submit()}
                className="mt-5"
              >
                Accéder à mon espace cabinet
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
