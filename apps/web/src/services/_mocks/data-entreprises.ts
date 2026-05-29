// Mocks portés depuis _wireframe/src/data.jsx — Pli Pro.
//
// Restructuration pour Phase 0 :
//  - Les salariés et bulletins sont indexés PAR entrepriseId (Record<id, X[]>).
//    Le wireframe supposait implicitement un tenant unique « Groupe Atlantique
//    CI » ; ici on matérialise le scoping en mémoire.
//  - On ajoute une seconde entreprise (Comoé Industries — déjà présente dans
//    data-comptes.jsx) avec quelques salariés, dont une COLLISION de matricule
//    intentionnelle pour tester l'isolation cross-tenant.
//
// Type-scoping CLAUDE.md : aucune entité Salarie ne porte `entrepriseId` (le
// type partagé reste pur côté domaine). Le scoping est uniquement dans la
// structure des Record<>.

import type {
  Abonnement,
  Bulletin,
  EntreeAudit,
  Entreprise,
  Facture,
  IdEntite,
  LigneReconciliation,
  ModePaiement,
  Reclamation,
  Salarie,
  Session,
} from '@pli/types';

// ─── Entreprises (perspective Pro / tenant racine) ────────────────────────

const ID_ATLANTIQUE = 'atlantique';
const ID_COMOE = 'comoe';

export const ENTREPRISES_TENANT: Record<IdEntite, Entreprise> = {
  [ID_ATLANTIQUE]: {
    id: ID_ATLANTIQUE,
    nom: 'Groupe Atlantique CI',
    raisonSociale: 'Groupe Atlantique CI S.A.',
    adresse: 'BP 1234, Abidjan, Plateau',
    telephone: '+225 27 20 30 40 50',
    email: 'contact@groupe-atlantique.ci',
    rccm: 'CI-ABJ-2014-B-12378',
    ncc: '1402357 H',
    secteur: 'Industrie',
    effectif: 24,
    type: 'directe',
    statut: 'active',
    modeGestion: 'directe',
    cabinetId: null,
  },
  [ID_COMOE]: {
    id: ID_COMOE,
    nom: 'Comoé Industries',
    raisonSociale: 'Comoé Industries SARL',
    adresse: 'Zone industrielle, Bouaké',
    telephone: '+225 27 31 64 18 24',
    email: 'paie@comoe-industries.ci',
    rccm: 'CI-BKE-2010-B-04521',
    ncc: '0987234 K',
    secteur: 'Manufacturing',
    effectif: 287,
    type: 'directe',
    statut: 'active',
    modeGestion: 'directe',
    cabinetId: null,
  },
};

export const SERVICES_ATLANTIQUE = [
  'Comptabilité',
  'Commercial',
  'RH',
  'Production',
  'Logistique',
  'Direction',
  'Informatique',
  'Maintenance',
] as const;

// ─── Salariés par entreprise (matérialise le scoping tenant) ──────────────
//
// Atlantique : 22 salariés portés verbatim depuis data.jsx.
// Comoé : 3 salariés mock, dont MAT-00112 (collision intentionnelle avec
//         Aya Koffi de Atlantique) attribué à un autre salarié — Karim Bah.
//         Permet de prouver que la résolution par matricule reste BORNÉE
//         au registre du tenant et ne traverse jamais.

