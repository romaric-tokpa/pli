// Breadcrumbs, Tabs, Stepper — navigation et progression.

import { Fragment } from 'react';
import { Icon, type IconName } from './icon.js';
import { cn } from '../lib/cn.js';

// -----------------------------------------------------------------------------
// Breadcrumbs
// -----------------------------------------------------------------------------
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Fil d'ariane"
      className="flex items-center gap-1.5 text-[13px] text-texte-secondaire"
    >
      {items.map((it, i) => (
        <Fragment key={`${it.label}-${i}`}>
          {i > 0 && <Icon name="ChevronRight" size={12} />}
          {it.href ? (
            <a href={it.href} className="hover:text-encre">
              {it.label}
            </a>
          ) : (
            <span className={cn(i === items.length - 1 && 'text-encre font-medium')}>
              {it.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

// -----------------------------------------------------------------------------
// Tabs
// -----------------------------------------------------------------------------
export interface TabItem {
  value: string;
  label: string;
  icon?: IconName;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (next: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className = '' }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-0.5 border-b border-bordure', className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              'relative h-10 px-4 text-[14px] font-medium transition focus-ring',
              active ? 'text-encre' : 'text-texte-secondaire hover:text-encre',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {t.icon && <Icon name={t.icon} size={14} />}
              {t.label}
              {t.count != null && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] bg-surface text-texte-secondaire">
                  {t.count}
                </span>
              )}
            </span>
            {active && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-encre rounded-t" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Stepper
// -----------------------------------------------------------------------------
export interface StepperProps {
  steps: string[];
  /** Index 1-based de l'étape courante. */
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center w-full">
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <li
            key={`${s}-${i}`}
            className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition',
                  done && 'bg-encre text-white',
                  active && 'bg-encre text-white ring-4 ring-[#15294E]/10',
                  !done && !active && 'bg-white border border-bordure text-texte-secondaire',
                )}
              >
                {done ? <Icon name="Check" size={14} strokeWidth={3} /> : idx}
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    'text-[11px] uppercase tracking-wide',
                    active ? 'text-encre' : 'text-texte-secondaire',
                  )}
                  style={{ letterSpacing: '.06em' }}
                >
                  Étape {idx}
                </span>
                <span
                  className={cn(
                    'text-[13px] font-medium',
                    active || done ? 'text-encre' : 'text-texte-secondaire',
                  )}
                >
                  {s}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('flex-1 h-px mx-4', done ? 'bg-encre' : 'bg-bordure')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
