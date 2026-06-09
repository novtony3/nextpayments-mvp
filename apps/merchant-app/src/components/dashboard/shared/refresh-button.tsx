'use client';

import { RefreshCw } from 'lucide-react';

import { Button } from '@nextpayments/ui/components/button';

import { useRouter } from '@/i18n/routing';

/**
 * Re-runs the current route's Server Component data fetch via
 * `router.refresh()` — the dashboard's "Refresh" control. Client island so the
 * surrounding page can stay a Server Component.
 */
export function RefreshButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
      onClick={() => router.refresh()}
    >
      {label}
    </Button>
  );
}
