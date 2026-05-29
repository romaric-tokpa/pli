// ConformiteARTCI — page conformité avec mentions OneCI et badges.

import { Icon, StatusPill } from '@pli/ui';
import { LegalShell, type LegalSection } from './_legal-shell.js';

const SECTIONS: LegalSection[] = [
  {
    titre: 'Statut',
    contenu: (
      <div className="flex items-center gap-3">
        <StatusPill tone="succes" icon="BadgeCheck">
          Conforme
        </StatusPill>
        <span className="text-[13.5px] text-texte-secondaire">
          Convention ARTCI signée le 15/03/2024.
        </span>
      </div>
    ),
  },
  {
    titre: 'Hébergement souverain',
    contenu: (
      <>
        <p>
          Les données Pli sont hébergées au datacenter <strong>ARTCI Abidjan</strong>, certifié{' '}
          <strong>Tier III</strong> et <strong>ISO 27001</strong>. Aucune donnée applicative ne sort
          du territoire ivoirien (zero data export).
        </p>
      </>
    ),
  },
  {
    titre: 'Validation horodatée',
    contenu: (
      <>
        <p>
          La signature électronique est délivrée par <strong>OneCI</strong>, prestataire de services
          de confiance qualifié. Chaque action de validation produit un certificat numérique
          horodaté conservé dans le journal d'audit.
        </p>
        <p className="text-[13px] text-texte-secondaire">
          Note : la signature avancée (eIDAS) sera branchée dans une prochaine itération. À ce
          stade, Pli garantit l'horodatage certifié et la non-répudiation par chaîne de hash.
        </p>
      </>
    ),
  },
  {
    titre: 'Certificat en cours',
    contenu: (
      <div className="rounded-md border border-bordure bg-white p-4 flex items-start gap-3">
        <Icon name="BadgeCheck" size={20} className="text-succes shrink-0 mt-0.5" />
        <div className="text-[13.5px]">
          <div className="font-medium text-encre">PLI-CERT-2025-A4F8</div>
          <div className="text-texte-secondaire">Valide jusqu'au 01/06/2026.</div>
        </div>
      </div>
    ),
  },
  {
    titre: 'Exports de conformité',
    contenu: (
      <p>
        Les documents suivants sont disponibles sur demande à <strong>compliance@pli.ci</strong> :
        registre des traitements, politique de sécurité, mesures techniques et organisationnelles.
      </p>
    ),
  },
];

export function ConformiteARTCI() {
  return (
    <LegalShell
      titre="Conformité ARTCI"
      sousTitre="Hébergement souverain, validation horodatée, certificats."
      icone="BadgeCheck"
      sections={SECTIONS}
      liees={[
        { to: '/mentions-legales', titre: 'Mentions légales' },
        { to: '/confidentialite', titre: 'Confidentialité' },
        { to: '/cgu', titre: 'CGU' },
      ]}
    />
  );
}
