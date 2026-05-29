// Card & KPICard — surfaces conteneurs.

import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from './icon.js';
import { cn } from '../lib/cn.js';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: string;
  interactive?: boolean;
  bg?: string;
  style?: CSSProperties;
}

export function Card({
  children,
  className = '',
  padding = 'p-5',
  interactive,
  bg = 'bg-white',
  style,
}: CardProps) {
  return (
    <div
      style={style}
      className={cn(
        bg,
        'rounded-lg border border-bordure',
        padding,
        interactive && 'hover:border-[#B8C0CE] transition cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// KPICard
// -----------------------------------------------------------------------------
export type KPITone = 'neutre' | 'info' | 'succes' | 'attente' | 'erreur';

export interface KPITrend {
  up: boolean;
  label: string;
}

export interface KPICardProps {
  label: string;
  value: string | number;
  icon: IconName;
  tone?: KPITone;
  trend?: KPITrend;
  hint?: string;
}

const KPI_TONE_FG: Record<KPITone, string> = {
  neutre: '#5B6577',
  info: '#2C6FB3',
  succes: '#2F8F5B',
  attente: '#D9A227',
  erreur: '#CB3B33',
};

const KPI_TONE_BG: Record<KPITone, string> = {
  neutre: '#EFF2F7',
  info: '#DEEBF7',
  succes: '#E6F2EC',
  attente: '#FBF1D8',
  erreur: '#FBE3E1',
};

export function KPICard({ label, value, icon, tone = 'neutre', trend, hint }: KPICardProps) {
  const toneFg = KPI_TONE_FG[tone];
  const toneBg = KPI_TONE_BG[tone];
  return (
    <Card padding="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] text-texte-secondaire">{label}</div>
          <div className="mt-2 text-[28px] font-semibold text-encre leading-none tabular-nums">
            {value}
          </div>
          {hint && <div className="mt-1.5 text-[12px] text-texte-secondaire">{hint}</div>}
        </div>
        <div
          className="h-10 w-10 rounded-md flex items-center justify-center"
          style={{ backgroundColor: toneBg, color: toneFg }}
        >
          <Icon name={icon} size={18} />
        </div>
      </div>
      {trend && (
        <div
          className="mt-3 flex items-center gap-1 text-[12px]"
          style={{ color: trend.up ? '#2F8F5B' : '#CB3B33' }}
        >
          <Icon name={trend.up ? 'TrendingUp' : 'TrendingDown'} size={12} />
          <span>{trend.label}</span>
        </div>
      )}
    </Card>
  );
}