export const SALARIES_PAR_ENTREPRISE: Record<IdEntite, Salarie[]> = {
  [ID_ATLANTIQUE]: [
    {
      id: 's1',
      matricule: 'MAT-00112',
      nom: 'Aya Koffi',
      email: 'aya.koffi@atlantique.ci',
      service: 'Comptabilité',
      statut: 'actif',
      derniereConsultation: '26/02/2026',
      telephone: '+225 07 08 12 34 56',
      poste: 'Comptable principale',
      dateEntree: '12/03/2018',
    },
    {
      id: 's2',
      matricule: 'MAT-00118',
      nom: "Kouadio N'Guessan",
      email: 'k.nguessan@atlantique.ci',
      service: 'Commercial',
      statut: 'actif',
      derniereConsultation: '25/02/2026',
      telephone: '+225 05 64 21 87 90',
      poste: 'Responsable commercial',
      dateEntree: '04/09/2017',
    },
    {
      id: 's3',
      matricule: 'MAT-00120',
      nom: 'Fatou Diallo',
      email: 'fatou.diallo@atlantique.ci',
      service: 'RH',
      statut: 'actif',
      derniereConsultation: '27/02/2026',
      telephone: '+225 07 12 45 78 21',
      poste: 'Chargée RH',
      dateEntree: '15/01/2019',
    },
    {
      id: 's4',
      matricule: 'MAT-00131',
      nom: 'Yao Kouamé',
      email: 'yao.kouame@atlantique.ci',
      service: 'Production',
      statut: 'actif',
      derniereConsultation: '—',
      telephone: '+225 05 90 32 11 04',
      poste: "Chef d'équipe",
      dateEntree: '22/06/2016',
    },
    {
      id: 's5',
      matricule: 'MAT-00140',
      nom: 'Mariam Touré',
      email: 'mariam.toure@atlantique.ci',
      service: 'Logistique',
      statut: 'actif',
      derniereConsultation: '24/02/2026',
      telephone: '+225 01 47 89 23 65',
      poste: 'Gestionnaire de stock',
      dateEntree: '08/11/2020',
    },
    {
      id: 's6',
      matricule: 'MAT-00145',
      nom: 'Ibrahim Cissé',
      email: 'i.cisse@atlantique.ci',
      service: 'Production',
      statut: 'actif',
      derniereConsultation: '23/02/2026',
      telephone: '+225 07 33 56 12 09',
      poste: 'Technicien',
      dateEntree: '17/05/2019',
    },
    {
      id: 's7',
      matricule: 'MAT-00152',
      nom: 'Awa Bamba',
      email: 'awa.bamba@atlantique.ci',
      service: 'Commercial',
      statut: 'actif',
      derniereConsultation: '—',
      telephone: '+225 07 48 91 26 38',
      poste: 'Attachée commerciale',
      dateEntree: '03/02/2022',
    },
    {
      id: 's11',
      matricule: 'MAT-00178',
      nom: 'Bakary Sangaré',
      email: 'b.sangare@atlantique.ci',
      service: 'Logistique',
      statut: 'actif',
      derniereConsultation: '20/02/2026',
      telephone: '+225 05 67 23 89 14',
      poste: 'Chauffeur',
      dateEntree: '14/10/2021',
    },
    {
      id: 's13',
      matricule: 'MAT-00189',
      nom: 'Moussa Ouattara',
      email: 'm.ouattara@atlantique.ci',
      service: 'Comptabilité',
      statut: 'actif',
      derniereConsultation: '22/01/2026',
      telephone: '+225 01 34 78 56 92',
      poste: 'Aide comptable',
      dateEntree: '06/01/2026',
    },
    {
      id: 's17',
      matricule: 'MAT-00218',
      nom: 'Akissi Yapi',
      email: 'akissi.yapi@atlantique.ci',
      service: 'RH',
      statut: 'invite',
      derniereConsultation: '—',
      telephone: '+225 05 84 27 91 36',
      poste: 'Stagiaire RH',
      dateEntree: '08/01/2026',
    },
    {
      id: 's20',
      matricule: 'MAT-00238',
      nom: 'Sékou Doumbia',
      email: 'sekou.d@atlantique.ci',
      service: 'Production',
      statut: 'desactive',
      derniereConsultation: '15/12/2025',
      telephone: '+225 07 92 14 58 67',
      poste: 'Ancien opérateur',
      dateEntree: '21/02/2017',
    },
  ],
  [ID_COMOE]: [
    {
      id: 'cs-001',
      matricule: 'MAT-00045',
      nom: 'Aya Koffi',
      email: 'aya.koffi@comoe-industries.ci',
      service: 'Comptabilité',
      statut: 'desactive',
      derniereConsultation: '31/12/2024',
      telephone: '+225 07 08 12 34 56',
      poste: 'Assistante comptable',
      dateEntree: '12/03/2018',
    },
    {
      id: 'cs-002',
      // COLLISION INTENTIONNELLE — même matricule que Aya à Atlantique,
      // mais ici c'est une AUTRE personne dans un AUTRE tenant. Aucun
      // service ne doit retourner cette ligne depuis le contexte atlantique.
      matricule: 'MAT-00112',
      nom: 'Karim Bah',
      email: 'k.bah@comoe-industries.ci',
      service: 'Production',
      statut: 'actif',
      derniereConsultation: '26/02/2026',
      telephone: '+225 05 11 22 33 44',
      poste: 'Opérateur',
      dateEntree: '03/06/2021',
    },
    {
      id: 'cs-003',
      matricule: 'MAT-00301',
      nom: 'Naomi Kouakou',
      email: 'n.kouakou@comoe-industries.ci',
      service: 'Direction',
      statut: 'actif',
      derniereConsultation: '27/02/2026',
      telephone: '+225 07 65 19 47 82',
      poste: 'Directrice opérations',
      dateEntree: '11/02/2019',
    },
  ],
};

