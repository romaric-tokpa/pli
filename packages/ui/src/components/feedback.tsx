// EmptyState, Skeleton, SkeletonRow, ProgressBar.

import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon.js';
import { cn } from '../lib/cn.js';

// -----------------------------------------------------------------------------
// EmptyState
// -----------------------------------------------------------------------------
export interface EmptyStateProps {
  icon: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-14 w-14 rounded-full bg-surface flex items-center justify-center text-texte-secondaire">
        <Icon name={icon} size={24} />
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-encre">{title}</h3>
      {description && (
        <p className="mt-1 text-[13px] text-texte-secondaire max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Skeleton / SkeletonRow
// -----------------------------------------------------------------------------
export interface SkeletonProps {
  className?: string;
  height?: number;
}

export function Skeleton({ className = '', height = 16 }: SkeletonProps) {
  return <div className={cn('skeleton', className)} style={{ height }} />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="w-8 rounded-full" height={32} />
      <Skeleton className="flex-1 max-w-[200px]" height={12} />
      <Skeleton className="w-24" height={12} />
      <Skeleton className="w-16" height={12} />
      <Skeleton className="w-20" height={12} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// ProgressBar
// -----------------------------------------------------------------------------
export type ProgressTone = 'encre' | 'succes' | 'attente' | 'erreur';

export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: ProgressTone;
}

const PROGRESS_COLOR: Record<ProgressTone, string> = {
  encre: '#15294E',
  succes: '#2F8F5B',
  attente: '#D9A227',
  erreur: '#CB3B33',
};

export function ProgressBar({ value, max = 100, tone = 'encre' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
      <div
        style={{ width: `${pct}%`, backgroundColor: PROGRESS_COLOR[tone] }}
        className="h-full rounded-full transition-all"
      />
    </div>
  );
}
