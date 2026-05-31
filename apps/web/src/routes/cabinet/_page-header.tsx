// CabinetPageHeader — en-tête uniforme des pages de l'espace cabinet.
// Porté verbatim de _wireframe/src/cabinet-layout.jsx (CabinetPageHeader).

import type { ReactNode } from 'react';

export interface CabinetPageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function CabinetPageHeader({ title, subtitle, actions }: CabinetPageHeaderProps) {
  return (
    <div
      className="px-8 py-6 border-b border-bordure bg-white"
      data-testid="page-header"
    >
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
