// Tokens de la charte Pli — SOURCE UNIQUE DE VÉRITÉ.
//
// Valeurs extraites mot pour mot de _wireframe/index.html (lignes 14-54)
// — aucune retranscription manuelle. Le preset Tailwind dérive ces tokens ;
// le CSS de base les référence par variable ; les composants typés (étape 5)
// les consomment via les classes utilitaires.
//
// CLAUDE.md interdit toute modification de la charte. En cas d'évolution
// pilotée (rare), faire la modification ICI uniquement — tout le reste suit.

type ValeurCouleur = string | { DEFAULT: string; [variante: string]: string };

/** Compatible avec la signature `fontSize` de Tailwind v3 (configuration partielle). */
type TailleTexteEntree = [
  taille: string,
  options: Partial<{
    lineHeight: string;
    letterSpacing: string;
    fontWeight: string | number;
  }>,
];

export const couleurs: Record<string, ValeurCouleur> = {
  // Marque
  encre: '#15294E',
  cachet: '#B85737',
  papier: '#F6F2EB',
  // Neutres plateforme
  texte: { DEFAULT: '#15294E', secondaire: '#5B6577' },
  bordure: '#DCE1E9',
  surface: '#F3F5F9',
  // États
  succes: '#2F8F5B',
  attente: '#D9A227',
  erreur: '#CB3B33',
  info: '#2C6FB3',
};

export const policeFamille: Record<string, string[]> = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
};

export const rayons: Record<string, string> = {
  sm: '6px',
  DEFAULT: '8px',
  md: '8px',
  lg: '12px',
};

export const taillesTexte: Record<string, TailleTexteEntree> = {
  h1: ['28px', { lineHeight: '1.25', fontWeight: '600' }],
  h2: ['22px', { lineHeight: '1.3', fontWeight: '600' }],
  h3: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
  body: ['15px', { lineHeight: '1.6', fontWeight: '400' }],
  small: ['13px', { lineHeight: '1.5', fontWeight: '400' }],
};

export const ombres: Record<string, string> = {
  card: '0 1px 2px rgba(21,41,78,0.04), 0 1px 3px rgba(21,41,78,0.06)',
  float: '0 6px 18px rgba(21,41,78,0.08), 0 2px 6px rgba(21,41,78,0.04)',
};
