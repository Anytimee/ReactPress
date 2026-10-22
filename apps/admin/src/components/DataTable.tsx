import type { ReactNode } from 'react';
import { cn } from '@reactpress/ui';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyState,
  loading = false,
}: DataTableProps<T>): JSX.Element {
  if (!loading && rows.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-8 text-center text-[13px] text-muted">
        {emptyState ?? 'Belum ada data.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line bg-surface">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted',
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-line bg-surface last:border-b-0',
                onRowClick && 'cursor-pointer hover:bg-bg',
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-3 py-2 align-middle', column.className)}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
