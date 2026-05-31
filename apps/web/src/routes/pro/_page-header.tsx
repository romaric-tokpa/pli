// PageHeader Pro — port verbatim de _wireframe/src/pro-layout.jsx.
// En-tête utilisée par tous les écrans /pro/* (titre + sous-titre + actions
// + fil d'Ariane optionnel).

import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@pli/ui';

export interface ProPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function ProPageHeader({ title, subtitle, breadcrumbs, actions }: ProPageHeaderProps) {
  return (
    <div
      className="px-8 py-6 border-b border-bordure bg-white"
      data-testid="page-header"
    >
      {breadcrumbs && (
        <div className="mb-2">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold text-encre leading-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-[14px] text-texte-secondaire">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