// ─── Bulletins par entreprise (pour la liste Pro) ────────────────────────
//
// Échantillon réduit ; assez pour rendre la table et tester l'invariant
// « net jamais dans une liste ». Compléter au besoin aux étapes 9+.

const PERIODE_FEV = '2026-02';
const PERIODE_JAN = '2026-01';

function fabriquerBulletinPro(
  id: string,
  salarieId: string,
  periode: string,
  periodeLibelle: string,
  brut: number,
  net: number,
  options: Partial<Bulletin> = {},
): Bulletin {
  const cnps = Math.round(brut * 0.063);
  const its = brut - cnps - net;
  return {
    id,
    salarieId,
    periode,
    periodeLibelle,
    brut,
    cnps,
    its,
    net,
    statutRemise: 'distribue',
    statutConsultation: 'consulte',
    statutSignature: 'non_requise',
    dateRemise: '27/02/2026',
    dateConsultation: '28/02/2026',
    dateSignature: null,
    ...options,
  };
}

const PERIODE_DEC = '2025-12';

export const BULLETINS_PAR_ENTREPRISE: Record<IdEntite, Bulletin[]> = {
  [ID_ATLANTIQUE]: [
    fabriquerBulletinPro('b-s1-2026-02', 's1', PERIODE_FEV, 'Février 2026', 596_000, 473_000, {
      statutSignature: 'signe',
      dateSignature: '28/02/2026 09:14',
    }),
    fabriquerBulletinPro('b-s2-2026-02', 's2', PERIODE_FEV, 'Février 2026', 775_000, 615_000, {
      statutSignature: 'requis_non_signe',
    }),
    fabriquerBulletinPro('b-s3-2026-02', 's3', PERIODE_FEV, 'Février 2026', 605_000, 480_000),
    fabriquerBulletinPro('b-s4-2026-02', 's4', PERIODE_FEV, 'Février 2026', 312_000, 247_000, {
      statutConsultation: 'non_consulte',
      dateConsultation: null,
    }),
    fabriquerBulletinPro('b-s5-2026-02', 's5', PERIODE_FEV, 'Février 2026', 372_000, 295_000, {
      statutRemise: 'en_attente',
      statutConsultation: 'non_consulte',
      dateRemise: null,
      dateConsultation: null,
    }),
    fabriquerBulletinPro('b-s6-2026-02', 's6', PERIODE_FEV, 'Février 2026', 358_000, 284_000, {
      statutSignature: 'signe',
      dateSignature: '28/02/2026 14:32',
    }),
    fabriquerBulletinPro('b-s7-2026-02', 's7', PERIODE_FEV, 'Février 2026', 412_000, 326_000, {
      statutConsultation: 'non_consulte',
      dateConsultation: null,
    }),
    fabriquerBulletinPro('b-s4-2026-01', 's4', PERIODE_JAN, 'Janvier 2026', 309_000, 245_000, {
      dateRemise: '29/01/2026',
      dateConsultation: '14/02/2026',
    }),
    fabriquerBulletinPro(
      'b-s11-2026-01',
      's11',
      PERIODE_JAN,
      'Janvier 2026',
      295_000,
      234_000,
      { dateRemise: '29/01/2026', dateConsultation: '02/02/2026' },
    ),
    fabriquerBulletinPro(
      'b-s13-2025-12',
      's13',
      PERIODE_DEC,
      'Décembre 2025',
      0,
      0,
      {
        statutRemise: 'en_attente',
        statutConsultation: 'non_consulte',
        dateRemise: null,
        dateConsultation: null,
      },
    ),
  ],
  [ID_COMOE]: [
    fabriquerBulletinPro(
      'b-cs002-2026-02',
      'cs-002',
      PERIODE_FEV,
      'Février 2026',
      425_000,
      335_000,
    ),
    fabriquerBulletinPro(
      'b-cs003-2026-02',
      'cs-003',
      PERIODE_FEV,
      'Février 2026',
      1_575_000,
      1_250_000,
    ),
  ],
};

