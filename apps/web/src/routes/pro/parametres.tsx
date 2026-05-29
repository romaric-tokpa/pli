// Paramètres Pli Pro — port verbatim de pro-facturation-securite.jsx
// (ProParametres). Données entreprise via ParametresService + FacturationService
// pour le plan rappelé en sidebar.

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Switch,
  TextField,
} from '@pli/ui';
import type { Entreprise } from '@pli/types';
import {
  creerFacturationServiceMock,
  creerParametresServiceMock,
  type ContexteEntreprise,
  type PreferencesDistribution,
} from '../../services/index.js';
import { ProPageHeader } from './_page-header.js';

const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};

// TODO(phase-1) — wirer à AuthService.contexteCourant() pour l'identité du tenant
const ID_PLI = 'ENT-08431';
const DATE_ACTIVATION = '12/01/2024';
const CONSEILLER = 'Drissa Diomandé';

export function ProParametres() {
  const services = useMemo(
    () => ({
      parametres: creerParametresServiceMock(),
      facturation: creerFacturationServiceMock(),
    }),
    [],
  );

  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [prefs, setPrefs] = useState<PreferencesDistribution | null>(null);
  const [planLibelle, setPlanLibelle] = useState('Mensuel — 275 FCFA / salarié');

  useEffect(() => {
    void (async () => {
      const [e, p, ab] = await Promise.all([
        services.parametres.obtenirEntreprise(CONTEXTE_PRO),
        services.parametres.obtenirPreferences(CONTEXTE_PRO),
        services.facturation.obtenirAbonnement(CONTEXTE_PRO),
      ]);
      setEntreprise(e);
      setPrefs(p);
      if (ab) {
        const nom = ab.cycle === 'mensuel' ? 'Mensuel' : 'Annuel';
        setPlanLibelle(`${nom} — ${ab.tarifMois} FCFA / salarié`);
      }
    })();
  }, [services]);

  async function bascule(cle: keyof PreferencesDistribution, valeur: boolean) {
    const res = await services.parametres.basculerPreference(CONTEXTE_PRO, cle, valeur);
    if (res.ok) setPrefs(res.valeur);
  }

  const initiales = entreprise
    ? entreprise.nom
        .split(/\s+/)
        .slice(0, 2)
        .map((m) => m[0] ?? '')
        .join('')
        .toUpperCase()
    : 'GA';

  return (
    <>
      <ProPageHeader
        title="Paramètres"
        subtitle="Informations de votre entreprise et préférences."
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Informations légales</h2>
            <p className="text-[13px] text-texte-secondaire mb-5">
              Ces informations apparaissent sur les en-têtes de vos bulletins.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Raison sociale"
                value={entreprise?.raisonSociale ?? ''}
                onChange={() => {}}
              />
              <TextField
                label="Numéro RCCM"
                value={entreprise?.rccm ?? ''}
                onChange={() => {}}
              />
              <TextField
                label="Numéro CC (NCC)"
                value={entreprise?.ncc ?? ''}
                onChange={() => {}}
              />
              <TextField
                label="Adresse"
                value={entreprise?.adresse ?? ''}
                onChange={() => {}}
              />
              <TextField
                label="Téléphone"
                icon="Phone"
                value={entreprise?.telephone ?? ''}
                onChange={() => {}}
              />
              <TextField
                label="E-mail"
                icon="Mail"
                value={entreprise?.email ?? ''}
                onChange={() => {}}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary">Annuler</Button>
              <Button variant="primary" icon="Check">
                Enregistrer
              </Button>
            </div>
          </Card>

          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">
              Préférences de distribution
            </h2>
            <p className="text-[13px] text-texte-secondaire mb-5">
              Règles appliquées par défaut à toutes les périodes de paie.
            </p>
            <div className="space-y-1 divide-y divide-bordure">
              <div className="py-3">
                <Switch
                  checked={prefs?.signatureObligatoireAvantConsultation ?? false}
                  onChange={(v) => bascule('signatureObligatoireAvantConsultation', v)}
                  label="Signature obligatoire avant consultation"
                  hint="Si désactivé, le salarié peut consulter puis signer en accusé de réception."
                />
              </div>
              <div className="py-3">
                <Switch
                  checked={prefs?.relanceAutoJ3 ?? true}
                  onChange={(v) => bascule('relanceAutoJ3', v)}
                  label="Relance automatique à J+3"
                  hint="Un e-mail est envoyé aux salariés non-consultés."
                />
              </div>
              <div className="py-3">
                <Switch
                  checked={prefs?.notificationEmailNouveauBulletin ?? true}
                  onChange={(v) => bascule('notificationEmailNouveauBulletin', v)}
                  label="Notification e-mail à chaque nouveau bulletin"
                  hint="Le salarié reçoit un e-mail dès la distribution."
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Logo de l'entreprise</h2>
            <p className="text-[13px] text-texte-secondaire">
              Affiché en en-tête des bulletins et dans l'app salarié.
            </p>
            <div className="mt-4 aspect-square rounded-lg bg-papier border border-dashed border-bordure flex items-center justify-center text-texte-secondaire">
              <div className="text-center">
                <div className="h-14 w-14 mx-auto rounded bg-white border border-bordure flex items-center justify-center text-encre font-semibold text-[18px]">
                  {initiales}
                </div>
                <div className="mt-3 text-[12px]">Aucun logo personnalisé</div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="secondary" icon="Upload" fullWidth>
                Téléverser un logo
              </Button>
            </div>
          </Card>

          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Identifiants</h2>
            <dl className="mt-3 space-y-2.5">
              {[
                ['ID Pli', ID_PLI],
                ['Plan', planLibelle],
                ["Date d'activation", DATE_ACTIVATION],
                ['Conseiller', CONSEILLER],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-[13px]">
                  <dt className="text-texte-secondaire">{k}</dt>
                  <dd className="text-encre font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card padding="p-6" className="border-erreur/30">
            <h2 className="text-[15px] font-semibold text-erreur">Zone sensible</h2>
            <p className="mt-1 text-[12.5px] text-texte-secondaire">
              Désactivation temporaire ou suppression de l'espace.
            </p>
            <div className="mt-3 space-y-2">
              <Button variant="secondary" size="sm" fullWidth>
                Désactiver l'espace
              </Button>
              <Button variant="danger" size="sm" fullWidth>
                Demander la suppression
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
