// ProSalariesImport — assistant d'import salariés en 4 étapes (Téléverser →
// Mapper → Valider → Importer). Port verbatim de pro-salaries.jsx.
//
// L'Uploader porte ses bornes UI :
//   - accept = ".csv,.xlsx,.xls"  (types affichés)
//   - taille max. 5 Mo (affichée dans hint)
//   - état d'erreur (prop `erreur`) — visuel rouge si dépassement
// La VALIDATION RÉELLE de taille/contenu est repoussée à l'IngestionService
// branché en Phase 2. Pour Phase 0, on simule un erreur fichier > 5 Mo.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Icon,
  IconButton,
  Select,
  StatusPill,
  Stepper,
  Table,
  Uploader,
  useToast,
} from '@pli/ui';
import { ProPageHeader } from '../_page-header.js';

const TAILLE_MAX_MO = 5;

const ETAPES = ['Téléverser', 'Mapper', 'Valider', 'Importer'];

const CHAMPS_MAPPING = [
  { key: 'matricule' as const, label: 'Matricule', opts: ['MAT', 'Numéro', 'ID salarié'] },
  { key: 'nom' as const, label: 'Nom complet', opts: ['Nom Prénom', 'Nom & prénom', 'Salarié'] },
  { key: 'email' as const, label: 'E-mail', opts: ['Adresse mail', 'Email', 'Mail pro'] },
  { key: 'service' as const, label: 'Service', opts: ['Service', 'Pôle', 'Département'] },
  { key: 'statut' as const, label: 'Statut', opts: ['Statut', 'État', 'Actif/Inactif'] },
];

interface LigneValidation {
  ligne: number;
  matricule: string;
  nom: string;
  email: string;
  service: string;
  statut: 'ok' | 'erreur';
  erreur?: string;
}

// TODO(phase-1) — wirer à IngestionService.validerFichier(file, ctx)
const VALIDATIONS_DEMO: LigneValidation[] = [
  { ligne: 2, matricule: 'MAT-00251', nom: 'Yannick Akré', email: 'y.akre@atlantique.ci', service: 'Production', statut: 'ok' },
  { ligne: 3, matricule: 'MAT-00252', nom: 'Aïcha Konaté', email: 'aicha.k@atlantique.ci', service: 'Logistique', statut: 'ok' },
  { ligne: 4, matricule: 'MAT-00253', nom: 'Élise Yobouet', email: 'e.yobouet[at]atlantique', service: 'Commercial', statut: 'erreur', erreur: 'Email invalide' },
  { ligne: 5, matricule: 'MAT-00254', nom: 'Hervé Dosso', email: 'h.dosso@atlantique.ci', service: 'RH', statut: 'ok' },
  { ligne: 6, matricule: 'MAT-00255', nom: 'Kader Soumahoro', email: 'k.soumahoro@atlantique.ci', service: 'Production', statut: 'ok' },
  { ligne: 7, matricule: 'MAT-00112', nom: 'Aya K.', email: 'aya.k@atlantique.ci', service: 'Comptabilité', statut: 'erreur', erreur: 'Matricule en double' },
  { ligne: 8, matricule: 'MAT-00256', nom: 'Bénédicte Affoué', email: 'b.affoue@atlantique.ci', service: 'Comptabilité', statut: 'ok' },
  { ligne: 9, matricule: 'MAT-00257', nom: 'Lassiné Diabaté', email: 'l.diabate@atlantique.ci', service: 'Logistique', statut: 'ok' },
  { ligne: 10, matricule: 'MAT-00258', nom: 'Olivia Memel', email: 'o.memel@atlantique.ci', service: 'Direction', statut: 'ok' },
  { ligne: 11, matricule: 'MAT-00259', nom: 'Reine Aké', email: 'r.ake@atlantique.ci', service: 'Maintenance', statut: 'ok' },
  { ligne: 12, matricule: 'MAT-00260', nom: 'Térence Wéah', email: 't.weah@atlantique.ci', service: 'Commercial', statut: 'ok' },
  { ligne: 13, matricule: 'MAT-00261', nom: 'Augustine Méï', email: 'a.mei@atlantique.ci', service: 'RH', statut: 'ok' },
  { ligne: 14, matricule: 'MAT-00262', nom: 'Pacôme Ouattara', email: 'p.ouattara@atlantique.ci', service: 'Informatique', statut: 'ok' },
  { ligne: 15, matricule: 'MAT-00263', nom: 'Sandrine Béhi', email: 's.behi@atlantique.ci', service: 'Production', statut: 'ok' },
  { ligne: 16, matricule: 'MAT-00264', nom: 'Issa Berté', email: 'i.berte@atlantique.ci', service: 'Logistique', statut: 'ok' },
  { ligne: 17, matricule: 'MAT-00265', nom: 'Yvette Kéita', email: 'y.keita@atlantique.ci', service: 'Maintenance', statut: 'ok' },
  { ligne: 18, matricule: 'MAT-00266', nom: 'Camille Coulibaly', email: 'c.coulibaly@atlantique.ci', service: 'Commercial', statut: 'ok' },
  { ligne: 19, matricule: 'MAT-00267', nom: 'Dieudonné Nahounou', email: 'd.nahounou@atlantique.ci', service: 'Direction', statut: 'ok' },
  { ligne: 20, matricule: 'MAT-00268', nom: 'Magloire Boa', email: 'm.boa@atlantique.ci', service: 'Production', statut: 'ok' },
];