// ─── Réclamations par entreprise ──────────────────────────────────────────

export const RECLAMATIONS_PAR_ENTREPRISE: Record<IdEntite, Reclamation[]> = {
  [ID_ATLANTIQUE]: [
    {
      id: 'r1',
      salarieId: 's4',
      bulletinId: 'b-s4-2026-01',
      type: 'Montant erroné',
      statut: 'en_cours',
      sujet: 'Erreur sur le calcul des heures supplémentaires',
      dateOuverture: '10/02/2026',
      derniereActivite: 'il y a 2 jours',
      messages: [
        {
          auteur: 'salarie',
          nom: 'Yao Kouamé',
          date: '10/02/2026 09:14',
          texte:
            'Bonjour, je remarque que mes 12 heures supplémentaires du mois ne figurent pas sur mon bulletin de janvier. Merci de vérifier.',
        },
        {
          auteur: 'rh',
          nom: 'Sylvie Aké',
          date: '11/02/2026 11:32',
          texte:
            "Bonjour Yao, nous vérifions auprès de la production. Je reviens vers vous d'ici demain.",
        },
        {
          auteur: 'salarie',
          nom: 'Yao Kouamé',
          date: '13/02/2026 08:05',
          texte:
            "Pour information, le bon de production signé par mon chef d'équipe est joint.",
          piecesJointes: ['bon_heures_sup_janvier.pdf'],
        },
        {
          auteur: 'rh',
          nom: 'Sylvie Aké',
          date: '26/02/2026 16:48',
          texte:
            'Merci pour le justificatif. La régularisation sera intégrée au bulletin de février.',
        },
      ],
    },
    {
      id: 'r2',
      salarieId: 's7',
      bulletinId: 'b-s7-2026-02',
      type: 'Ligne manquante',
      statut: 'nouvelle',
      sujet: 'Prime commerciale non versée',
      dateOuverture: '27/02/2026',
      derniereActivite: 'hier',
      messages: [
        {
          auteur: 'salarie',
          nom: 'Awa Bamba',
          date: '27/02/2026 17:22',
          texte:
            "Bonjour, ma prime trimestrielle commerciale n'apparaît pas sur le bulletin de février. Pouvez-vous vérifier ?",
        },
      ],
    },
    {
      id: 'r3',
      salarieId: 's13',
      bulletinId: 'b-s13-2025-12',
      type: 'Période incorrecte',
      statut: 'resolue',
      sujet: "Bulletin libellé sur décembre alors que je n'étais pas encore en poste",
      dateOuverture: '18/01/2026',
      derniereActivite: 'le 22/01/2026',
      messages: [
        {
          auteur: 'salarie',
          nom: 'Moussa Ouattara',
          date: '18/01/2026 10:00',
          texte:
            "Bonjour, j'ai bien reçu un bulletin pour décembre 2025 mais je n'ai été embauché qu'en janvier.",
        },
        {
          auteur: 'rh',
          nom: 'Fatou Diallo',
          date: '19/01/2026 14:12',
          texte:
            "Merci pour le signalement. Il s'agit d'une erreur de matricule. Le bulletin a été retiré.",
        },
        {
          auteur: 'rh',
          nom: 'Fatou Diallo',
          date: '22/01/2026 09:30',
          texte: 'Régularisation effectuée, dossier clos.',
        },
      ],
    },
    {
      id: 'r4',
      salarieId: 's11',
      bulletinId: 'b-s11-2026-01',
      type: 'Autre',
      statut: 'en_cours',
      sujet: 'Question sur le calcul de la prime de transport',
      dateOuverture: '20/02/2026',
      derniereActivite: 'il y a 3 jours',
      messages: [
        {
          auteur: 'salarie',
          nom: 'Bakary Sangaré',
          date: '20/02/2026 12:40',
          texte:
            'Bonjour, ma prime de transport semble inférieure à celle des autres chauffeurs. Comment est-elle calculée ?',
        },
        {
          auteur: 'rh',
          nom: 'Sylvie Aké',
          date: '25/02/2026 09:15',
          texte: 'Bonjour Bakary, je vous transmets le détail du calcul en pièce jointe.',
          piecesJointes: ['bareme_transport_2026.pdf'],
        },
      ],
    },
  ],
  [ID_COMOE]: [],
};

