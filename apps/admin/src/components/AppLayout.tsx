import { Outlet } from '@tanstack/react-router';
import { Sidebar } from './Sidebar.js';
import { Topbar } from './Topbar.js';

export function AppLayout(): JSX.Element {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto rp-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
