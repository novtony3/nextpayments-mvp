import { useEffect, useRef } from 'react';

/**
 * Run `onFocus` whenever the tab/window regains focus — a `visibilitychange`
 * back to `visible` or a window `focus` event. The latest callback is kept in a
 * ref so the listeners bind once: passing a fresh closure each render does not
 * re-subscribe. Client-only (uses `document`/`window`); import from Client
 * Components. Used by the session watcher and the header balance refresh.
 */
export function useWindowFocus(onFocus: () => void): void {
  const callbackRef = useRef(onFocus);
  callbackRef.current = onFocus;

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') callbackRef.current();
    };
    const handleFocus = () => callbackRef.current();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
}
