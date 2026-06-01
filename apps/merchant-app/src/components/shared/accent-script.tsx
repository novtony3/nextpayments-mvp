import { ACCENT_COOKIE, ACCENT_KEYS, DEFAULT_ACCENT } from '@/constants/theme';

/**
 * Pre-paint accent applier. Rendered as the first child of <body> in the root
 * layout so it runs synchronously before the page paints — reading the
 * `np_accent` cookie and setting `<html data-accent="…">` with zero flash
 * (the same technique next-themes uses for dark mode). Keeps pages static
 * (no server-side `cookies()` call needed).
 *
 * The key allow-list is built from `ACCENT_KEYS` so it can't drift from the
 * source of truth; the cookie name + default come from constants too. The
 * resulting string is inlined verbatim — it must stay dependency-free since
 * it executes before any bundle loads.
 */
export function AccentScript() {
  const allow = JSON.stringify(ACCENT_KEYS);
  const js =
    '(function(){try{' +
    `var m=document.cookie.match(/(?:^|; )${ACCENT_COOKIE}=([^;]+)/);` +
    `var a=m?decodeURIComponent(m[1]):'${DEFAULT_ACCENT}';` +
    `var ok=${allow};` +
    `if(ok.indexOf(a)>-1&&a!=='${DEFAULT_ACCENT}'){document.documentElement.setAttribute('data-accent',a);}` +
    '}catch(e){}})();';

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
