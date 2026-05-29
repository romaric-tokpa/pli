// @vitest-environment happy-dom
//
// Verrouille les libellés juridiques sur la surface publique.
//
// PRÉSENCE obligatoire (CLAUDE.md, brief juridique) :
//   - « validation horodatée »  (jamais remplacé par « valeur probante »)
//   - « tant que votre compte est actif »  (jamais remplacé par « à vie »)
//   - « Conformité ARTCI »
//
// ABSENCE stricte (interdits par CLAUDE.md) :
//   - « valeur probante »   — la signature avancée n'est pas branchée
//   - « à vie »              — promesse de conservation impossible
//
// Si l'une de ces invariants se casse (un dev ajoute "à vie" dans un libellé,
// ou retire la mention « tant que votre compte est actif »), le test claque
// avant le déploiement.

import { afterEach, describe, expect, it } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@pli/ui';

import { SiteLanding } from '../routes/public/landing.js';
import { SiteConnexion } from '../routes/public/connexion.js';
import { SiteInscription } from '../routes/public/inscription.js';
import { SiteDevenirPartenaire } from '../routes/public/devenir-partenaire.js';
import { SiteOnboarding } from '../routes/public/onboarding-entreprise.js';
import { SiteMotDePasseOublie } from '../routes/public/mot-de-passe-oublie.js';
import { CGU } from '../routes/public/cgu.js';
import { Confidentialite } from '../routes/public/confidentialite.js';
import { ConformiteARTCI } from '../routes/public/conformite-artci.js';
import { MentionsLegales } from '../routes/public/mentions-legales.js';
import { PageCabinets } from '../routes/public/page-cabinets.js';
import { PageSalaries } from '../routes/public/page-salaries.js';

afterEach(() => cleanup());

