import type { ReactNode } from 'react';

const controlClass =
  'h-8 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-2 ' +
  'text-[12px] text-[var(--ink)] placeholder:text-[var(--muted)] ' +
  'focus-visible:outline focus-visible:outline-[var(--focus-outline)] focus-visible:outline-offset-[var(--focus-outline)]';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</span>
      {children}
      {hint ? <span className="text-[11px] text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { value: string },
): JSX.Element {
  return <input {...props} className={`${controlClass} ${props.className ?? ''}`} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string },
): JSX.Element {
  return <textarea {...props} className={`${controlClass} h-auto py-1.5 ${props.className ?? ''}`} />;
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { value: string },
): JSX.Element {
  return <select {...props} className={`${controlClass} ${props.className ?? ''}`} />;
}

export function OptionSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}): JSX.Element {
  return (
    <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </SelectInput>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}): JSX.Element {
  return (
    <label className="flex items-center gap-2 text-[12px] text-[var(--ink-2)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-[var(--ink)]"
      />
      {label}
    </label>
  );
}
