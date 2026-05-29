// Avatar — initiales sur fond de couleur stable (hash sur le nom).

import { cn } from '../lib/cn.js';

export interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

/** Palette de teintes encre déclinées — verbatim depuis design-system.jsx. */
const AVATAR_PALETTE = ['#15294E', '#1F3D6E', '#2C6FB3', '#5C7AAA', '#3E5F8C', '#4A6FA5'];

export function Avatar({ name, size = 32, className = '' }: AvatarProps) {
  const initials = (name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase();

  const hash = Array.from(name ?? '').reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = AVATAR_PALETTE[hash % AVATAR_PALETTE.length] ?? AVATAR_PALETTE[0];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full text-white font-medium',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        backgroundColor: bg,
      }}
    >
      {initials}
    </span>
  );
}
