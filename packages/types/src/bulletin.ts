// Bulletins — deux vues distinctes, deux contextes d'accès :
//  - Bulletin        : vue Pro / RH, attaché à un Salarie d'une entreprise.
//  - BulletinCoffre  : vue personnelle / mobile, attaché à un Rattachement
//                      (donc agrégeable entre employeurs UNIQUEMENT en contexte personnel).
//
// ─── Correspondance canonique (à intégrer en Phase 1) ──────────────────────
// Bulletin (vue Pro) et BulletinCoffre (vue mobile) sont DEUX PROJECTIONS du
// MÊME bulletin canonique — un document PDF unique, identifié par un
// `documentId` partagé. Le wireframe utilise des préfixes différents
// (`b-s1-2026-02` pour la vue Pro, `b-atlantique-2026-02` pour le coffre)
// parce que le mock n'a jamais relié les deux côtés.
//
// Conséquence concrète :
//  - Pas d'unification en Phase 0 (parité avec le mock).
//  - En Phase 1, l'API exposera un `documentId` canonique. Les deux vues
//    deviendront des projections SQL différentes du même document.
//  - La couche services (étape 7) doit garder cette identité en tête : un
//    bulletin distribué dans Pli Pro doit apparaître DÈS LA SECONDE D'APRÈS
//    dans le coffre personnel du salarié rattaché, sans traduction.
//
// Note sur les montants (brut/cnps/its/net) :
// Ces champs reflètent fidèlement le shape du wireframe (data.jsx, data-comptes.jsx)
// — la couche services étape 7 expose une vue "résumé" SANS montants pour les listes
// et une vue "complète" pour le viewer, conformément à l'invariant CLAUDE.md
// « Le salaire net n'apparaît JAMAIS dans une liste, carte, prévisualisation ou résumé ».
// L'invariant est porté au niveau service, pas au niveau type, pour préserver
// la parité de vocabulaire avec le mock.
//
// tenant_id ajouté à la persistance (Phase 1) : un Bulletin appartient à
// l'entreprise du rattachement (pas d'orphelin — invariant CLAUDE.md).

import type { DateJJMMAAAA, IdEntite, MontantFCFA, Periode } from './commun.js';
import type { StatutConsultation, StatutRemise, StatutSignature } from './statuts.js';

// -----------------------------------------------------------------------------
// Vue Pro (Pli Pro · #/pro/bulletins, #/pro/suivi)
// -----------------------------------------------------------------------------
export interface Bulletin {
  id: IdEntite;
  salarieId: IdEntite;
  periode: Periode;
  periodeLibelle: string;
  brut: MontantFCFA;
  cnps: MontantFCFA;
  its: MontantFCFA;
  net: MontantFCFA;
  statutRemise: StatutRemise;
  statutConsultation: StatutConsultation;
  statutSignature: StatutSignature;
  dateRemise: DateJJMMAAAA | null;
  dateConsultation: DateJJMMAAAA | null;
  dateSignature: DateJJMMAAAA | null;
}

// -----------------------------------------------------------------------------
// Vue coffre personnel (Pli mobile · #/app/coffre, #/app/bulletin/:id)
// Différences notables vs Bulletin :
//  - rattachementId au lieu de salarieId (clé portable, survit au changement d'employeur)
//  - dateAccuseReception au lieu de dateConsultation (vocabulaire juridique mobile)
//  - employeurNom optionnel (cas où le rattachement n'est pas chargé)
//  - fichier (référence vers le PDF stocké dans le coffre)
// -----------------------------------------------------------------------------
export interface BulletinCoffre {
  id: IdEntite;
  rattachementId: IdEntite;
  employeurNom?: string;
  periode: Periode;
  periodeLibelle: string;
  fichier: string;
  brut: MontantFCFA;
  cnps: MontantFCFA;
  its: MontantFCFA;
  net: MontantFCFA;
  statutConsultation: StatutConsultation;
  statutSignature: StatutSignature;
  dateRemise?: DateJJMMAAAA | null;
  dateAccuseReception: DateJJMMAAAA | null;
  dateSignature: DateJJMMAAAA | null;
}
