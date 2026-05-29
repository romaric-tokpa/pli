// Modal & Drawer — overlays modaux.

import type { ReactNode } from 'react';
import { IconButton } from './button.js';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const MODAL_WIDTHS: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-encre/40" onClick={onClose} />
      <div
        className={`relative bg-white rounded-lg shadow-float w-full ${MODAL_WIDTHS[size]} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-bordure">
          <h2 className="text-[16px] font-semibold text-encre">{title}</h2>
          <IconButton icon="X" ariaLabel="Fermer" onClick={onClose} size="sm" />
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-bordure flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Drawer
// -----------------------------------------------------------------------------
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Drawer({ open, onClose, title, children, footer, width = 480 }: DrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-encre/30" onClick={onClose} />
      <div
        className="absolute right-0 top-0 bottom-0 bg-white shadow-float flex flex-col"
        style={{ width }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-bordure">
          <h2 className="text-[16px] font-semibold text-encre">{title}</h2>
          <IconButton icon="X" ariaLabel="Fermer" onClick={onClose} size="sm" />
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-bordure flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
