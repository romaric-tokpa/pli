# CLAUDE.md — Pli (le coffre-fort de paie)

Ce fichier cadre Claude Code sur le projet Pli. Lis-le au début de chaque session
et respecte-le sans exception. En cas de doute, choisis la sobriété et demande.

## Le produit
Pli est une plateforme SaaS de **dématérialisation, distribution et conservation des
bulletins de paie** pour l'Afrique de l'Ouest francophone (lancement Côte d'Ivoire).
Pli **n'édite pas** la paie : il reçoit des bulletins PDF déjà produits, les apparie au
bon salarié par matricule, les distribue, en trace la remise et les conserve.
Cinq surfaces : landing publique, **Pli Pro** (RH), **app mobile salarié**, **espace
cabinet**, **console opérateur** (isolée).

## Pile & dépôt
- Monorepo : `apps/web` (Vite + React + TS + Tailwind), `apps/mobile` (React Native),
  `services/api` (NestJS + TS), `packages/ui` (design-system), `packages/types`.
- Base : **PostgreSQL** avec `tenant_id` + **Row-Level Security**.
- Stockage du coffre : stockage objet compatible S3, **chiffré au repos**.

## Charte (NE JAMAIS modifier)
- Couleurs : Encre `#15294E`, Cachet `#B85737`, Papier `#F6F2EB`.
  États : succès `#2F8F5B`, attente `#D9A227`, erreur `#CB3B33`, info `#2C6FB3`.
- Police : **Inter**. Icônes : **lucide uniquement**. **Aucun emoji**, nulle part.
- Montants en **FCFA**, dates **JJ/MM/AAAA**, téléphone **+225**, langue **française**.
- Reprendre les écrans du wireframe à l'identique ; aucune régression visuelle.

## Invariants métier (bloquants)
1. Le **salaire net** n'apparaît JAMAIS dans une liste, carte, prévisualisation ou
   résumé. Il n'est jamais lu ni stocké hors du document. Il ne vit que dans le PDF.
2. Tout salarié est rattaché à une entreprise ; tout bulletin appartient à un
   rattachement, donc à une entreprise. **Aucun orphelin.**
3. L'appairage du matricule est **borné au registre de l'entreprise du contexte**.
   **Rien n'est distribué sans appairage certain** (apparié). Jamais une exception.
4. La **console opérateur** n'est jamais exposée sur le site public ni le hub ; en
   production, déploiement séparé, non indexé. Toute impersonation est journalisée.
5. **Trois contextes d'accès** : entreprise (son tenant), cabinet (son portefeuille,
   entreprises cloisonnées), personnel salarié (ses bulletins tous employeurs
   confondus). Le coffre agrège entre employeurs **seulement** en contexte personnel ;
   le salarié ne voit jamais le cabinet.
6. Le forfait **275 FCFA** (= 150 distribution + 75 signature + 50 réclamation) doit
   rester cohérent entre Pli Pro, la console et le modèle économique.
7. **Tout bouton déclenche une action** (aucun bouton inactif).

## Parité visuelle & shells (consigne permanente)

La parité avec le wireframe (`docs/wireframe/` + captures de référence) est un
livrable, pas un détail. Pour CHAQUE surface (publique, Pli Pro, mobile salarié,
espace cabinet, console opérateur) :

1. **Le shell d'abord, l'écran ensuite.** Avant de porter le moindre écran interne,
   reproduis À L'IDENTIQUE le squelette de la surface : layout, navigation, en-têtes,
   pieds de page, cadres. Exemples à ne jamais simplifier :
   - Auth : mise en page **deux colonnes** (panneau gauche Encre — sceau filigrané,
     badge ocre, hero « Bien reçu. Bien gardé. », 3 preuves, © Pli SARL — + colonne
     droite Papier avec le formulaire).
   - Pages légales : **bande d'en-tête Encre pleine largeur** (fil d'Ariane, surtitre
     « LÉGAL », icône en carré ocre, titre blanc, sous-titre, sceau filigrané).
   - Pli Pro : **sidebar + topbar**. Mobile : **cadre téléphone 390 px**.
     Console : **layout Encre + badge « Console opérateur »**.

2. **Vérification par capture, obligatoire.** Aucune surface ni aucun écran n'est
   « porté » tant qu'il n'a pas été comparé **côte à côte avec sa capture de
   référence**. Ne jamais simplifier un shell en « carte centrée » ou en bloc
   générique. En cas de doute, la source `docs/wireframe/src/*.jsx` fait foi.

3. **Pas de granularité fantôme.** Ne pas re-subdiviser une étape en sous-lots pour
   en valider la partie facile : une surface n'est « terminée » que lorsque TOUS ses
   écrans atteignent la parité visuelle (shell + contenu + composants stylés).

4. **La parité se juge sur le rendu, pas sur les données.** Un nom ou un chiffre de
   démo qui diffère légèrement entre `docs/wireframe/` et `services/_mocks/` n'est PAS
   une régression tant que structure, layout et libellés sont identiques.

## Sécurité (non négociable)
- **Isolation tenant** : `tenant_id` sur chaque ligne + RLS PostgreSQL. Tout accès est
  scopé par tenant ET vérifié en propriété. Ne jamais faire confiance à un id fourni
  par le client (prévention IDOR — le risque n°1).
- **Injection SQL** : requêtes paramétrées / ORM à liaison de variables UNIQUEMENT.
  Jamais de concaténation de chaîne pour construire une requête.
- **Validation des entrées** par liste blanche.
- **Auth** : hachage Argon2, 2FA TOTP, OTP pour actions sensibles, max 2 sessions par
  entreprise / 1 sur mobile, cookies `httpOnly`+`Secure`+`SameSite`.
- **Upload PDF** : valider le type réel + la taille ; parser en bac à sable ; jamais
  exécuter un PDF ; stocker hors racine web, dans le stockage objet chiffré.
- **Chiffrement** : TLS 1.2+ en transit, chiffrement au repos. Secrets dans un
  gestionnaire de secrets, jamais dans le code ni le dépôt.
- **Journal d'audit** append-only chaîné par hash pour toute action sensible.
- XSS (encodage en sortie + CSP), CSRF (SameSite + jetons), rate limiting / anti-force
  brute, WAF devant l'API.

## Libellés juridiques (déjà décidés dans le wireframe)
- Signature : **« validation horodatée »** (pas « valeur probante » tant que le
  partenaire de signature avancée n'est pas branché).
- Conservation : **« tant que votre compte est actif »** (pas « à vie »).
- Activation salarié : **acceptation des CGU bloquante** (compte personnel B2C).

## Façon de travailler
- **Petites étapes, petites PR.** Une tâche à la fois. Ne pas enchaîner deux phases
  sans valider la précédente (lint + tests + build verts ET critères de « terminé »).
- **Tests d'abord** sur les règles critiques : isolation tenant, appairage, « net
  jamais affiché », distribution bloquée pour les non-appariés.
- Avant de coder une fonctionnalité, **lis la spec correspondante** (cahier des
  charges, spéc. ingestion/réconciliation, spéc. détection du matricule, architecture
  & sécurité, brief juridique) si elle est jointe.
- Ne modifie pas la charte, n'ajoute pas d'export non prévu, n'expose pas la console.
- Données de démonstration : **ivoiriennes et réalistes** (FCFA, +225, JJ/MM/AAAA).

## Définition de « terminé » (par tâche)
- Le code build, lint et tests passent.
- Les invariants ci-dessus sont respectés et couverts par un test quand c'est critique.
- Aucune régression visuelle par rapport au wireframe.
- Toute action sensible écrit une entrée d'audit.
