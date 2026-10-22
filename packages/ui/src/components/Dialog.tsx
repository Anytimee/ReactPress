import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '../lib/cn.js';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widthClasses = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[760px]',
} as const;

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { open, onOpenChange, title, description, children, footer, width = 'md' },
  ref,
) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-[rgba(17,17,17,0.35)] data-[state=open]:animate-in data-[state=closed]:animate-out"
        />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2',
            'rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-1)]',
            'flex max-h-[calc(100vh-64px)] flex-col',
            widthClasses[width],
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-4 py-3">
            <div className="flex flex-col gap-1">
              <DialogPrimitive.Title className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="text-[12px] text-[var(--muted)]">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close
              aria-label="Tutup"
              className={cn(
                'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
                'text-[var(--muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--ink)]',
                'focus-visible:outline focus-visible:outline-[var(--focus-outline)] focus-visible:outline-offset-[var(--focus-outline)]',
              )}
            >
              <X size={16} strokeWidth={1.75} />
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-[var(--line)] px-4 py-3">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
});
