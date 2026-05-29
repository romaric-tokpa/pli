# Dette Phase 0 — registre classé

État au 2026-05-29, après clôture de l'étape 9 (Pli Pro).

**Convention** :

- **Stub** = route câblée mais contenu remplacé par un placeholder visible. Build/typecheck verts, route accessible, contenu non porté.
- **Manquant** = route non câblée (404).
- **Dégradé** = composant fonctionnel mais avec API/structure simplifiée.

---

## A — À solder AVANT de déclarer la Phase 0 finie

Tout ce qui suit doit être livré ou explicitement abandonné avant la clôture. Chaque ligne bloque la mention « Phase 0 100 % ».

### A.1 — Écrans encore en stub ou manquants

| Fichier / Route | Statut | À faire |
|---|---|---|
| `apps/web/src/routes/pro/bulletins/depot-individuel.tsx` | **Stub** — bandeau Phase 0 + lien vers le dépôt en masse | Porter verbatim `ProBulletinDepotIndividuel` de `_wireframe/src/pro-bulletins.jsx` (3 étapes : PDF → matricule + période → récap). Utilise `SalariesService.resoudreParMatricule(ctx)` pour l'appairage borné au tenant. |
| `/verification` (`SiteVerification` v2) | **Manquant** — référencée par le flow auth | **Bloquant clôture (confirmé sub-lot 10a)** — « se connecter en 2FA » est un parcours indivisible. Porter l'écran 2FA standalone de `_wireframe/src/site-auth-v2.jsx` (verbatim). Sans elle, le parcours « code SMS / TOTP » de connexion tombe en 404. |
| `/reinitialiser-mot-de-passe` (`SiteReinitialiserMotDePasse` v2) | **Manquant** | **Bloquant clôture (confirmé sub-lot 10a)** — « récupérer son mot de passe » est un parcours indivisible. Porter depuis v2 (étape post-code de l'e-mail de récupération). |
| `apps/web/src/routes/admin/hub.tsx` | **Stub** explicite « Migration prévue à l'étape 12 » | Étape 12 du périmètre Phase 0 : porter `admin-overview.jsx`, `admin-entreprises.jsx`, `admin-business.jsx`, `admin-ops.jsx`. Déploiement séparé en Phase 5, mais le code doit exister. |
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
