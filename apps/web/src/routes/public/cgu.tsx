// CGU — conditions générales d'utilisation Pli.
// Libellés tarifaires verbatim (275 = 150 + 75 + 50, annuel -15%, Chèque/Wave).

import { LegalShell, type LegalSection } from './_legal-shell.js';

const SECTIONS: LegalSection[] = [
  {
    titre: '1. Objet',
    contenu: (
      <p>
        Les présentes Conditions Générales d'Utilisation régissent l'accès et l'usage du service
        Pli, plateforme de dématérialisation, distribution et conservation des bulletins de paie
        pour les entreprises ivoiriennes.
      </p>
    ),
  },
  {
    titre: '2. Souscription et essai',
    contenu: (
      <p>
        Toute entreprise peut ouvrir un compte Pli et bénéficier d'un essai gratuit de{' '}
        <strong>20 bulletins offerts, sans engagement</strong>. Aucune carte bancaire n'est requise.
      </p>
    ),
  },
  {
    titre: '3. Tarification',
    contenu: (
      <>
        <p>
          Le forfait Pli est de <strong>275 FCFA par salarié actif et par mois</strong>,
          tout-compris :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Distribution des bulletins : 150 FCFA</li>
          <li>Validation horodatée (signature) : 75 FCFA</li>
          <li>Gestion des réclamations : 50 FCFA</li>
        </ul>
        <p>
          Plan annuel : <strong>−15 %</strong>, soit environ 234 FCFA / salarié actif / mois,
          facturé une fois par an.
        </p>
        <p>
          Moyens de paiement acceptés : <strong>Chèque</strong> ou <strong>Wave</strong>.
        </p>
        <p className="text-[13px] text-texte-secondaire">
          Salariés inactifs ou anciens : aucun coût additionnel — leur coffre reste accessible.
        </p>
      </>
    ),
  },
  {
    titre: "4. Obligations de l'utilisateur",
    contenu: (
      <p>
        L'utilisateur s'engage à fournir des informations exactes, à protéger ses identifiants, et à
        ne déposer dans Pli que des bulletins légalement émis. Toute fraude ou usage détourné
        entraîne la suspension immédiate du compte.
      </p>
    ),
  },
  {
    titre: '5. Responsabilité',
    contenu: (
      <p>
        Pli s'engage à garantir la confidentialité et l'intégrité des bulletins. La responsabilité
        de Pli ne saurait être engagée pour les conséquences d'erreurs de saisie commises par
        l'utilisateur ou pour des interruptions liées à un cas de force majeure.
      </p>
    ),
  },
  {
    titre: '6. Propriété du coffre-fort',
    contenu: (
      <p>
        <strong>
          Le coffre-fort de paie appartient au salarié, tant que son compte reste actif, même en cas
          de changement d'employeur ou de fin de souscription de l'employeur.
        </strong>
      </p>
    ),
  },
  {
    titre: '7. Résiliation',
    contenu: (
      <p>
        Le plan mensuel est résiliable à tout moment, sans pénalité. La résiliation prend effet à la
        fin de la période en cours. Le plan annuel est résiliable à échéance.
      </p>
    ),
  },
  {
    titre: '8. Droit applicable et litiges',
    contenu: (
      <p>
        Les présentes CGU sont régies par le droit ivoirien. Tout litige relèvera de la compétence
        exclusive des tribunaux d'<strong>Abidjan-Plateau</strong>.
      </p>
    ),
  },
];

export function CGU() {
  return (
    <LegalShell
      titre="Conditions générales d'utilisation"
      sousTitre="Souscription, tarification, obligations et droits."
      icone="ScrollText"
      sections={SECTIONS}
      liees={[
        { to: '/mentions-legales', titre: 'Mentions légales' },
        { to: '/confidentialite', titre: 'Confidentialité' },
        { to: '/conformite-artci', titre: 'Conformité ARTCI' },
      ]}
    />
  );
}