// ─── Statistiques réclamations par entreprise ─────────────────────────────
//
// Pré-calcul mock — en Phase 1 ces stats seront calculées côté serveur depuis
// les réclamations + un index temporel. Les valeurs ici sont COHÉRENTES avec
// RECLAMATIONS_PAR_ENTREPRISE pour le mois courant.

export interface StatTypeReclamation {
  type: string;
  count: number;
  couleur: string;
}

export interface PointTendanceReclamations {
  mois: string;
  ouvertes: number;
  resolues: number;
}

export const STATS_RECLAMATIONS_PARTYPE_PAR_ENTREPRISE: Record<
  IdEntite,
  StatTypeReclamation[]
> = {
  [ID_ATLANTIQUE]: [
    { type: 'Montant erroné', count: 1, couleur: '#15294E' },
    { type: 'Ligne manquante', count: 1, couleur: '#B85737' },
    { type: 'Période incorrecte', count: 1, couleur: '#2C6FB3' },
    { type: 'Autre', count: 1, couleur: '#D9A227' },
  ],
  [ID_COMOE]: [],
};

export const STATS_RECLAMATIONS_TENDANCE_PAR_ENTREPRISE: Record<
  IdEntite,
  PointTendanceReclamations[]
> = {
  [ID_ATLANTIQUE]: [
    { mois: 'Sep.', ouvertes: 2, resolues: 2 },
    { mois: 'Oct.', ouvertes: 1, resolues: 1 },
    { mois: 'Nov.', ouvertes: 3, resolues: 3 },
    { mois: 'Déc.', ouvertes: 2, resolues: 2 },
    { mois: 'Jan.', ouvertes: 4, resolues: 3 },
    { mois: 'Fév.', ouvertes: 3, resolues: 1 },
  ],
  [ID_COMOE]: [],
};

// ─── Réconciliation (lot Pli Pro · /pro/bulletins/upload) ─────────────────
//
// Lot mock minimal : 4 lignes, chaque état une fois. Suffit aux tests
// d'invariant et au rendu de l'écran. Les ~30 lignes du wireframe seront
// portées intégralement à l'étape 9.

