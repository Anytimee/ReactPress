import { Slot } from '@radix-ui/react-slot';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--bg)] active:bg-[var(--line)]',
  primary:
    'bg-[var(--ink)] text-[var(--surface)] border-[var(--ink)] hover:bg-[var(--ink-2)] active:bg-[var(--ink-2)]',
  ghost:
    'bg-transparent text-[var(--ink)] border border-transparent hover:bg-[var(--bg)] active:bg-[var(--line)]',
  outline:
    'bg-transparent text-[var(--ink)] border-[var(--line)] hover:bg-[var(--bg)] active:bg-[var(--line)]',
  danger: 'bg-[var(--danger)] text-white border-[var(--danger)] hover:opacity-90 active:opacity-80',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-[12px]',
  md: 'h-9 px-3 text-[13px]',
  lg: 'h-10 px-4 text-[14px]',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border font-medium ' +
  'transition-colors duration-100 whitespace-nowrap select-none ' +
  'focus-visible:outline focus-visible:outline-[var(--focus-outline)] focus-visible:outline-offset-[var(--focus-offset)] ' +
  'disabled:pointer-events-none disabled:opacity-50';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'md', asChild = false, loading = false, children, ...props },
  ref,
) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      data-loading={loading ? 'true' : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </Component>
  );
});
