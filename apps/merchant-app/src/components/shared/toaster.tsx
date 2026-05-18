'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

/**
 * Theme-aware toast host. Must render inside next-themes' ThemeProvider so
 * `useTheme()` resolves correctly — see Providers. Styled to match the Gemini
 * glass surface (frosted, hairline border, design-token colors).
 */
export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme === 'light' ? 'light' : 'dark'}
      position="top-center"
      toastOptions={{
        style: {
          background: 'var(--glass-fill-strong)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          color: 'var(--color-text)',
        },
      }}
    />
  );
}
