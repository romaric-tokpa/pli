// Button & IconButton — parité STRICTE avec design-system.jsx.
// Noms de variant verbatim : primary | secondary | ghost | danger | cachet.

import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon.js';
import { cn } from '../lib/cn.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cachet';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
  ariaLabel?: string;
}

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 focus-ring select-none whitespace-nowrap';

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-[14px]',
  lg: 'h-12 px-5 text-[15px]',
};

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-encre text-white hover:bg-[#0F1F3D] active:bg-[#0A1730] shadow-sm',
  secondary: 'bg-white text-encre border border-bordure hover:bg-surface hover:border-[#B8C0CE]',
  ghost: 'bg-transparent text-encre hover:bg-surface',
  danger: 'bg-erreur text-white hover:bg-[#B33028]',
  cachet: 'bg-cachet text-white hover:bg-[#9F4A2F]',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  loading,
  onClick,
  type = 'button',
  className = '',
  fullWidth,
  ariaLabel,
}: ButtonProps) {
  const dis =
    disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
  const iconSize = size === 'sm' ? 14 : 16;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={cn(
        BUTTON_BASE,
        BUTTON_SIZES[size],
        BUTTON_VARIANTS[variant],
        dis,
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading && <Icon name="LoaderCircle" size={16} className="animate-spin" />}
      {!loading && icon && <Icon name={icon} size={iconSize} />}
      {children && <span>{children}</span>}
      {!loading && iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}

// -----------------------------------------------------------------------------
// IconButton
// -----------------------------------------------------------------------------
export type IconButtonVariant = 'ghost' | 'secondary' | 'solid';

export interface IconButtonProps {
  icon: IconName;
  ariaLabel?: string;
  onClick?: () => void;
  size?: ButtonSize;
  variant?: IconButtonVariant;
  className?: string;
}

const ICON_BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const ICON_BUTTON_VARIANTS: Record<IconButtonVariant, string> = {
  ghost: 'text-texte-secondaire hover:bg-surface hover:text-encre',
  secondary: 'bg-white border border-bordure text-encre hover:bg-surface',
  solid: 'bg-encre text-white hover:bg-[#0F1F3D]',
};

export function IconButton({
  icon,
  ariaLabel,
  onClick,
  size = 'md',
  variant = 'ghost',
  className = '',
}: IconButtonProps) {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition focus-ring',
        ICON_BUTTON_SIZES[size],
        ICON_BUTTON_VARIANTS[variant],
        className,
      )}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