export const RECONCILIATION_PAR_ENTREPRISE: Record<IdEntite, LigneReconciliation[]> = {
  [ID_ATLANTIQUE]: [
    {
      id: 'rc01',
      fichier: 'MAT-00112_202602.pdf',
      matriculeDetecte: 'MAT-00112',
      nom: 'Aya Koffi',
      service: 'Comptabilité',
      periode: PERIODE_FEV,
      etat: 'apparie',
    },
    {
      id: 'rc02',
      fichier: 'MAT-00118_202602.pdf',
      matriculeDetecte: 'MAT-00118',
      nom: "Kouadio N'Guessan",
      service: 'Commercial',
      periode: PERIODE_FEV,
      etat: 'apparie',
    },
    {
      id: 'rc27',
      fichier: 'MAT-00999_202602.pdf',
      matriculeDetecte: 'MAT-00999',
      nom: null,
      service: null,
      periode: PERIODE_FEV,
      etat: 'introuvable',
    },
    {
      id: 'rc29',
      fichier: 'MAT-00163_202602.pdf',
      matriculeDetecte: 'MAT-00163',
      nom: 'Konan Bertin',
      service: 'Direction',
      periode: PERIODE_FEV,
      etat: 'doublon',
    },
    {
      id: 'rc30',
      fichier: 'lot_groupe_p17.pdf',
      matriculeDetecte: 'MAT-0O238',
      nom: 'Sékou Doumbia (?)',
      service: 'Production',
      periode: PERIODE_FEV,
      etat: 'faible_confiance',
      confiance: 56,
    },
  ],
  [ID_COMOE]: [],
};

// ─── Facturation : abonnement, factures, mode de paiement ─────────────────
//
// Forfait Pli : 275 FCFA / salarié actif / mois (composition 150/75/50).
// Plan annuel : −15 % → ≈ 234 FCFA / salarié / mois. Essai gratuit : 20
// bulletins. Source de vérité : CLAUDE.md + _wireframe/src/data.jsx (TARIFS).

export const ABONNEMENTS_PAR_ENTREPRISE: Record<IdEntite, Abonnement> = {
  [ID_ATLANTIQUE]: {
    entrepriseId: ID_ATLANTIQUE,
    cycle: 'mensuel',
    statut: 'essai',
    tarifMois: 275,
    remiseAnnuellePct: 15,
    composition: {
      distributionFCFA: 150,
      signatureFCFA: 75,
      reclamationFCFA: 50,
    },
    essaiBulletinsRestants: 6,
  },
  [ID_COMOE]: {
    entrepriseId: ID_COMOE,
    cycle: 'annuel',
    statut: 'active',
    tarifMois: 234,
    remiseAnnuellePct: 15,
    composition: {
      distributionFCFA: 150,
      signatureFCFA: 75,
      reclamationFCFA: 50,
    },
  },
};

export const MODES_PAIEMENT_PAR_ENTREPRISE: Record<IdEntite, ModePaiement> = {
  [ID_ATLANTIQUE]: 'wave',
  [ID_COMOE]: 'cheque',
};

/**
 * Wallet Wave de l'entreprise — affichage uniquement (les vrais wallets
 * arriveront en Phase 1 via le partenaire Wave). Indexé par entreprise.
 */
export const WALLET_WAVE_PAR_ENTREPRISE: Record<IdEntite, string> = {
  [ID_ATLANTIQUE]: '+225 07 23 45 67 89',
  [ID_COMOE]: '+225 05 19 84 26 71',
};

export const FACTURES_PAR_ENTREPRISE: Record<IdEntite, Facture[]> = {
  [ID_ATLANTIQUE]: [
    {
      id: 'f1',
      numero: 'FAC-2026-002',
      periode: 'Février 2026',
      montant: 6050,
      statut: 'en_attente',
      dateEmission: '01/03/2026',
      salariesFactures: 22,
      mode: 'Wave',
    },
    {
      id: 'f2',
      numero: 'FAC-2026-001',
      periode: 'Janvier 2026',
      montant: 6325,
      statut: 'payee',
      dateEmission: '01/02/2026',
      salariesFactures: 23,
      mode: 'Wave',
      payeLe: '03/02/2026',
    },
    {
      id: 'f3',
      numero: 'FAC-2025-012',
      periode: 'Décembre 2025',
      montant: 6325,
      statut: 'payee',
      dateEmission: '01/01/2026',
      salariesFactures: 23,
      mode: 'Wave',
      payeLe: '04/01/2026',
    },
    {
      id: 'f4',
      numero: 'FAC-2025-011',
      periode: 'Novembre 2025',
      montant: 6050,
      statut: 'payee',
      dateEmission: '01/12/2025',
      salariesFactures: 22,
      mode: 'Chèque',
      payeLe: '06/12/2025',
    },
    {
      id: 'f5',
      numero: 'FAC-2025-010',
      periode: 'Octobre 2025',
      montant: 5775,
      statut: 'payee',
      dateEmission: '01/11/2025',
      salariesFactures: 21,
      mode: 'Chèque',
      payeLe: '10/11/2025',
    },
  ],
  [ID_COMOE]: [],
};

