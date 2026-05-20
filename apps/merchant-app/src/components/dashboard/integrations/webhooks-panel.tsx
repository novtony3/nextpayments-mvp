'use client';

import { Check, ChevronDown, Settings, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@nextpayments/ui/components/button';
import { cn } from '@nextpayments/ui/lib/utils';

import { WEBHOOK_EVENTS, WEBHOOK_EVENT_COUNT, type WebhookEvent } from '@/constants/integrations';
import { updateIntegrationAction } from '@/lib/integrations/actions';

type WebhooksPanelProps = {
  integrationId: string;
  /** Current ipnUrl on the integration (empty when freshly created). */
  initialUrl: string;
  /** Closes the parent sheet after a successful save / on Done with no change. */
  onDone: () => void;
};

type Row = { id: string; url: string; expanded: boolean };

/** Local sequence for stable row keys without crypto.randomUUID dependency. */
let nextRowId = 0;
const makeRow = (url = ''): Row => ({ id: `row-${++nextRowId}`, url, expanded: false });

const isValidUrl = (raw: string): boolean => {
  if (!raw) return true; // empty is allowed (no save)
  try {
    // eslint-disable-next-line no-new
    new URL(raw);
    return true;
  } catch {
    return false;
  }
};

/**
 * Manage Webhooks — right panel of the integration completed view. Visually
 * matches the Coinpayments multi-row layout (Add new rows, expand to see the
 * covered events, delete a row) but the **backend currently stores a single
 * `ipnUrl` per integration**, so only the first non-empty URL is persisted
 * via `PUT /api/integrations/:id`. The extra rows live in client state only
 * and a subtle note tells the user.
 */
export function WebhooksPanel({ integrationId, initialUrl, onDone }: WebhooksPanelProps) {
  const t = useTranslations('dashboard.integrations.webhooks');
  const tEvents = useTranslations('dashboard.integrations.webhooks.events');
  const [rows, setRows] = useState<Row[]>(() => [makeRow(initialUrl)]);
  const [isPending, startTransition] = useTransition();

  // Per-row validation: invalid URL + duplicate-URL detection.
  const trimmed = rows.map((r) => r.url.trim());
  const errors = rows.map((row, i): 'invalid' | 'duplicate' | null => {
    if (!isValidUrl(row.url)) return 'invalid';
    const value = trimmed[i];
    if (value && trimmed.findIndex((u, j) => j !== i && u === value) !== -1) return 'duplicate';
    return null;
  });
  const hasErrors = errors.some((e) => e !== null);

  const addRow = () => setRows((prev) => [...prev, makeRow()]);
  const removeRow = (id: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  const setUrl = (id: string, url: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, url } : r)));
  const toggleExpanded = (id: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, expanded: !r.expanded } : r)));

  const handleDone = () => {
    if (hasErrors) return;
    const firstUrl = trimmed.find((u) => u.length > 0) ?? '';

    // No change → just close (avoid an unnecessary PUT).
    if (firstUrl === initialUrl.trim()) {
      onDone();
      return;
    }

    startTransition(async () => {
      const result = await updateIntegrationAction(integrationId, { ipnUrl: firstUrl });
      if (result.ok) {
        toast.success(t('saved'));
        onDone();
      } else {
        toast.error(result.reason === 'invalid' ? t('errors.invalid') : t('errors.generic'));
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          {t('title')}
        </p>
        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{t('description')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <WebhookRow
            key={row.id}
            row={row}
            error={errors[i] ?? null}
            canDelete={rows.length > 1}
            onUrlChange={(url) => setUrl(row.id, url)}
            onToggleExpanded={() => toggleExpanded(row.id)}
            onDelete={() => removeRow(row.id)}
            urlLabel={t('urlLabel', { count: WEBHOOK_EVENT_COUNT })}
            placeholder={t('urlPlaceholder')}
            invalidMessage={t('errors.invalidUrl')}
            duplicateMessage={t('errors.duplicate')}
            deleteLabel={t('delete')}
            settingsLabel={t('settings')}
            expandLabel={t('expand')}
            eventLabel={(event) => tEvents(event)}
          />
        ))}
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--color-text-subtle)]">
        {t('singleHint')}
      </p>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          disabled={isPending || hasErrors}
          fullWidth
        >
          {t('add')}
        </Button>
        <Button type="button" onClick={handleDone} loading={isPending} fullWidth>
          {isPending ? t('saving') : t('done')}
        </Button>
      </div>
    </div>
  );
}

type WebhookRowProps = {
  row: Row;
  error: 'invalid' | 'duplicate' | null;
  canDelete: boolean;
  onUrlChange: (url: string) => void;
  onToggleExpanded: () => void;
  onDelete: () => void;
  urlLabel: string;
  placeholder: string;
  invalidMessage: string;
  duplicateMessage: string;
  deleteLabel: string;
  settingsLabel: string;
  expandLabel: string;
  eventLabel: (event: WebhookEvent) => string;
};

function WebhookRow({
  row,
  error,
  canDelete,
  onUrlChange,
  onToggleExpanded,
  onDelete,
  urlLabel,
  placeholder,
  invalidMessage,
  duplicateMessage,
  deleteLabel,
  settingsLabel,
  expandLabel,
  eventLabel,
}: WebhookRowProps) {
  const inputId = useId();

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]"
      >
        {urlLabel}
      </label>

      <div
        className={cn(
          'flex items-stretch overflow-hidden rounded-xl border bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)]',
          'transition-colors focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent-soft)]',
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border-strong)]',
        )}
      >
        <input
          id={inputId}
          type="url"
          inputMode="url"
          value={row.url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none"
        />
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-label={expandLabel}
          aria-expanded={row.expanded}
          className="flex w-10 items-center justify-center border-l border-[var(--color-border-strong)] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200 motion-reduce:transition-none',
              row.expanded && 'rotate-180',
            )}
          />
        </button>
        <button
          type="button"
          aria-label={settingsLabel}
          className="flex w-10 items-center justify-center border-l border-[var(--color-border-strong)] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-[var(--color-danger)]">
          {error === 'invalid' ? invalidMessage : duplicateMessage}
        </p>
      )}

      {row.expanded && (
        <ul className="mt-1 flex flex-col gap-1.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--glass-fill)] p-2">
          {WEBHOOK_EVENTS.map((event) => (
            <li
              key={event}
              className="flex items-center justify-between gap-3 rounded-lg bg-[var(--color-accent-soft)] px-3 py-2 text-xs font-medium text-[var(--color-text)]"
            >
              <span>{eventLabel(event)}</span>
              <Check className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
            </li>
          ))}
        </ul>
      )}

      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="self-start text-xs text-[var(--color-text-muted)] underline-offset-4 transition-colors hover:text-[var(--color-danger)] hover:underline"
        >
          <span className="inline-flex items-center gap-1">
            <Trash2 className="h-3 w-3" aria-hidden="true" /> {deleteLabel}
          </span>
        </button>
      )}
    </div>
  );
}
