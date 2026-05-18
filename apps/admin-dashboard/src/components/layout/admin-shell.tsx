import type { ReactNode } from 'react';

import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

/** App frame: persistent sidebar + sticky topbar, scrollable content slot. */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-5 py-8 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
