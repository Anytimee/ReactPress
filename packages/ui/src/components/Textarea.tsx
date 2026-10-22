import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string | null;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, id, rows = 4, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-1">
      {label ? (
        <label htmlFor={fieldId} className="text-[12px] font-medium text-[var(--ink-2)]">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          'w-full resize-y rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2',
          'text-[13px] leading-[1.55] text-[var(--ink)] placeholder:text-[var(--muted)]',
          'focus-visible:outline focus-visible:outline-[var(--focus-outline)] focus-visible:outline-offset-[var(--focus-offset)]',
          'disabled:cursor-not-allowed disabled:bg-[var(--bg)]',
          error && 'border-[var(--danger)]',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-[12px] text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
});
