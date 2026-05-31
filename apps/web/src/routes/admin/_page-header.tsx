// AdminPageHeader — en-tête uniforme des pages de la console opérateur.
// Porté verbatim de _wireframe/src/admin-layout.jsx (AdminPageHeader).

import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@pli/ui';

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: AdminPageHeaderProps) {
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
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
