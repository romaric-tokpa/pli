// CabinetParametres — informations du cabinet, sécurité, identifiants
// (sub-lot 11c). Porté de _wireframe/src/cabinet-screens.jsx
// (CabinetParametres). Le bandeau « Cloisonnement » est rappelé en bas
// de page comme dans le wireframe — point d'ancrage visuel de l'invariant 5.

import { useEffect, useMemo, useState } from 'react';
import type { Cabinet } from '@pli/types';
import {
  Button,
  Card,
  Icon,
  Select,
  Switch,
  TextField,
  useToast,
} from '@pli/ui';
import {
  creerCabinetsServiceMock,
  type ContextePortefeuilleCabinet,
} from '../../services/index.js';
import { CabinetPageHeader } from './_page-header.js';

// TODO(phase-1) — voir _layout.tsx ; le « Conseiller » est hardcodé pour la
// démo (en Phase 1, il viendra du CRM ops Pli).
const CONTEXTE_DEMO: ContextePortefeuilleCabinet = {
  type: 'portefeuille_cabinet',
  cabinetId: 'cab-ebrie',
};
const CONSEILLER_DEMO = 'Drissa Diomandé';

export function CabinetParametres() {
  const services = useMemo(() => ({ cabinets: creerCabinetsServiceMock() }), []);
  const pousser = useToast();

  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [a2fObligatoire, setA2fObligatoire] = useState(true);
  const [alertesConnexion, setAlertesConnexion] = useState(true);
  const [lectureSeuleEntreprises, setLectureSeuleEntreprises] = useState(false);

  useEffect(() => {
    void (async () => {
      const cab = await services.cabinets.obtenirCabinet(CONTEXTE_DEMO);
      setCabinet(cab);
    })();
  }, [services]);

  if (!cabinet) {
    return (
      <div className="p-12">
        <Card padding="p-6">
          <div className="h-6 w-48 bg-surface rounded animate-pulse" />
        </Card>
      </div>
    );
  }

  return (
    <>
      <CabinetPageHeader title="Paramètres" subtitle="Informations du cabinet" />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Informations</h2>
            <p className="text-[12.5px] text-texte-secondaire mb-5">
              Ces informations sont utilisées par Pli (facturation, contact).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Nom du cabinet" value={cabinet.nom} onChange={() => {}} />
              <Select
                label="Type"
                value={cabinet.type}
                onChange={() => {}}
                options={[
                  { value: 'comptable', label: 'Comptable' },
                  { value: 'interim', label: 'Intérim' },
                ]}
              />
              <TextField label="Contact principal" value={cabinet.contact} onChange={() => {}} />
              <TextField
                label="E-mail"
                icon="Mail"
                value={cabinet.email}
                onChange={() => {}}
              />
              <TextField
                label="Téléphone"
                icon="Phone"
                value={cabinet.telephone}
                onChange={() => {}}
              />
              <TextField label="Adresse" value={cabinet.adresse} onChange={() => {}} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary">Annuler</Button>
              <Button
                variant="primary"
                icon="Check"
                onClick={() =>
                  pousser({ message: 'Informations enregistrées', tone: 'succes' })
                }
              >
                Enregistrer
              </Button>
            </div>
          </Card>

          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Sécurité</h2>
            <div className="mt-4 space-y-1 divide-y divide-bordure">
              <div className="py-3">
                <Switch
                  checked={a2fObligatoire}
                  onChange={() => setA2fObligatoire((v) => !v)}
                  label="2FA obligatoire pour tous les gestionnaires"
                  hint="Authentification à deux facteurs requise à chaque connexion."
                />
              </div>
              <div className="py-3">
                <Switch
                  checked={alertesConnexion}
                  onChange={() => setAlertesConnexion((v) => !v)}
                  label="Alertes de connexion par e-mail"
                  hint="Recevoir un e-mail à chaque nouvelle connexion d'un gestionnaire."
                />
              </div>
              <div className="py-3">
                <Switch
                  checked={lectureSeuleEntreprises}
                  onChange={() => setLectureSeuleEntreprises((v) => !v)}
                  label="Lecture seule pour les entreprises clientes"
                  hint="Permet à l'entreprise cliente d'observer son espace sans pouvoir l'éditer."
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Identifiants</h2>
            <dl className="mt-3 space-y-2.5">
              {(
                [
                  ['ID Pli', `CAB-${cabinet.id.slice(-5).toUpperCase()}`],
                  ['Mode', cabinet.modeFacturation === 'consolide' ? 'Consolidé' : 'Par entreprise'],
                  ['Date contrat', cabinet.dateContrat],
                  ['Conseiller', CONSEILLER_DEMO],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-[13px]">
                  <dt className="text-texte-secondaire">{k}</dt>
                  <dd className="text-encre font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card padding="p-6" className="bg-papier">
            <h2 className="text-[15px] font-semibold text-encre flex items-center gap-2">
              <Icon name="ShieldCheck" size={14} className="text-succes" />
              Cloisonnement
            </h2>
            <p className="text-[12.5px] text-texte-secondaire mt-2">
              Vos entreprises clientes restent cloisonnées entre elles. Les salariés ne
              voient jamais votre cabinet — l'employeur affiché est toujours l'entreprise
              cliente.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
