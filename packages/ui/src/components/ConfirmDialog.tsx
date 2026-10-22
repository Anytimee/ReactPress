import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { forwardRef, type ReactNode } from 'react';
import { Button } from './Button.js';
import { cn } from '../lib/cn.js';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(function ConfirmDialog(
  {
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    destructive = false,
    onConfirm,
  },
  ref,
) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(17,17,17,0.35)]" />
        <AlertDialogPrimitive.Content
          ref={ref}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2',
            'rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]',
            'flex flex-col gap-3',
          )}
        >
          <AlertDialogPrimitive.Title className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
            {title}
          </AlertDialogPrimitive.Title>
          {description ? (
            <AlertDialogPrimitive.Description className="text-[13px] leading-[1.55] text-[var(--muted)]">
              {description}
            </AlertDialogPrimitive.Description>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="default" size="sm">
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <Button
              variant={destructive ? 'danger' : 'primary'}
              size="sm"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
});