// ─── Sécurité : sessions, paramètres auth, journal d'audit ────────────────

export const SESSIONS_PRO_PAR_ENTREPRISE: Record<IdEntite, Session[]> = {
  [ID_ATLANTIQUE]: [
    {
      id: 'sp1',
      appareil: 'Chrome 124 — macOS',
      lieu: 'Abidjan, Plateau',
      derniereActivite: 'il y a quelques secondes',
      actuel: true,
      icon: 'Monitor',
    },
    {
      id: 'sp2',
      appareil: 'Safari — iPad',
      lieu: 'Abidjan, Cocody',
      derniereActivite: 'hier à 17:32',
      actuel: false,
      icon: 'Tablet',
    },
    // 3ème session non rendue côté Pro (max 2) — la couper côté service
    // simule l'invariant « max 2 sessions Pro » qui sera appliqué par le
    // serveur en Phase 1.
    {
      id: 'sp3',
      appareil: 'Firefox — Ubuntu',
      lieu: 'Bouaké, CI',
      derniereActivite: 'il y a 6 jours',
      actuel: false,
      icon: 'Monitor',
    },
  ],
  [ID_COMOE]: [
    {
      id: 'spc1',
      appareil: 'Edge — Windows',
      lieu: 'Bouaké, CI',
      derniereActivite: 'il y a 12 min',
      actuel: true,
      icon: 'Monitor',
    },
  ],
};

export const AUDIT_LOG_PAR_ENTREPRISE: Record<IdEntite, EntreeAudit[]> = {
  [ID_ATLANTIQUE]: [
    {
      id: 'l1',
      date: '27/02/2026 14:22',
      utilisateur: 'Sylvie Aké',
      action: 'Distribution de 18 bulletins (Février 2026)',
      ip: '196.207.34.12',
      type: 'distribution',
    },
    {
      id: 'l2',
      date: '27/02/2026 14:08',
      utilisateur: 'Sylvie Aké',
      action: 'Upload de 18 bulletins PDF',
      ip: '196.207.34.12',
      type: 'upload',
    },
    {
      id: 'l3',
      date: '27/02/2026 11:45',
      utilisateur: 'Fatou Diallo',
      action: 'Modification du compte de Akissi Yapi',
      ip: '196.207.34.18',
      type: 'modification',
    },
    {
      id: 'l4',
      date: '26/02/2026 17:30',
      utilisateur: 'Sylvie Aké',
      action: 'Connexion réussie',
      ip: '196.207.34.12',
      type: 'connexion',
    },
    {
      id: 'l5',
      date: '26/02/2026 09:12',
      utilisateur: 'Fatou Diallo',
      action: 'Réponse à la réclamation R-2026-014',
      ip: '196.207.34.18',
      type: 'reclamation',
    },
    {
      id: 'l6',
      date: '25/02/2026 16:02',
      utilisateur: 'Sylvie Aké',
      action: 'Ajout du salarié Akissi Yapi',
      ip: '196.207.34.12',
      type: 'creation',
    },
    {
      id: 'l7',
      date: '25/02/2026 10:48',
      utilisateur: 'Système',
      action: 'Tentative de connexion échouée (Sylvie Aké)',
      ip: '41.79.196.5',
      type: 'securite',
    },
    {
      id: 'l8',
      date: '23/02/2026 15:20',
      utilisateur: 'Fatou Diallo',
      action: 'Export du registre des salariés',
      ip: '196.207.34.18',
      type: 'export',
    },
  ],
  [ID_COMOE]: [],
};
