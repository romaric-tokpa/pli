// Confidentialite — données collectées, finalités, conservation, droits RGPD.
// Libellés verbatim wireframe (loi 2013-450, DPO, table de conservation).

import { LegalShell, type LegalSection } from './_legal-shell.js';

const SECTIONS: LegalSection[] = [
  {
    titre: 'Données collectées',
    contenu: (
      <>
        <p>
          Pli collecte les données strictement nécessaires à la distribution et à la conservation
          des bulletins de paie :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Identité :</strong> nom, prénom, matricule, e-mail, téléphone.
          </li>
          <li>
            <strong>Identifiants durables :</strong> compte personnel salarié (clé portable du
            coffre).
          </li>
          <li>
            <strong>Bulletins :</strong> documents PDF déposés par l'employeur.
          </li>
          <li>
            <strong>Données techniques :</strong> journaux de connexion, audit des actions
            sensibles.
          </li>
        </ul>
      </>
    ),
  },
  {
    titre: 'Finalités',
    contenu: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Distribution des bulletins à leur destinataire identifié.</li>
        <li>Preuve de remise (accusé de réception horodaté).</li>
        <li>Validation horodatée des bulletins par le salarié.</li>
        <li>Sécurité du service (anti-fraude, audit).</li>
        <li>Conformité ARTCI et obligations légales ivoiriennes.</li>
      </ul>
    ),
  },
  {
    titre: 'Conservation',
    contenu: (
      <>
        <table className="w-full text-[13.5px] border border-bordure rounded overflow-hidden">
          <tbody>
            <tr className="border-b border-bordure">
              <td className="px-3 py-2 bg-papier font-medium text-encre">Bulletins</td>
              <td className="px-3 py-2">
                <strong>tant que votre compte est actif</strong> (minimum 10 ans légal)
              </td>
            </tr>
            <tr className="border-b border-bordure">
              <td className="px-3 py-2 bg-papier font-medium text-encre">Journal d'audit</td>
              <td className="px-3 py-2">5 ans</td>
            </tr>
            <tr className="border-b border-bordure">
              <td className="px-3 py-2 bg-papier font-medium text-encre">Sessions</td>
              <td className="px-3 py-2">90 jours</td>
            </tr>
            <tr>
              <td className="px-3 py-2 bg-papier font-medium text-encre">Tickets support</td>
              <td className="px-3 py-2">12 mois</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3">
          <em>
            Le coffre-fort de paie appartient au salarié, pas à l'employeur ni à Pli. Il reste
            accessible tant que le compte personnel est actif.
          </em>
        </p>
      </>
    ),
  },
  {
    titre: 'Vos droits',
    contenu: (
      <p>
        Conformément à la loi ivoirienne <strong>2013-450</strong> sur la protection des données à
        caractère personnel, vous disposez d'un droit d'accès, de rectification, d'effacement, de
        portabilité et d'opposition. Adressez votre demande à <strong>dpo@pli.ci</strong>.
      </p>
    ),
  },
  {
    titre: 'Sécurité',
    contenu: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Chiffrement de bout en bout.</li>
        <li>Authentification à deux facteurs obligatoire pour les administrateurs.</li>
        <li>Hébergement ARTCI Côte d'Ivoire (Tier III, ISO 27001).</li>
        <li>Journal d'audit append-only chaîné par hash sur toutes les actions sensibles.</li>
      </ul>
    ),
  },
  {
    titre: 'Contact DPO',
    contenu: (
      <p>
        Délégué à la protection des données : <strong>dpo@pli.ci</strong>.
      </p>
    ),
  },
];

export function Confidentialite() {
  return (
    <LegalShell
      titre="Politique de confidentialité"
      sousTitre="Données collectées, finalités, droits et contacts DPO."
      icone="Lock"
      sections={SECTIONS}
      liees={[
        { to: '/mentions-legales', titre: 'Mentions légales' },
        { to: '/cgu', titre: 'CGU' },
        { to: '/conformite-artci', titre: 'Conformité ARTCI' },
      ]}
    />
  );
}
