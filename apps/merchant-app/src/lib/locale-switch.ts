/**
 * Cross-cutting flag for in-app locale switching.
 *
 * Switching locale changes the `[locale]` route segment, so the page subtree
 * re-renders and scroll-reveal entrances (`Reveal`) would replay their fade +
 * blur — the visible "splash" on language change. The switcher calls
 * {@link notifyLocaleSwitch} right before navigating; `Reveal` then renders
 * settled instead of re-animating. First-visit scroll reveal is unaffected
 * (the flag is only ever set by an explicit in-app switch).
 *
 * Module-scoped runtime flag — not a constant and not React state: it must
 * persist across the unmount/remount the locale navigation triggers.
 */
let localeSwitched = false;

/** Mark that the user has performed an in-app locale switch. */
export function notifyLocaleSwitch(): void {
  localeSwitched = true;
}

/** Whether an in-app locale switch has occurred this session. */
export function hasLocaleSwitched(): boolean {
  return localeSwitched;
}
