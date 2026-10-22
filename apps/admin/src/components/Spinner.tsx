import { cn } from '@reactpress/ui';

export function Spinner({ className }: { className?: string }): JSX.Element {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink',
        className,
      )}
    />
  );
}

export function LoadingBlock({ label = 'Memuat data' }: { label?: string }): JSX.Element {
  return (
    <div className="flex min-h-[160px] items-center justify-center gap-2 text-[13px] text-muted">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
