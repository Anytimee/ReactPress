import {
  FileText,
  FolderTree,
  Images,
  LayoutDashboard,
  LayoutTemplate,
  Tags,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { Link, useRouterState } from '@tanstack/react-router';
import { cn } from '@reactpress/ui';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Konten',
    items: [
      { to: '/', label: 'Dasbor', icon: LayoutDashboard },
      { to: '/articles', label: 'Artikel', icon: FileText },
      { to: '/pages', label: 'Halaman', icon: LayoutTemplate },
      { to: '/media', label: 'Media', icon: Images },
    ],
  },
  {
    label: 'Struktur',
    items: [
      { to: '/categories', label: 'Kategori', icon: FolderTree },
      { to: '/tags', label: 'Tag', icon: Tags },
      { to: '/patterns', label: 'Pattern', icon: Workflow },
      { to: '/templates', label: 'Template', icon: LayoutTemplate },
    ],
  },
  {
    label: 'Sistem',
    items: [{ to: '/users', label: 'Pengguna', icon: Users }],
  },
];

export function Sidebar(): JSX.Element {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside className="hidden w-sidebar shrink-0 flex-col border-r border-line bg-surface md:flex">
      <div className="flex h-topbar items-center border-b border-line px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-ink text-[11px] font-semibold text-surface">
            R
          </span>
          <span className="text-[13px] font-semibold tracking-tight">ReactPress</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 rp-scroll" aria-label="Navigasi utama">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        'flex h-8 items-center gap-2 rounded-[var(--radius-sm)] px-2 text-[13px] transition-colors duration-100',
                        active
                          ? 'bg-bg font-medium text-ink'
                          : 'text-ink-2 hover:bg-bg hover:text-ink',
                      )}
                    >
                      <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-4 py-3">
        <Link
          to="/settings"
          className={cn(
            'flex h-8 items-center gap-2 rounded-[var(--radius-sm)] px-2 text-[13px] transition-colors duration-100',
            pathname.startsWith('/settings')
              ? 'bg-bg font-medium text-ink'
              : 'text-ink-2 hover:bg-bg hover:text-ink',
          )}
        >
          <LayoutDashboard size={15} strokeWidth={1.75} aria-hidden="true" />
          Pengaturan
        </Link>
      </div>
    </aside>
  );
}
