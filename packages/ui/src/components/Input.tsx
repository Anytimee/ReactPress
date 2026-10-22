import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  leadingSlot?: ReactNode;
  trailingSlot?: ReactNode;
}

const controlClasses =
  'h-9 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-3 ' +
  'text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] ' +
  'transition-colors duration-100 ' +
  'focus-visible:outline focus-visible:outline-[var(--focus-outline)] focus-visible:outline-offset-[var(--focus-offset)] ' +
  'disabled:cursor-not-allowed disabled:bg-[var(--bg)] disabled:text-[var(--muted)]';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, leadingSlot, trailingSlot, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-[12px] font-medium text-[var(--ink-2)]">
          {label}
        </label>
      ) : null}

      <div className="relative flex items-center">
        {leadingSlot ? (
          <span className="pointer-events-none absolute left-2.5 text-[var(--muted)]">{leadingSlot}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            controlClasses,
            leadingSlot && 'pl-8',
            trailingSlot && 'pr-8',
            error && 'border-[var(--danger)]',
            className,
          )}
          {...props}
        />
        {trailingSlot ? <span className="absolute right-2.5 text-[var(--muted)]">{trailingSlot}</span> : null}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-[12px] text-[var(--danger)]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[12px] text-[var(--muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
