import { createContext, useContext, useRef, useCallback } from 'react';

interface ToastContextType {
  toast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const elRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string) => {
    const el = elRef.current;
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => el.classList.remove('show'), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast" ref={elRef} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
