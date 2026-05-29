// Salarié — vue RH côté entreprise.
//
// IMPORTANT — à ne pas confondre avec ComptePersonnel :
//  - Salarie  = tuple (matricule × entreprise), borné au registre RH d'un tenant.
//  - ComptePersonnel = la personne, porteuse du coffre, indépendante de l'employeur.
// Le lien entre les deux passe par Rattachement.
//
// ─── Correspondance canonique (à intégrer en Phase 1) ──────────────────────
// Dans le modèle canonique du cahier des charges, il n'existe PAS d'entité
// « Salarié » séparée : la vue Salarie est la PROJECTION d'un Rattachement
// (la relation d'emploi) côté employeur, enrichie de l'identité de la
// personne (ComptePersonnel). Le mock du wireframe porte deux représentations
// SEULEMENT parce qu'il n'a jamais relié les deux côtés.
//
// Conséquence concrète :
//  - `salarieId` est une COMMODITÉ Pro qui, en Phase 1, sera résolue vers un
//    `rattachementId` côté API (rattachement.matricule === salarie.matricule
//    pour l'entreprise courante).
//  - Aucune unification dans le code en Phase 0 (parité avec le mock),
//    mais à l'étape 7 la couche services doit garder cette équivalence en tête
//    pour ne pas introduire de TRADUCTION SILENCIEUSE entre les deux mondes.
//
// tenant_id ajouté à la persistance (Phase 1) : le registre des salariés
// est strictement scopé à l'entreprise du contexte. L'appairage matricule
// est borné à ce registre (jamais cross-tenant) — invariant CLAUDE.md.

import type { DateJJMMAAAA, IdEntite, MatriculeSalarie, Telephone225 } from './commun.js';

/** Statut côté RH (dérivé de SALARIES dans data.jsx). */
export type StatutSalarie = 'actif' | 'invite' | 'desactive';

/** Sentinelle "—" du wireframe pour les dates absentes côté affichage. */
export type DateOuTiret = DateJJMMAAAA | '—';

export interface Salarie {
  id: IdEntite;
  matricule: MatriculeSalarie;
  nom: string;
  email: string;
  service: string;
  statut: StatutSalarie;
  derniereConsultation: DateOuTiret;
  telephone: Telephone225;
  poste: string;
  dateEntree: DateJJMMAAAA;
}
