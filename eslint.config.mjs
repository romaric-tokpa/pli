// ESLint flat config — racine du monorepo.
// Les workspaces héritent automatiquement de cette config en remontant l'arbre.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.vite/**',
      '**/.turbo/**',
      '_wireframe/**',
      'docs/wireframe/**',
      'package-lock.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // React 17+ : pas besoin d'importer React dans chaque fichier JSX.
      'react/react-in-jsx-scope': 'off',
      // On utilise TypeScript pour la validation de props.
      'react/prop-types': 'off',
      // Désactivé pour une codebase 100 % française : l'apostrophe est omniprésente
      // (« l'app », « n'existe », « d'erreur »…). L'escape forcé en &apos; est
      // illisible et n'apporte aucune protection en pratique avec React.
      'react/no-unescaped-entities': 'off',
      // autoFocus sur le premier champ d'un formulaire d'auth/recherche est
      // un patron d'UX standard (gain d'accessibilité au clavier pour
      // l'utilisateur qui arrive sur la page). La règle est trop stricte.
      'jsx-a11y/no-autofocus': 'off',
      // Convention TS : préfixe _ marque les params/vars intentionnellement
      // inutilisés (stubs d'interface, destructurations à champs jetés).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
  // Bouclier d'architecture : les ÉCRANS et l'app ne doivent jamais
  // importer directement les données mock. Tout passe par la couche
  // services/ (interfaces typées). Garde-fou de l'invariant posé en
  // étape 7 et qui doit tenir aux étapes 8-12.
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    ignores: ['apps/web/src/services/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/_mocks/**', '**/services/_mocks/**'],
              message:
                'Les mocks de données sont privés à la couche services/. Importez depuis "@/services" ou le barrel "../services/index.js" via les interfaces typées.',
            },
          ],
        },
      ],
    },
  },
  // Doit rester en dernier : désactive les règles qui entreraient en conflit
  // avec Prettier (formatage exclusivement délégué à Prettier).
  prettier,
];
