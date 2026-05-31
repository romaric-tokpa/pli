// ProBulletinDepotIndividuel — dépôt unitaire d'un bulletin (A.1).
// Port verbatim de _wireframe/src/pro-bulletins.jsx (ProBulletinDepotIndividuel).
//
// Cœur du système : un PDF → un matricule → un salarié → distribution.
//
// INVARIANT CLAUDE.md « L'appairage du matricule est borné au registre de
// l'entreprise du contexte » : la résolution passe EXCLUSIVEMENT par
// `SalariesService.resoudreParMatricule(ctx, matricule)` — couvert par le
// test de contrat `suiteContratAppairageBorneTenant` (5 cas, dont le
// matricule en collision MAT-00112 / Aya Koffi vs Karim Bah).
//
// 3 étapes :
//   1. Sélection du fichier PDF (Uploader, 10 Mo max — borne UI uniquement,
//      la validation type/taille réelle vit côté serveur en Phase 1).
//   2. Saisie matricule + période → résolution bornée tenant + détection
//      d'un bulletin déjà existant pour cette période (warning + checkbox
//      « Remplacer le bulletin existant — action journalisée »).
//   3. Récapitulatif → distribution. Toast de confirmation, retour à la
//      liste bulletins.

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Salarie } from '@pli/types';
import type { BulletinResume } from '../../../services/index.js';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Icon,
  IconButton,
  Select,
  StatusPill,
  Stepper,
  TextField,
  Uploader,
  useToast,
} from '@pli/ui';
import {
  creerBulletinsServiceMock,
  creerSalariesServiceMock,
  type ContexteEntreprise,
} from '../../../services/index.js';
import { ProPageHeader } from '../_page-header.js';

// TODO(phase-1) — wirer à AuthService.contexteCourant()
const CONTEXTE_PRO: ContexteEntreprise = {
  type: 'entreprise',
  entrepriseId: 'atlantique',
};
const ENTREPRISE_NOM = 'Groupe Atlantique CI';

const PERIODES = [
  { value: '2026-02', label: 'Février 2026' },
  { value: '2026-01', label: 'Janvier 2026' },
  { value: '2025-12', label: 'Décembre 2025' },
  { value: '2025-11', label: 'Novembre 2025' },
];

interface FichierSelectionne {
  name: string;
  size: number;
}

