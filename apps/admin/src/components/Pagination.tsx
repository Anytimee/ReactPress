import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '@reactpress/ui';

export interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pages, total, onChange }: PaginationProps): JSX.Element | null {
  if (pages <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[12px] text-muted">
        <span>{total} item</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-t border-line px-3 py-2">
      <span className="text-[12px] text-muted">
        Halaman {page} dari {pages} · {total} item
      </span>
      <div className="flex items-center gap-1">
        <IconButton
          label="Halaman sebelumnya"
          size="sm"
          variant="ghost"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          icon={<ChevronLeft size={15} strokeWidth={1.75} aria-hidden="true" />}
        />
        <IconButton
          label="Halaman berikutnya"
          size="sm"
          variant="ghost"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          icon={<ChevronRight size={15} strokeWidth={1.75} aria-hidden="true" />}
        />
      </div>
    </div>
  );
}
