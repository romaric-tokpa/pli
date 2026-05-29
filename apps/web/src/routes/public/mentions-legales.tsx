// MentionsLegales — éditeur, hébergement, propriété intellectuelle, contact.
// Libellés verbatim wireframe (RCCM, NCC, hébergement ARTCI, marque Pli).

import { LegalShell, type LegalSection } from './_legal-shell.js';

const SECTIONS: LegalSection[] = [
  {
    titre: 'Éditeur',
    contenu: (
      <>
        <p>
          <strong>Pli SARL</strong>, société à responsabilité limitée de droit ivoirien,
          immatriculée au Registre du Commerce et du Crédit Mobilier sous le numéro{' '}
          <strong>CI-ABJ-2024-B-04812</strong>, N° de Compte Contribuable <strong>2402357 H</strong>
          .
        </p>
        <p>Siège social : Plateau, Abidjan — Côte d'Ivoire.</p>
        <p>Directeur de la publication : la Direction de Pli SARL.</p>
      </>
    ),
  },
  {
    titre: 'Hébergement',
    contenu: (
      <p>
        Le service Pli est hébergé par <strong>ARTCI</strong> — Datacenter Abidjan (Tier III,
        certifié ISO 27001). Aucune donnée applicative ne sort du territoire ivoirien.
      </p>
    ),
  },
  {
    titre: 'Propriété intellectuelle',
    contenu: (
      <p>
        Le sceau Pli et la signature <em>« Bien reçu. Bien gardé. »</em> sont des marques déposées
        par Pli SARL. Toute reproduction, même partielle, sans autorisation écrite préalable est
        interdite.
      </p>
    ),
  },
  {
    titre: 'Responsabilité',
    contenu: (
      <p>
        Pli s'engage à mettre tous les moyens raisonnables en œuvre pour assurer un accès continu au
        service. Les interruptions planifiées sont annoncées via la bannière de la console
        opérateur.
      </p>
    ),
  },
  {
    titre: 'Contact',
    contenu: (
      <p>
        Pour toute question légale : <strong>legal@pli.ci</strong>.
      </p>
    ),
  },
];

export function MentionsLegales() {
  return (
    <LegalShell
      titre="Mentions légales"
      sousTitre="Éditeur, hébergeur, marques et contact légal."
      icone="Scale"
      sections={SECTIONS}
      liees={[
        { to: '/confidentialite', titre: 'Confidentialité' },
        { to: '/cgu', titre: 'CGU' },
        { to: '/conformite-artci', titre: 'Conformité ARTCI' },
      ]}
    />
  );
}