export function ProBulletinDepotIndividuel() {
  const navigate = useNavigate();
  const pousser = useToast();
  const services = useMemo(
    () => ({
      salaries: creerSalariesServiceMock(),
      bulletins: creerBulletinsServiceMock(),
    }),
    [],
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<FichierSelectionne | null>(null);
  const [matricule, setMatricule] = useState('');
  const [periode, setPeriode] = useState('2026-02');
  const [forceReplace, setForceReplace] = useState(false);

  const [salarie, setSalarie] = useState<Salarie | null>(null);
  const [resolutionEnCours, setResolutionEnCours] = useState(false);
  const [bulletinExistant, setBulletinExistant] = useState<BulletinResume | null>(null);

  // ─── Résolution matricule → salarié (bornée tenant) ─────────────────────
  useEffect(() => {
    if (!matricule) {
      setSalarie(null);
      setBulletinExistant(null);
      return;
    }
    let actif = true;
    setResolutionEnCours(true);
    void (async () => {
      const s = await services.salaries.resoudreParMatricule(CONTEXTE_PRO, matricule);
      if (!actif) return;
      setSalarie(s);
      setResolutionEnCours(false);
      if (s) {
        // Existence du bulletin pour cette période — lecture de la liste (résumés
        // sans montants, conforme à l'invariant 1).
        const liste = await services.bulletins.lister(CONTEXTE_PRO, { periode });
        if (!actif) return;
        const existant = liste.find((b) => b.salarieId === s.id) ?? null;
        setBulletinExistant(existant);
      } else {
        setBulletinExistant(null);
      }
    })();
    return () => {
      actif = false;
    };
  }, [matricule, periode, services]);

  const erreurMatricule = matricule && !resolutionEnCours && !salarie ? 'Matricule introuvable' : null;
  const canValider = Boolean(file && salarie && periode && (!bulletinExistant || forceReplace));

  const submitStep = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1 && file) setStep(2);
    else if (step === 2 && canValider) setStep(3);
  };

  const distribuer = () => {
    pousser({
      message: `Bulletin distribué à ${salarie?.nom ?? ''}`,
      tone: 'succes',
    });
    navigate('/pro/bulletins');
  };

  const periodeLabel = PERIODES.find((p) => p.value === periode)?.label ?? periode;

  return (
    <>
      <ProPageHeader
        breadcrumbs={[
          { label: 'Bulletins', href: '/pro/bulletins' },
          { label: 'Dépôt individuel' },
        ]}
        title="Déposer un bulletin"
        subtitle="Un PDF, un matricule, un salarié. Pli vérifie l'appairage avant la distribution."
      />

      <form onSubmit={submitStep} className="p-8 space-y-6 max-w-3xl">
        {/* Bandeau contexte employeur — invariant tenant explicité à l'écran */}
        <Card padding="p-3.5" className="border-encre/20" bg="bg-encre/5">
          <div className="flex items-center gap-3">
            <Icon name="Building2" size={16} className="text-encre shrink-0" />
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                style={{ letterSpacing: '.05em' }}
              >
                Bulletin pour
              </div>
              <div className="text-[14px] font-semibold text-encre truncate">
                {ENTREPRISE_NOM}
              </div>
              <div className="text-[11.5px] text-texte-secondaire mt-0.5">
                Recherche matricule dans le registre de cette entreprise uniquement
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11.5px] text-texte-secondaire">
              <Icon name="Lock" size={11} />
              Verrouillé
            </span>
          </div>
        </Card>

        <Card padding="p-5">
          <Stepper steps={['Fichier PDF', 'Appairage', 'Distribution']} current={step} />
        </Card>

        {/* ─── Étape 1 : sélection PDF ───────────────────────────────── */}
        {step === 1 && (
          <Card padding="p-6">
            {!file ? (
              <Uploader
                accept=".pdf"
                onFiles={(files) => {
                  const f = files[0];
                  if (f) setFile({ name: f.name, size: f.size });
                }}
                hint="Un seul fichier PDF (10 Mo max.)"
                label="Glissez le bulletin PDF ici ou cliquez pour parcourir"
              />
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-md bg-papier border border-bordure">
                <div className="h-12 w-12 rounded bg-white border border-bordure flex items-center justify-center text-encre">
                  <Icon name="FileText" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-encre truncate">
                    {file.name}
                  </div>
                  <div className="text-[12px] text-texte-secondaire">
                    PDF · {Math.round(file.size / 1024)} Ko
                  </div>
                </div>
                <IconButton
                  icon="X"
                  ariaLabel="Retirer"
                  onClick={() => setFile(null)}
                  size="sm"
                />
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => navigate('/pro/bulletins')}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                type="submit"
                iconRight="ArrowRight"
                disabled={!file}
              >
                Suivant
              </Button>
            </div>
          </Card>
        )}

        {/* ─── Étape 2 : appairage matricule + période ────────────────── */}
        {step === 2 && (
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Appairer au salarié</h2>
            <p className="mt-1 text-[13px] text-texte-secondaire">
              Saisissez le matricule du salarié et la période concernée. La résolution est
              bornée au registre de {ENTREPRISE_NOM}.
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Matricule du salarié"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="Ex. MAT-00112"
                icon="Hash"
                error={erreurMatricule ?? undefined}
                hint={!erreurMatricule && salarie ? `Appairé à ${salarie.nom}` : undefined}
                required
              />
              <Select
                label="Période de paie"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                options={PERIODES}
                icon="Calendar"
              />
            </div>

            {/* Salarié résolu */}
            {salarie && (
              <div
                className="mt-5 rounded-lg border border-bordure p-4 flex items-center gap-3 bg-succes/5"
                data-testid="salarie-resolu"
              >
                <Avatar name={salarie.nom} size={40} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-encre">{salarie.nom}</div>
                    <StatusPill tone="succes" size="sm" icon="Check">
                      Salarié trouvé
                    </StatusPill>
                  </div>
                  <div className="text-[12px] text-texte-secondaire">
                    {salarie.matricule} · {salarie.service} · {salarie.email}
                  </div>
                </div>
              </div>
            )}

            {erreurMatricule && (
              <div
                className="mt-5 rounded-lg border border-erreur/30 bg-erreur/5 p-4 flex items-start gap-3"
                data-testid="matricule-introuvable"
              >
                <Icon name="TriangleAlert" size={16} className="text-erreur shrink-0 mt-0.5" />
                <div className="flex-1 text-[13px]">
                  <div className="font-medium text-encre">Matricule introuvable</div>
                  <div className="text-texte-secondaire">
                    Vérifiez le matricule ou créez d'abord le salarié dans le registre.
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="UserPlus"
                  type="button"
                  onClick={() => navigate('/pro/salaries')}
                >
                  Voir les salariés
                </Button>
              </div>
            )}

            {bulletinExistant && (
              <div className="mt-5 rounded-lg border border-attente/30 bg-attente/5 p-4 flex items-start gap-3">
                <Icon name="TriangleAlert" size={16} className="text-attente shrink-0 mt-0.5" />
                <div className="flex-1 text-[13px]">
                  <div className="font-medium text-encre">Bulletin déjà distribué</div>
                  <div className="text-texte-secondaire">
                    Un bulletin pour la période {periodeLabel} existe déjà pour ce salarié.
                  </div>
                  <div className="mt-2">
                    <Checkbox
                      checked={forceReplace}
                      onChange={() => setForceReplace(!forceReplace)}
                      label="Remplacer le bulletin existant (action journalisée)"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between gap-2">
              <Button
                variant="ghost"
                type="button"
                icon="ArrowLeft"
                onClick={() => setStep(1)}
              >
                Précédent
              </Button>
              <Button
                variant="primary"
                type="submit"
                iconRight="ArrowRight"
                disabled={!canValider}
              >
                Continuer
              </Button>
            </div>
          </Card>
        )}

        {/* ─── Étape 3 : récap + distribution ───────────────────────── */}
        {step === 3 && file && salarie && (
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Récapitulatif</h2>
            <p className="mt-1 text-[13px] text-texte-secondaire">
              Vérifiez avant de distribuer.
            </p>

            <div className="mt-5 rounded-lg border border-bordure overflow-hidden">
              <div className="px-4 py-3 bg-papier border-b border-bordure flex items-center gap-3">
                <Icon name="FileText" size={16} className="text-encre" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-encre truncate">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-texte-secondaire">{periodeLabel}</div>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-texte-secondaire">Salarié : </span>
                  <strong className="text-encre">{salarie.nom}</strong>
                </div>
                <div>
                  <span className="text-texte-secondaire">Matricule : </span>
                  <span className="font-mono">{salarie.matricule}</span>
                </div>
                <div>
                  <span className="text-texte-secondaire">Service : </span>
                  {salarie.service}
                </div>
                <div>
                  <span className="text-texte-secondaire">E-mail : </span>
                  {salarie.email}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-papier border border-bordure p-3 text-[12.5px] text-texte-secondaire">
              Le salarié sera notifié dès la validation. Le bulletin sera scellé et stocké
              dans son coffre-fort avec un horodatage.
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <Button
                variant="ghost"
                type="button"
                icon="ArrowLeft"
                onClick={() => setStep(2)}
              >
                Précédent
              </Button>
              <Button variant="primary" type="button" icon="Send" onClick={distribuer}>
                Valider et distribuer
              </Button>
            </div>
          </Card>
        )}
      </form>

      <div className="px-8 pb-8 text-[11px] text-texte-secondaire flex items-center gap-1.5 max-w-3xl">
        <Icon name="ShieldCheck" size={11} className="text-succes" />
        Lien direct vers le{' '}
        <Link to="/pro/bulletins/upload" className="text-encre underline ml-1">
          dépôt en masse
        </Link>{' '}
        si vous avez plusieurs bulletins à distribuer.
      </div>
    </>
  );
}
