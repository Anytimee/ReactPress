import type { ContentStatus } from '@reactpress/types';
import { cn } from '@reactpress/ui';

const statusMeta: Record<ContentStatus, { label: string; className: string }> = {
  draft: { label: 'Draf', className: 'border-line text-ink-2' },
  published: { label: 'Terbit', className: 'border-success text-success' },
  scheduled: { label: 'Terjadwal', className: 'border-warning text-warning' },
  trash: { label: 'Sampah', className: 'border-danger text-danger' },
};

export function StatusBadge({ status }: { status: ContentStatus }): JSX.Element {
  const meta = statusMeta[status] ?? statusMeta.draft;
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center rounded-[var(--radius-pill)] border px-2 text-[11px] font-medium',
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}
