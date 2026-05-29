// Icon — wrapper STRICTEMENT lucide-react.
//
// Le type `IconName` est dérivé du registre `icons` exporté par lucide-react :
// toute valeur passée à `<Icon name="..." />` doit être un nom PascalCase
// d'icône réellement présente. Une faute de frappe ("Userplus", "FileTxt")
// échoue à la compilation TypeScript — pas en production.
//
// Aucun emoji, aucun SVG ad hoc en dehors de Logo/SealIcon (cf. logo.tsx).

import { icons, type LucideProps } from 'lucide-react';

export type IconName = keyof typeof icons;

export interface IconProps extends Omit<LucideProps, 'name'> {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, className, strokeWidth = 1.75, ...rest }: IconProps) {
  const LucideIcon = icons[name];
  if (!LucideIcon) {
    // Garde-fou si un cast contourne le type ; rend un carré neutre.
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  return (
    <LucideIcon size={size} className={className} strokeWidth={strokeWidth} aria-hidden {...rest} />
  );
}