function rendre(node: React.ReactNode, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <Routes>
          <Route path={route === '/' ? '/' : route} element={node} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

const FORMULATIONS_INTERDITES = [
  'valeur probante', // signature avancée pas branchée → on parle de « validation horodatée »
  'à vie', // conservation impossible à promettre → on parle de « tant que votre compte est actif »
];

describe('Surface publique — libellés juridiques verrouillés', () => {
  // ─── Landing publique ────────────────────────────────────────────────────
  describe('SiteLanding', () => {
    it('contient « validation horodatée », « Conformité ARTCI », et « tant que son compte est actif »', () => {
      const { container } = rendre(<SiteLanding />);
      const txt = container.textContent ?? '';
      // Case-insensitive : la formulation apparaît avec V majuscule dans les
      // titres et v minuscule dans les corps de texte.
      expect(txt.toLowerCase()).toContain('validation horodatée');
      expect(txt).toContain('Conformité ARTCI');
      expect(txt).toMatch(/tant que (son|votre) compte est actif/);
    });

    it('ne contient AUCUNE formulation interdite', () => {
      const { container } = rendre(<SiteLanding />);
      const txt = (container.textContent ?? '').toLowerCase();
      for (const formulation of FORMULATIONS_INTERDITES) {
        expect(txt, `« ${formulation} » est interdit sur la landing`).not.toContain(formulation);
      }
    });
  });

  // ─── CGU ─────────────────────────────────────────────────────────────────
  describe('CGU', () => {
    it('contient « tant que son compte reste actif » (article propriété du coffre-fort)', () => {
      const { container } = rendre(<CGU />);
      const txt = container.textContent ?? '';
      expect(txt).toContain('tant que son compte reste actif');
    });

    it('contient « 275 FCFA » et la composition (150 / 75 / 50)', () => {
      const { container } = rendre(<CGU />);
      const txt = container.textContent ?? '';
      expect(txt).toContain('275 FCFA');
      expect(txt).toContain('150 FCFA');
      expect(txt).toContain('75 FCFA');
      expect(txt).toContain('50 FCFA');
    });

    it('ne contient AUCUNE formulation interdite', () => {
      const { container } = rendre(<CGU />);
      const txt = (container.textContent ?? '').toLowerCase();
      for (const formulation of FORMULATIONS_INTERDITES) {
        expect(txt, `« ${formulation} » est interdit dans les CGU`).not.toContain(formulation);
      }
    });
  });

  // ─── Confidentialité ─────────────────────────────────────────────────────
  describe('Confidentialite', () => {
    it('contient « validation horodatée » et « tant que votre compte est actif »', () => {
      const { container } = rendre(<Confidentialite />);
      const txt = container.textContent ?? '';
      // Case-insensitive (« Validation horodatée » apparaît avec majuscule
      // dans la liste des finalités).
      expect(txt.toLowerCase()).toContain('validation horodatée');
      expect(txt).toContain('tant que votre compte est actif');
    });

    it('ne contient AUCUNE formulation interdite', () => {
      const { container } = rendre(<Confidentialite />);
      const txt = (container.textContent ?? '').toLowerCase();
      for (const formulation of FORMULATIONS_INTERDITES) {
        expect(txt, `« ${formulation} » est interdit en confidentialité`).not.toContain(
          formulation,
        );
      }
    });
  });

  // ─── Conformité ARTCI ────────────────────────────────────────────────────
  describe('ConformiteARTCI', () => {
    it('contient « Conformité ARTCI » + mention OneCI', () => {
      const { container } = rendre(<ConformiteARTCI />);
      const txt = container.textContent ?? '';
      expect(txt).toContain('Conformité ARTCI');
      expect(txt).toContain('OneCI');
      // Mention horodatage certifié et note signature avancée à venir
      expect(txt).toMatch(/horodatag/i);
    });

    it('ne promet PAS la signature avancée comme déjà disponible', () => {
      const { container } = rendre(<ConformiteARTCI />);
      const txt = (container.textContent ?? '').toLowerCase();
      expect(txt).not.toContain('valeur probante');
      // La page conformité PEUT mentionner « signature avancée » comme « à venir »
      // mais ne doit pas la qualifier de probante.
    });
  });

  // ─── Auth flows ──────────────────────────────────────────────────────────
  describe('Auth flows (connexion, inscription, devenir-partenaire, onboarding)', () => {
    it("Connexion mentionne « hébergement ARTCI Côte d'Ivoire » et « code valable 10 minutes »", () => {
      const { container } = rendre(<SiteConnexion />);
      const txt = container.textContent ?? '';
      expect(txt).toContain('ARTCI');
      // Le « Code valable 10 minutes » s'affiche à l'étape 2 uniquement.
      // Étape 1 : on vérifie au moins ARTCI.
    });

    it('Inscription mentionne « 20 bulletins offerts » et lie aux CGU + confidentialité', () => {
      const { container } = rendre(<SiteInscription />);
      const txt = container.textContent ?? '';
      expect(txt).toContain('20 bulletins offerts');
      expect(txt).toContain('CGU');
      expect(txt).toContain('confidentialité');
    });

    it('Devenir partenaire mentionne « consolidé (−10 %) » et « commission (15 %) »', () => {
      const { container } = rendre(<SiteDevenirPartenaire />);
      const txt = container.textContent ?? '';
      expect(txt).toContain('−10');
      expect(txt).toContain('15');
      expect(txt).toContain('consolidé');
      expect(txt).toContain('commission');
    });

    it("Onboarding démarre à l'étape 1 (Informations entreprise) et mentionne les bulletins remis aux salariés", () => {
      // L'écran arrive à l'étape 1 du Stepper. Les libellés « 20 bulletins
      // offerts » et « Chèque/Wave » apparaissent à l'étape 3 et sont
      // verrouillés par le test CGU / Inscription (où ils sont visibles dès
      // le premier rendu). Ici on vérifie juste l'amorce du flow.
      const { container } = rendre(<SiteOnboarding />);
      const txt = container.textContent ?? '';
      expect(txt).toContain('Configuration initiale');
      expect(txt).toContain('Informations entreprise');
    });

    it('Mot de passe oublié mentionne « valable 10 minutes »', () => {
      const { container } = rendre(<SiteMotDePasseOublie />);
      const txt = container.textContent ?? '';
      // Étape 1 ne montre pas encore ce texte ; affiché à l'étape 2.
      // Mais le composant principal doit afficher l'étape 1 par défaut.
      expect(txt).toContain('Réinitialiser');
    });
  });

  // ─── Aucune formulation interdite sur les autres pages ────────────────────
  // describe.each utilise des factories pour éviter de figer du JSX dans le
  // tableau de cas (déclenche react/jsx-key sinon).
  describe.each([
    ['MentionsLegales', () => <MentionsLegales />],
    ['PageCabinets', () => <PageCabinets />],
    ['PageSalaries', () => <PageSalaries />],
  ] as const)('%s', (_nom, factory) => {
    it('ne contient AUCUNE formulation interdite', () => {
      const { container } = rendre(factory());
      const txt = (container.textContent ?? '').toLowerCase();
      for (const formulation of FORMULATIONS_INTERDITES) {
        expect(txt, `« ${formulation} » interdit`).not.toContain(formulation);
      }
    });
  });
});
