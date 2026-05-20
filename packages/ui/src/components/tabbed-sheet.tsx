'use client';

import * as React from 'react';

import { Sheet } from './sheet';
import { Tabs, type TabItem } from './tabs';

export interface TabbedSheetProps {
  open: boolean;
  onClose: () => void;
  /** Visible header title; also the dialog's accessible name. */
  title: string;
  /** Accessible name for the close button. */
  closeLabel: string;
  /** Accessible name for the tablist (different from `title`). */
  tabsAriaLabel: string;
  /** Tabs to show — typically the keys correspond to `panels`. */
  tabs: ReadonlyArray<TabItem>;
  /** Map of `tab.value` → panel React node. The active tab's panel is rendered. */
  panels: Record<string, React.ReactNode>;
  /** Currently-active tab value (controlled). */
  activeTab: string;
  onTabChange: (value: string) => void;
  /** Forwarded to the underlying Sheet (width override, etc.). */
  className?: string;
}

/**
 * Sheet + Tabs composition used to "manage" an entity (Edit / sub-tools /
 * Danger zone). The base {@link Sheet} primitive handles the slide / focus
 * / scroll-lock; this wrapper renders the tablist + the active tab's panel
 * so callers only describe the tabs and their content. Active tab is
 * controlled by the caller so the trigger (e.g. row icons) can deep-link
 * straight to the right tab.
 *
 * Use {@link Sheet} directly for non-tabbed flows (wizards/forms). Use this
 * one whenever an entity has multiple operations (Settings / API Keys /
 * Delete / …) — keeps the look + behavior identical across the dashboard.
 */
export const TabbedSheet = React.forwardRef<HTMLDivElement, TabbedSheetProps>(
  (
    {
      open,
      onClose,
      title,
      closeLabel,
      tabsAriaLabel,
      tabs,
      panels,
      activeTab,
      onTabChange,
      className,
    },
    ref,
  ) => {
    // Lazy-mount + persistent panels: a panel mounts the first time its tab
    // is activated within an open session, then stays mounted (hidden via
    // the `hidden` attribute) so switching back doesn't refetch its data or
    // discard its form state. The visited set resets on every fresh open so
    // unvisited panels in a new session don't pre-fetch.
    const [visited, setVisited] = React.useState<Set<string>>(() => new Set([activeTab]));
    const prevOpenRef = React.useRef(open);

    React.useEffect(() => {
      const wasOpen = prevOpenRef.current;
      prevOpenRef.current = open;

      if (open && !wasOpen) {
        // Fresh open — start visited at the initial tab only.
        setVisited(new Set([activeTab]));
        return;
      }
      if (open) {
        setVisited((prev) => {
          if (prev.has(activeTab)) return prev;
          const next = new Set(prev);
          next.add(activeTab);
          return next;
        });
      }
    }, [open, activeTab]);

    return (
      <Sheet
        ref={ref}
        open={open}
        onClose={onClose}
        title={title}
        closeLabel={closeLabel}
        className={className}
      >
        <div className="flex flex-col gap-6">
          <Tabs
            items={tabs}
            value={activeTab}
            onValueChange={onTabChange}
            aria-label={tabsAriaLabel}
          />
          {tabs.map((tab) =>
            visited.has(tab.value) ? (
              <div key={tab.value} role="tabpanel" hidden={tab.value !== activeTab}>
                {panels[tab.value]}
              </div>
            ) : null,
          )}
        </div>
      </Sheet>
    );
  },
);

TabbedSheet.displayName = 'TabbedSheet';
