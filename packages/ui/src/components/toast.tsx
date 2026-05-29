// Toast — singleton via Context + helper window pour appel hors composant.
//
// L'API publique reste verbatim avec le wireframe :
//   - <ToastProvider> au sommet de l'app
//   - const pousser = useToast() pour pousser un toast depuis un composant
//   - window.__toast(...) pour pousser depuis un écran ad hoc (compat wireframe)

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './icon.js';
import { STATUS_STYLES, type StatusTone } from './status-pill.js';

export interface ToastPayload {
  tone?: StatusTone;
  icon?: IconName;
  message: string;
  duration?: number;
}

type ToastInterne = ToastPayload & { id: string };

export type ToastPusher = (t: ToastPayload) => void;

const ToastContext = createContext<ToastPusher | null>(null);

declare global {
  interface Window {
    __toast?: ToastPusher;
  }
}

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastInterne[]>([]);

  const push = useCallback<ToastPusher>((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((cur) => [...cur, { id, ...t }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), t.duration ?? 3800);
  }, []);

  useEffect(() => {
    window.__toast = push;
    return () => {
      delete window.__toast;
    };
  }, [push]);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center">
        {toasts.map((t) => {
          const tone: StatusTone = t.tone ?? 'succes';
          const s = STATUS_STYLES[tone];
          return (
            <div
              key={t.id}
              className="toast-in flex items-center gap-3 bg-white rounded-md border shadow-float pl-3 pr-4 py-2.5"
              style={{ borderColor: s.border, minWidth: 280 }}
            >
              <Icon name={t.icon ?? s.icon} size={16} style={{ color: s.fg }} />
              <span className="text-[13px] text-encre">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Renvoie la fonction de poussée du toast. À utiliser dans un composant rendu sous ToastProvider. */
export function useToast(): ToastPusher {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast doit être appelé à l'intérieur d'un <ToastProvider>.");
  }
  return ctx;
}
