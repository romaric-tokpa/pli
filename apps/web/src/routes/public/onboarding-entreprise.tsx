// SiteOnboarding — port verbatim de site-auth.jsx.
// Stepper 3 étapes : Infos entreprise → Premiers salariés → Démarrer l'essai.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Icon, Logo, Stepper, TextField } from '@pli/ui';

const ETAPES = ['Informations entreprise', 'Premiers salariés', "Démarrer l'essai"];

export function SiteOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-screen bg-papier">
      <header className="px-5 md:px-8 py-4 flex items-center justify-between border-b border-bordure bg-white">
        <Logo size={32} withWordmark />
        <span className="text-[12px] text-texte-secondaire">
          Configuration initiale · étape {step} / 3
        </span>
      </header>
      <main className="max-w-3xl mx-auto px-5 md:px-8 py-10">
        <Card padding="p-6">
          <Stepper steps={ETAPES} current={step} />
        </Card>

        <div className="mt-6">
          {step === 1 && (
            <Card padding="p-7">
              <h1 className="text-[20px] font-semibold text-encre">
                Quelques informations sur votre entreprise
              </h1>
              <p className="mt-1 text-[13px] text-texte-secondaire">
                Ces informations apparaissent sur l'en-tête des bulletins remis aux salariés.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Raison sociale"
                  value="Groupe Atlantique CI"
                  onChange={() => {}}
                />
                <TextField
                  label="Numéro RCCM"
                  value=""
                  onChange={() => {}}
                  placeholder="Ex. CI-ABJ-2014-B-12378"
                />
                <TextField
                  label="Numéro CC (NCC)"
                  value=""
                  onChange={() => {}}
                  placeholder="Ex. 1402357 H"
                />
                <TextField
                  label="Adresse"
                  value=""
                  onChange={() => {}}
                  placeholder="BP 1234, Abidjan, Plateau"
                />
                <TextField label="Téléphone" icon="Phone" value="" onChange={() => {}} />
                <TextField label="E-mail entreprise" icon="Mail" value="" onChange={() => {}} />
              </div>
              <div className="mt-6 flex justify-between gap-2">
                <Link to="/">
                  <Button variant="ghost">Plus tard</Button>
                </Link>
                <Button variant="primary" iconRight="ArrowRight" onClick={() => setStep(2)}>
                  Continuer
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card padding="p-7">
              <h1 className="text-[20px] font-semibold text-encre">
                Ajoutez vos premiers salariés
              </h1>
              <p className="mt-1 text-[13px] text-texte-secondaire">
                Importez votre registre depuis un fichier ou ajoutez quelques salariés manuellement
                pour démarrer.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/pro/salaries/import"
                  className="rounded-lg border border-bordure p-5 hover:border-encre transition text-left block focus-ring"
                >
                  <div className="h-11 w-11 rounded-md bg-papier border border-bordure flex items-center justify-center text-cachet">
                    <Icon name="CloudUpload" size={18} />
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold text-encre">Importer un fichier</h3>
                  <p className="mt-1 text-[12.5px] text-texte-secondaire">
                    CSV ou Excel — gérez d'un coup tout votre registre.
                  </p>
                </Link>
                <Link
                  to="/pro/salaries"
                  className="rounded-lg border border-bordure p-5 hover:border-encre transition text-left block focus-ring"
                >
                  <div className="h-11 w-11 rounded-md bg-papier border border-bordure flex items-center justify-center text-cachet">
                    <Icon name="UserPlus" size={18} />
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold text-encre">
                    Ajouter manuellement
                  </h3>
                  <p className="mt-1 text-[12.5px] text-texte-secondaire">
                    Pour démarrer avec quelques salariés en test.
                  </p>
                </Link>
              </div>
              <div className="mt-6 flex justify-between gap-2">
                <Button variant="ghost" onClick={() => setStep(1)} icon="ArrowLeft">
                  Précédent
                </Button>
                <Button variant="primary" iconRight="ArrowRight" onClick={() => setStep(3)}>
                  Passer cette étape
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card padding="p-7">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-cachet/15 text-cachet flex items-center justify-center">
                  <Icon name="Gift" size={22} />
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-encre">Votre essai a démarré</h1>
                  <p className="text-[13px] text-texte-secondaire">
                    20 bulletins offerts pour découvrir Pli, sans engagement.
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-lg bg-papier border border-bordure p-5">
                <div
                  className="text-[12px] uppercase tracking-wide text-texte-secondaire"
                  style={{ letterSpacing: '.06em' }}
                >
                  Ce que vous pouvez faire dès maintenant
                </div>
                <ul className="mt-2 space-y-2">
                  {[
                    'Importer ou ajouter vos salariés',
                    'Déposer un premier bulletin (individuel ou en masse)',
                    'Suivre les consultations et signatures',
                    "Activer votre paiement Chèque ou Wave à l'épuisement de l'essai",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2 text-[13.5px] text-encre">
                      <Icon name="Check" size={14} className="text-succes" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex justify-between gap-2">
                <Button variant="ghost" onClick={() => setStep(2)} icon="ArrowLeft">
                  Précédent
                </Button>
                <Button variant="primary" icon="LayoutDashboard" onClick={() => navigate('/pro')}>
                  Accéder à mon espace
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
