// Logo & SealIcon — SVG des marques propres Pli.
// Ce sont les SEULS SVG ad hoc autorisés dans packages/ui ; tout le reste
// passe par <Icon /> (lucide-react).
//
// Couleurs : SealIcon référence les tokens via CSS custom properties
// (var(--pli-encre), var(--pli-cachet)). Pas de hex dupliqué, hormis le
// blanc qui n'est pas un token.

import { cn } from '../lib/cn.js';

export type LogoVariant = 'couleur' | 'blanc';

export interface SealIconProps {
  size?: number;
  variant?: LogoVariant;
}

export function SealIcon({ size = 32, variant = 'couleur' }: SealIconProps) {
  const ring = variant === 'blanc' ? '#FFFFFF' : 'var(--pli-cachet)';
  const inner = variant === 'blanc' ? '#FFFFFF' : 'var(--pli-encre)';
  const text = variant === 'blanc' ? '#FFFFFF' : 'var(--pli-encre)';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pli"
    >
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke={ring}
        strokeWidth="2"
        strokeDasharray="1.3 3.3"
      />
      <circle cx="32" cy="32" r="22" fill="none" stroke={inner} strokeWidth="1" />
      <text
        x="32"
        y="38"
        fontFamily="Inter, Arial, sans-serif"
        fontWeight="600"
        fontSize="16"
        fill={text}
        textAnchor="middle"
      >
        Pli
      </text>
    </svg>
  );
}

export interface LogoProps {
  size?: number;
  variant?: LogoVariant;
  withWordmark?: boolean;
  descripteur?: boolean;
  className?: string;
}

export function Logo({
  size = 32,
  variant = 'couleur',
  withWordmark = true,
  descripteur = false,
  className = '',
}: LogoProps) {
  const wordColor = variant === 'blanc' ? '#FFFFFF' : 'var(--pli-encre)';
  const descColor = variant === 'blanc' ? 'rgba(255,255,255,.75)' : 'var(--pli-texte-secondaire)';
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <SealIcon size={size} variant={variant} />
      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span
            style={{
              color: wordColor,
              fontWeight: 600,
              fontSize: Math.round(size * 0.7),
              letterSpacing: '-0.01em',
            }}
          >
            Pli
          </span>
          {descripteur && (
            <span style={{ color: descColor, fontSize: 11, marginTop: 2, fontWeight: 400 }}>
              le coffre-fort de paie
            </span>
          )}
        </div>
      )}
    </div>
  );
}
