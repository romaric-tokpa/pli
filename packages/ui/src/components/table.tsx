// Table — version présentationnelle. Pas de tri auto (wireframe-y).

import type { ReactNode } from 'react';
import { cn } from '../lib/cn.js';

/**
 * Définition d'une colonne. Deux modes équivalents :
 *  - `render(row)` fournit explicitement la cellule (cas dominant dans le wireframe ;
 *    permet les colonnes SYNTHÉTIQUES sans champ source, ex. boutons d'action).
 *  - `key` projette directement un champ de la ligne, converti en string.
 * Si les deux sont fournis, `render` gagne. Si aucun, la cellule est vide.
 */
export interface TableColumn<TRow> {
  label: string;
  width?: number | string;
  render?: (row: TRow) => ReactNode;
  key?: keyof TRow;
}

export interface TableProps<TRow> {
  columns: TableColumn<TRow>[];
  data: TRow[];
  onRowClick?: (row: TRow) => void;
  emptyState?: ReactNode;
  dense?: boolean;
}

export function Table<TRow>({ columns, data, onRowClick, emptyState, dense }: TableProps<TRow>) {
  if (!data || data.length === 0) return emptyState ?? null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-bordure">
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn(
                  'px-4 text-[12px] font-medium text-texte-secondaire uppercase tracking-wide',
                  dense ? 'py-2.5' : 'py-3',
                )}
                style={{ letterSpacing: '.04em', width: c.width }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr
              key={ri}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-bordure last:border-b-0 transition',
                onRowClick && 'cursor-pointer hover:bg-surface/60',
              )}
            >
              {columns.map((c, ci) => (
                <td
                  key={ci}
                  className={cn(
                    'px-4 text-[13.5px] text-encre align-middle',
                    dense ? 'py-2.5' : 'py-3.5',
                  )}
                >
                  {c.render ? c.render(row) : c.key !== undefined ? String(row[c.key] ?? '') : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
