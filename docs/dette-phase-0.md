# Dette Phase 0 — registre classé

État au 2026-05-29, après clôture de l'étape 9 (Pli Pro).

**Convention** :

- **Stub** = route câblée mais contenu remplacé par un placeholder visible. Build/typecheck verts, route accessible, contenu non porté.
- **Manquant** = route non câblée (404).
- **Dégradé** = composant fonctionnel mais avec API/structure simplifiée.

---

## A — À solder AVANT de déclarer la Phase 0 finie

Tout ce qui suit doit être livré ou explicitement abandonné avant la clôture. Chaque ligne bloque la mention « Phase 0 100 % ».

### A.1 — Écrans encore en stub ou manquants ✅ SOLDÉE

| Fichier / Route | Statut | Résultat |
|---|---|---|
| ~~`apps/web/src/routes/pro/bulletins/depot-individuel.tsx`~~ | ~~Stub~~ → **Porté** (A.1) | 3 étapes (PDF → matricule + période → récap) via `SalariesService.resoudreParMatricule(ctx)` ; couvert par `depot-individuel-appairage.test.tsx` (MAT-00112 résout Aya, MAT-00301 introuvable depuis Atlantique). |
| ~~`/verification` (`SiteVerification` v2)~~ | ~~Manquante~~ → **Portée** (A.1) | Challenge 2FA standalone via `AuthShell` ; tests verts (`auth-parcours-indivisibles.test.tsx`). Le `sessionStorage.pli_auth_target` posé par /connexion redirige vers /pro ou /cabinet. |
| ~~`/reinitialiser-mot-de-passe` (`SiteReinitialiserMotDePasse` v2)~~ | ~~Manquante~~ → **Portée** (A.1) | Landing depuis l'e-mail de récupération : nouveau mot de passe + jauge de force + confirmation. |
| ~~`apps/web/src/routes/admin/hub.tsx`~~ | ~~Stub~~ → **Soldée** à l'étape 12 (12a) | Remplacé par `AdminVueEnsemble` + 12 routes admin réelles ; ancien `hub.tsx` supprimé. Couvert par la garde `sidebar-pas-de-lien-mort.test.tsx` (27 tests). |
| ~~`apps/web/src/routes/app/placeholders.tsx`~~ | ✅ Tous portés (sub-lots 10a/b/c). Fichier supprimé. | — |

### A.2 — Performance bundle

| Cible | État | À faire |
|---|---|---|
| **lucide-react ~600 kB dans le bundle principal** | Documenté dans `apps/web/README.md`, non corrigé. Bundle actuel : 993 kB / 209 kB gzip | Codegen au build : scanner le source pour collecter les noms d'icônes utilisés, émettre un `lucide-registry.ts` avec imports nommés (tree-shakables), wrapper `Icon` lit ce registre. API publique inchangée. **Cible : < 250 kB gzip (check méta de clôture)**, gain estimé ≈ 500 kB. |

### A.3 — Données mock (DÉCROCHÉ de la clôture)

**Décision sub-lot 10a** : la parité de rendu (règle 4 CLAUDE.md) est suffisante. Les jeux mock restent à leur taille actuelle. Ces lignes sont conservées comme **note d'enrichissement post-clôture**, pas comme bloquantes.

| Domaine | État actuel |
|---|---|
| `SALARIES_PAR_ENTREPRISE.atlantique` | 11 entrées — suffisant pour rendre tous les EmptyState et états de service. |
| `BULLETINS_PAR_ENTREPRISE.atlantique` | 10 entrées (mix consultation/signature représentatif) — suffisant pour le dashboard, le suivi, la liste bulletins. |

### A.4 — Méta : audit de clôture

À faire le jour de la clôture, dans cet ordre :

- [ ] Toutes les lignes des sections A.1 / A.2 / A.3 sont rayées ou ont fait l'objet d'une décision explicite (porter, reporter, abandonner). A.3 peut être ignorée si la démo accepte 11 salariés.
- [ ] `npm run parite:public` couvre les **17 routes publiques + Pli Pro + mobile salarié + cabinet + console opérateur** avec parité visuelle validée.
- [ ] `grep -rn "Stub\|stub\|Placeholder\|placeholder Phase 0"` dans `apps/web/src` ne ramène que des `placeholder=` HTML d'input.
- [ ] Création de `docs/dette-phase-1.md` et migration de TOUS les `TODO(phase-1)` (section B.1) dans ce fichier — laisse les commentaires `TODO(phase-1)` dans le code (les checks `grep` Phase 1 prendront le relais).
- [ ] Bundle principal **sous 250 kB gzip** (cible cf. A.2).

