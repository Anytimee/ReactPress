import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ExternalLink, LogOut, User as UserIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@reactpress/ui';
import { useAuthStore } from '../stores/auth.js';

export function Topbar({ title }: { title?: string }): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="flex h-topbar shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4">
      <h1 className="truncate text-[13px] font-medium text-ink-2">{title ?? 'ReactPress'}</h1>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void logout();
          }}
        >
          <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
          Keluar
        </Button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-2 rounded-[var(--radius-sm)] border border-line bg-surface px-2 text-[13px] transition-colors duration-100 hover:bg-bg"
              aria-label="Menu pengguna"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-surface">
                {(user?.name ?? '?').slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[140px] truncate sm:inline">{user?.name ?? 'Pengguna'}</span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-[200px] rounded border border-line bg-surface p-1 shadow-1"
            >
              <div className="px-2 py-1.5">
                <p className="text-[13px] font-medium">{user?.name ?? 'Pengguna'}</p>
                <p className="truncate text-[12px] text-muted">{user?.email ?? '-'}</p>
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Item asChild>
                <Link
                  to="/settings"
                  className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] outline-none hover:bg-bg"
                >
                  <UserIcon size={15} strokeWidth={1.75} aria-hidden="true" />
                  Pengaturan akun
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <a
                  href={import.meta.env.VITE_WEB_URL ?? 'http://localhost:5174'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] outline-none hover:bg-bg"
                >
                  <ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" />
                  Lihat situs
                </a>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Item
                onSelect={() => {
                  void logout();
                }}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] text-danger outline-none hover:bg-bg"
              >
                <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
                Keluar
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
