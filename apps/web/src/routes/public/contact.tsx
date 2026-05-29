// PageContact — formulaire de contact + sidebar SLA.

import { useState } from 'react';
import { Button, Card, Checkbox, Icon, Select, TextField } from '@pli/ui';
import { SitePageShell } from './_layout.js';
import { SitePageHero } from './_page-hero.js';

type TypeDemande = 'commercial' | 'demo' | 'partenariat';

const TAILLES_ENTREPRISE = [
  { value: '1-10', label: '1 à 10 salariés' },
  { value: '11-50', label: '11 à 50 salariés' },
  { value: '51-200', label: '51 à 200 salariés' },
  { value: '200+', label: 'Plus de 200 salariés' },
];

export function PageContact() {
  const [type, setType] = useState<TypeDemande>('commercial');
  const [nom, setNom] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [emailPro, setEmailPro] = useState('');
  const [telephone, setTelephone] = useState('');
  const [taille, setTaille] = useState('');
  const [message, setMessage] = useState('');
  const [accepteConfidentialite, setAccepteConfidentialite] = useState(false);

  return (
    <SitePageShell>
      <SitePageHero
        breadcrumbs={[{ label: 'Ressources' }, { label: 'Contact' }]}
        eyebrow="Ressources"
        titre="Contactez l'équipe Pli"
        sousTitre="Réponse sous 4 heures ouvrées. Démos planifiées sous 48 heures."
        icon="MessageSquare"
      />
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-10 pb-16">

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <Card>
            <h2 className="text-[15px] font-semibold text-encre">Type de demande</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  { v: 'commercial', l: 'Commercial', i: 'Briefcase' },
                  { v: 'demo', l: 'Démo', i: 'CirclePlay' },
                  { v: 'partenariat', l: 'Partenariat', i: 'Handshake' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setType(opt.v)}
                  className={`h-10 px-3 rounded border text-[13px] inline-flex items-center justify-center gap-2 transition focus-ring ${
                    type === opt.v
                      ? 'bg-encre text-white border-encre'
                      : 'bg-white text-encre border-bordure hover:border-encre'
                  }`}
                >
                  <Icon name={opt.i} size={14} />
                  {opt.l}
                </button>
              ))}
            </div>

            <form
              className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <TextField
                label="Nom complet"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
              <TextField
                label="Entreprise"
                value={entreprise}
                onChange={(e) => setEntreprise(e.target.value)}
                required
              />
              <TextField
                label="E-mail professionnel"
                type="email"
                value={emailPro}
                onChange={(e) => setEmailPro(e.target.value)}
                icon="Mail"
                required
              />
              <TextField
                label="Téléphone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                icon="Phone"
                placeholder="+225 …"
              />
              <div className="md:col-span-2">
                <Select
                  label="Taille de l'entreprise"
                  value={taille}
                  onChange={(e) => setTaille(e.target.value)}
                  options={TAILLES_ENTREPRISE}
                  placeholder="Sélectionner"
                  icon="Users"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="contact-message"
                  className="block text-[13px] font-medium text-encre mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Décrivez votre besoin…"
                  className="w-full px-3 py-2 bg-white rounded-md border border-bordure focus-within:border-encre outline-none text-[14px] text-encre placeholder:text-[#9AA3B2]"
                />
              </div>
              <div className="md:col-span-2">
                <Checkbox
                  checked={accepteConfidentialite}
                  onChange={(e) => setAccepteConfidentialite(e.target.checked)}
                  label="J'accepte que mes informations soient utilisées pour répondre à ma demande."
                />
              </div>
              <div className="md:col-span-2">
                <Button variant="primary" fullWidth disabled={!accepteConfidentialite}>
                  Envoyer ma demande
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <Card>
              <h3 className="text-[14px] font-semibold text-encre">Nous joindre</h3>
              <ul className="mt-3 space-y-2.5 text-[13.5px] text-encre">
                <li className="flex items-start gap-2">
                  <Icon name="MapPin" size={14} className="text-cachet mt-0.5 shrink-0" />
                  <span>Plateau, Abidjan — Côte d'Ivoire</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Phone" size={14} className="text-cachet mt-0.5 shrink-0" />
                  <span>+225 27 20 30 40 50</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Mail" size={14} className="text-cachet mt-0.5 shrink-0" />
                  <span>commercial@pli.ci</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Clock" size={14} className="text-cachet mt-0.5 shrink-0" />
                  <span>Lundi – Vendredi · 8h – 18h</span>
                </li>
              </ul>
            </Card>
            <Card bg="bg-encre" className="text-white">
              <h3 className="text-[14px] font-semibold">Notre engagement</h3>
              <ul className="mt-3 space-y-2 text-[13px] text-white/80">
                <li>Réponse commerciale &lt; 4 h ouvrées</li>
                <li>Démo planifiée &lt; 48 h</li>
                <li>Onboarding cabinet &lt; 7 jours</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </SitePageShell>
  );
}