// TODO(phase-1) — wirer à EntrepriseService.obtenirCourante(ctx)
const ENTREPRISE_NOM = 'Groupe Atlantique CI';

export function ProSalariesImport() {
  const navigate = useNavigate();
  const pousser = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [mapping, setMapping] = useState<Record<string, string>>({
    matricule: 'MAT',
    nom: 'Nom Prénom',
    email: 'Adresse mail',
    service: 'Service',
    statut: 'Statut',
  });

  const valides = VALIDATIONS_DEMO.filter((v) => v.statut === 'ok').length;
  const erreurs = VALIDATIONS_DEMO.length - valides;

  const handleFiles = (files: File[]) => {
    const f = files[0];
    setFileError(undefined);
    if (!f) {
      setFileName('registre_salaries_2026.xlsx');
      return;
    }
    // Bornes UI — la validation réelle viendra en Phase 2 via IngestionService.
    const tailleMo = f.size / (1024 * 1024);
    if (tailleMo > TAILLE_MAX_MO) {
      setFileError(
        `Fichier trop volumineux (${tailleMo.toFixed(1)} Mo) — la taille maximale est de ${TAILLE_MAX_MO} Mo.`,
      );
      setFileName('');
      return;
    }
    setFileName(f.name);
  };

  return (
    <>
      <ProPageHeader
        breadcrumbs={[
          { label: 'Salariés', href: '/pro/salaries' },
          { label: 'Importer des salariés' },
        ]}
        title="Importer des salariés"
        subtitle="Téléversez votre registre depuis un fichier CSV ou Excel."
      />

      <div className="p-8 space-y-6">
        {/* Bandeau contexte employeur — verrouillé */}
        <Card padding="p-3.5" className="border-encre/20" bg="bg-encre/5">
          <div className="flex items-center gap-3">
            <Icon name="Building2" size={16} className="text-encre shrink-0" />
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] uppercase tracking-wide text-texte-secondaire"
                style={{ letterSpacing: '.05em' }}
              >
                Salariés à rattacher à
              </div>
              <div className="text-[14px] font-semibold text-encre truncate">
                {ENTREPRISE_NOM}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11.5px] text-texte-secondaire">
              <Icon name="Lock" size={11} />
              Verrouillé par le contexte
            </span>
          </div>
        </Card>

        <Card padding="p-6">
          <Stepper steps={ETAPES} current={step} />
        </Card>

        {step === 1 && (
          <Card padding="p-6">
            <Uploader
              accept=".csv,.xlsx,.xls"
              onFiles={handleFiles}
              hint={`Formats acceptés : CSV, XLSX, XLS — taille max. ${TAILLE_MAX_MO} Mo`}
              label="Glissez-déposez votre fichier ou cliquez pour parcourir"
              erreur={fileError}
            />
            {fileName && (
              <div className="mt-5 flex items-center justify-between p-3 rounded-md bg-papier border border-bordure">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded bg-white border border-bordure flex items-center justify-center text-encre">
                    <Icon name="FileSpreadsheet" size={16} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-encre">{fileName}</div>
                    <div className="text-[12px] text-texte-secondaire">
                      18 lignes détectées · 5 colonnes
                    </div>
                  </div>
                </div>
                <IconButton
                  icon="X"
                  ariaLabel="Retirer"
                  onClick={() => setFileName('')}
                  size="sm"
                />
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Link to="/pro/salaries">
                <Button variant="secondary">Annuler</Button>
              </Link>
              <Button
                variant="primary"
                iconRight="ArrowRight"
                disabled={!fileName}
                onClick={() => setStep(2)}
              >
                Suivant
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Mapper les colonnes</h2>
            <p className="mt-1 text-[13px] text-texte-secondaire">
              Associez chaque champ Pli à une colonne de votre fichier.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
              {CHAMPS_MAPPING.map((c) => (
                <div key={c.key} className="rounded-lg border border-bordure p-4">
                  <div
                    className="text-[12px] uppercase tracking-wide text-texte-secondaire"
                    style={{ letterSpacing: '.05em' }}
                  >
                    Champ Pli
                  </div>
                  <div className="text-[14px] font-medium text-encre mb-3">{c.label}</div>
                  <Select
                    value={mapping[c.key] ?? ''}
                    onChange={(e) => setMapping({ ...mapping, [c.key]: e.target.value })}
                    options={c.opts.map((o) => ({ value: o, label: o }))}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between gap-2">
              <Button variant="ghost" icon="ArrowLeft" onClick={() => setStep(1)}>
                Précédent
              </Button>
              <Button variant="primary" iconRight="ArrowRight" onClick={() => setStep(3)}>
                Suivant
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card padding="p-0">
            <div className="p-5 border-b border-bordure flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-[16px] font-semibold text-encre">Validation des lignes</h2>
                <p className="text-[13px] text-texte-secondaire">
                  Corrigez les erreurs ou ignorez-les avant d'importer.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill tone="succes" icon="Check">
                  {valides} valides
                </StatusPill>
                <StatusPill tone="erreur" icon="TriangleAlert">
                  {erreurs} erreurs
                </StatusPill>
              </div>
            </div>
            <Table<LigneValidation>
              dense
              columns={[
                {
                  label: 'Ligne',
                  width: 70,
                  render: (r) => (
                    <span className="text-texte-secondaire font-mono">{r.ligne}</span>
                  ),
                },
                {
                  label: 'Matricule',
                  width: 120,
                  render: (r) => <span className="font-mono">{r.matricule}</span>,
                },
                { label: 'Nom', render: (r) => r.nom },
                { label: 'E-mail', render: (r) => r.email },
                { label: 'Service', width: 140, render: (r) => r.service },
                {
                  label: 'Statut',
                  width: 220,
                  render: (r) =>
                    r.statut === 'ok' ? (
                      <StatusPill tone="succes" size="sm">
                        Valide
                      </StatusPill>
                    ) : (
                      <StatusPill tone="erreur" size="sm" icon="TriangleAlert">
                        {r.erreur ?? 'Erreur'}
                      </StatusPill>
                    ),
                },
              ]}
              data={VALIDATIONS_DEMO}
            />
            <div className="p-5 border-t border-bordure flex justify-between gap-2">
              <Button variant="ghost" icon="ArrowLeft" onClick={() => setStep(2)}>
                Précédent
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary">Télécharger les erreurs (.csv)</Button>
                <Button variant="primary" iconRight="ArrowRight" onClick={() => setStep(4)}>
                  Continuer
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card padding="p-6">
            <h2 className="text-[16px] font-semibold text-encre">Récapitulatif de l'import</h2>
            <p className="mt-1 text-[13px] text-texte-secondaire">
              Vérifiez avant d'ajouter les salariés au registre.
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-papier border border-bordure p-4">
                <div className="text-[12px] text-texte-secondaire">À importer</div>
                <div className="text-[28px] font-semibold text-encre tabular-nums">{valides}</div>
                <div className="text-[12px] text-texte-secondaire">nouvelles fiches salariés</div>
              </div>
              <div className="rounded-lg border border-bordure p-4">
                <div className="text-[12px] text-texte-secondaire">Ignorées</div>
                <div className="text-[28px] font-semibold text-encre tabular-nums">{erreurs}</div>
                <div className="text-[12px] text-texte-secondaire">
                  lignes en erreur non importées
                </div>
              </div>
              <div className="rounded-lg border border-bordure p-4">
                <div className="text-[12px] text-texte-secondaire">Invitations</div>
                <div className="text-[28px] font-semibold text-encre tabular-nums">{valides}</div>
                <div className="text-[12px] text-texte-secondaire">
                  e-mails d'activation envoyés
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-bordure p-4 bg-surface/40">
              <div className="flex items-center gap-2 text-[13px] font-medium text-encre">
                <Icon name="Info" size={14} className="text-info" />
                Que va-t-il se passer ?
              </div>
              <ul className="mt-2 space-y-1 text-[13px] text-texte-secondaire pl-6 list-disc">
                <li>
                  Les {valides} salariés seront ajoutés au registre avec le statut « Invité ».
                </li>
                <li>Un e-mail d'activation Pli leur sera envoyé.</li>
                <li>Vous pourrez ensuite leur distribuer les bulletins de paie.</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <Button variant="ghost" icon="ArrowLeft" onClick={() => setStep(3)}>
                Précédent
              </Button>
              <Button
                variant="primary"
                icon="Check"
                onClick={() => {
                  pousser({
                    message: `${valides} salariés importés avec succès`,
                    tone: 'succes',
                  });
                  navigate('/pro/salaries');
                }}
              >
                Importer {valides} salariés
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
