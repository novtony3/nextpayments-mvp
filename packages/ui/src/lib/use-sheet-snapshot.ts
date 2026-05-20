'use client';

import * as React from 'react';

/**
 * Keep the last non-null value so a sheet's content stays mounted through
 * its close animation.
 *
 * Pattern: parent owns a `selected | null` state; when the sheet closes,
 * the parent flips it to `null`. Without snapshotting, the wrapper
 * component would `return null` on the very next render and unmount the
 * Sheet before its slide-out could play (only the backdrop's fade would
 * be visible — the "conflict" users perceive).
 *
 * Usage:
 *   const snapshot = useSheetSnapshot(integration);
 *   if (!snapshot) return null;
 *   return <TabbedSheet open={integration != null} ...uses snapshot.../>;
 */
export function useSheetSnapshot<T>(value: T | null | undefined): T | null {
  const [snapshot, setSnapshot] = React.useState<T | null>(value ?? null);

  React.useEffect(() => {
    // Update only when the incoming value is non-null — when it goes null
    // we keep the last data so the slide-out can render with it.
    if (value != null) setSnapshot(value);
  }, [value]);

  return snapshot;
}
