'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Client-side provider tree. Keep this lean — every consumer re-renders on
 * provider value changes. Add Context providers (sidebar, modal) here as needed.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
