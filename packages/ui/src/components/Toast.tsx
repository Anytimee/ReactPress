import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn.js';

export type ToastVariant = 'default' | 'success' | 'danger';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    counter += 1;
    const id = `toast-${counter}`;
    setItems((current) => [...current, { ...options, id }]);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            duration={item.duration ?? 4000}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
            className={cn(
              'flex w-[320px] items-start gap-3 rounded-[var(--radius)] border border-[var(--line)]',
              'bg-[var(--surface)] p-3 shadow-[var(--shadow-1)]',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
            )}
          >
            <div className="flex flex-1 flex-col gap-1">
              <ToastPrimitive.Title className="text-[13px] font-medium text-[var(--ink)]">
                {item.title}
              </ToastPrimitive.Title>
              {item.description ? (
                <ToastPrimitive.Description className="text-[12px] leading-[1.55] text-[var(--muted)]">
                  {item.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close
              aria-label="Tutup notifikasi"
              className="text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-[var(--focus-outline)]"
            >
              <X size={14} strokeWidth={1.75} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-[320px] flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  }
  return context;
}