---

## B — Reporté à la Phase 1 par conception

Tout ce qui suit **n'est pas réalisable en Phase 0** : ces lignes dépendent du serveur, de l'AuthService réel ou d'invariants applicables côté back-end uniquement. Elles ne bloquent pas la clôture Phase 0 — elles seront reprises dans `docs/dette-phase-1.md` (à créer lors du jalon de clôture).

### B.1 — Wiring contexte tenant / auth

Les écrans Pli Pro affichent aujourd'hui un contexte tenant hardcodé (`{ type: 'entreprise', entrepriseId: 'atlantique' }`). En Phase 1, un hook `useContexteCourant()` branché à `AuthService.contexteCourant()` remplace les constantes. Marqueurs `TODO(phase-1)` à conserver dans le code jusqu'à la migration.

Fichiers concernés (12) :

- `apps/web/src/routes/pro/_layout.tsx` — entreprise, utilisateur connecté, abonnement essai
- `apps/web/src/routes/pro/dashboard.tsx` — contexte tenant + activité récente
- `apps/web/src/routes/pro/salaries/{list,detail,import}.tsx` — contexte tenant + registre de services + nom entreprise
- `apps/web/src/routes/pro/bulletins/{list,reconciliation}.tsx` — contexte tenant + nom entreprise
- `apps/web/src/routes/pro/suivi.tsx` — contexte tenant
- `apps/web/src/routes/pro/reclamations.tsx` — contexte tenant + nom utilisateur RH (signature des réponses)
- `apps/web/src/routes/pro/facturation.tsx` — contexte tenant + wallet Wave hardcodé
- `apps/web/src/routes/pro/securite.tsx` — contexte tenant
- `apps/web/src/routes/pro/parametres.tsx` — contexte tenant + ID Pli / date activation / conseiller hardcodés
- `apps/web/src/routes/app/_layout.tsx` + tous les `app/*.tsx` — `CONTEXTE_SALARIE` hardcodé `cp-aya` (mobile salarié)
- `apps/web/src/routes/app/signature.tsx` — `IP_DEMO` figée (renseignée par le serveur en Phase 1)
- `apps/web/src/routes/cabinet/_layout.tsx` + tous les `cabinet/*.tsx` (`portefeuille`, `entreprise`, `suivi`, `statistiques`, `gestionnaires`, `facturation`, `parametres`) — `CABINET_COURANT_ID` (`cab-ebrie`) et `GESTIONNAIRE_COURANT_ID` (`uc-1`) hardcodés ; `CONSEILLER_DEMO` figé dans `parametres.tsx` (espace cabinet, étape 11)
- `apps/web/src/routes/admin/layout.tsx` — `UTILISATEUR_NOM` (`Drissa Diomandé`), `INCIDENT_ACTIF/TITRE/DESC/DEPUIS`, `TICKETS_OUVERTS` hardcodés ; en Phase 1, branchés à `AdminService.obtenirEtatPlateforme` (sub-lot 12a)
- `apps/web/src/routes/admin/*.tsx` (vue-ensemble, entreprises, cabinets, utilisateurs, revenus, plans, modules, support, conformite, sante, communications, parametres, audit) — `CONTEXTE_DEMO` = `{ type: 'admin', adminId: 'u1' }` hardcodé ; à brancher à `AuthService.contexteCourant()` Phase 1 (sub-lots 12b/c/d)

### B.2 — Invariants serveur

| Élément | Pourquoi Phase 1 |
|---|---|
| Journal d'audit append-only chaîné par hash | Le chaînage cryptographique vit sur le serveur (CLAUDE.md « append-only chaîné par hash »). Le mock expose seulement la lecture. |
| Validation type + sandboxing PDF côté ingestion | Le parsing PDF sécurisé vit sur le serveur (CLAUDE.md « parser en bac à sable »). Le mock simule la réussite. |
| Max 2 sessions Pro appliqué à la connexion | Le mock applique `slice(0, 2)` côté lecture comme miroir UX. La vraie déconnexion automatique du plus ancien arrive avec l'AuthService. |
| Refus distribution des exceptions par le serveur | Le mock le fait déjà côté service ; reste à doubler côté API HTTP. |
| Wallet Wave réel par tenant | Vient du partenaire Wave en Phase 1, hardcodé en Phase 0. |

### B.3 — Marketing différé (décision explicite)

| Élément | Décision |
|---|---|
| Articles blog individuels (pages détail) | **Reporté** — l'index publié suffit au lancement. Pas de parcours utilisateur cassé (les cards n'ont pas de lien actif). |
