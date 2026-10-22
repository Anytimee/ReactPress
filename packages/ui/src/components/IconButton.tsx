import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn.js';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Wajib untuk aksesibilitas — teks yang dibaca screen reader. */
  label: string;
  icon: ReactNode;
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default:
    'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--bg)] active:bg-[var(--line)]',
  ghost: 'bg-transparent text-[var(--ink-2)] border border-transparent hover:bg-[var(--bg)] active:bg-[var(--line)]',
  danger:
    'bg-transparent text-[var(--danger)] border border-transparent hover:bg-[var(--bg)] active:bg-[var(--line)]',
} as const;

const sizeClasses = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, label, icon, variant = 'default', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-sm)] border transition-colors duration-100',
        'focus-visible:outline focus-visible:outline-[var(--focus-outline)] focus-visible:outline-offset-[var(--focus-offset)]',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
});
