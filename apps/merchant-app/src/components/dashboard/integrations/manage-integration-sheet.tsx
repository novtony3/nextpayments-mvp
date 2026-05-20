'use client';

import { AlertTriangle, KeyRound, Plus, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@nextpayments/ui/components/button';
import { SHEET_TRANSITION_MS } from '@nextpayments/ui/components/sheet';
import { type TabItem } from '@nextpayments/ui/components/tabs';
import { TabbedSheet } from '@nextpayments/ui/components/tabbed-sheet';
import { ToggleSwitch } from '@nextpayments/ui/components/toggle-switch';
import { useSheetSnapshot } from '@nextpayments/ui/lib/use-sheet-snapshot';

import { TextField } from '@/components/shared/text-field';
import { useRouter } from '@/i18n/routing';
import {
  createApiKeyAction,
  deleteIntegrationAction,
  listApiKeysAction,
  revokeApiKeyAction,
  updateIntegrationAction,
} from '@/lib/integrations/actions';
import {
  INTEGRATION_ERROR_CODE,
  type ApiKey,
  type ApiKeyListPage,
  type Integration,
} from '@/lib/integrations/types';

import { ReadOnlyField } from './read-only-field';
import { SecretReveal } from './secret-reveal';

export type ManageTab = 'settings' | 'keys' | 'delete';

type ManageIntegrationSheetProps = {
  open: boolean;
  onClose: () => void;
  integration: Integration | null;
  initialTab?: ManageTab;
};

const KEYS_PAGE_SIZE = 50;

/**
 * Manage existing integration — 3 tabs composed onto the shared
 * {@link TabbedSheet} primitive (same Sheet base as `AddIntegrationSheet`,
 * so look/feel is identical):
 *   Settings → PUT /api/integrations/:id (name/siteUrl/ipnUrl/isActive)
 *   API Keys → GET/POST/DELETE /api/integrations/:id/api-keys[/:keyId]
 *   Delete   → DELETE /api/integrations/:id (type-to-confirm)
 *
 * Row icons in the list each open this sheet at the matching tab. Closing
 * resets state after the slide-out so reopening starts clean.
 */
export function ManageIntegrationSheet({
  open,
  onClose,
  integration,
  initialTab = 'settings',
}: ManageIntegrationSheetProps) {
  const t = useTranslations('dashboard.integrations.manage');
  const [tab, setTab] = useState<ManageTab>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const tabItems: ReadonlyArray<TabItem> = useMemo(
    () => [
      { value: 'settings', label: t('tabs.settings'), icon: <SettingsIcon className="h-4 w-4" /> },
      { value: 'keys', label: t('tabs.keys'), icon: <KeyRound className="h-4 w-4" /> },
      { value: 'delete', label: t('tabs.delete'), icon: <Trash2 className="h-4 w-4" /> },
    ],
    [t],
  );

  const close = () => {
    onClose();
    setTimeout(() => setTab(initialTab), SHEET_TRANSITION_MS);
  };

  // Snapshot the latest integration so panels keep rendering through the
  // slide-out (parent clears `integration` the moment `onClose` runs —
  // without this the wrapper would return null and Sheet's close animation
  // would only show the backdrop fading, with no panel sliding down).
  const snapshot = useSheetSnapshot(integration);
  if (!snapshot) return null;
  const integrationId = snapshot._id ?? String(snapshot.id ?? '');

  return (
    <TabbedSheet
      open={open}
      onClose={close}
      title={t('title', { name: snapshot.name ?? '' })}
      closeLabel={t('close')}
      tabsAriaLabel={t('tabsAriaLabel')}
      tabs={tabItems}
      activeTab={tab}
      onTabChange={(v) => setTab(v as ManageTab)}
      className="sm:max-w-3xl"
      // Key panels by integrationId so switching to a different row remounts
      // them (clears edit-form state from the previous integration). During
      // close the key is unchanged → panels stay mounted → the slide-out
      // plays smoothly with the snapshot data still rendered.
      panels={{
        settings: (
          <SettingsPanel key={integrationId} integration={snapshot} integrationId={integrationId} />
        ),
        keys: <ApiKeysPanel key={integrationId} integrationId={integrationId} />,
        delete: (
          <DeletePanel
            key={integrationId}
            integration={snapshot}
            integrationId={integrationId}
            onDeleted={close}
          />
        ),
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Settings tab — edit form + isActive toggle                                */
/* -------------------------------------------------------------------------- */

function SettingsPanel({
  integration,
  integrationId,
}: {
  integration: Integration;
  integrationId: string;
}) {
  const t = useTranslations('dashboard.integrations');
  const router = useRouter();
  const [name, setName] = useState(integration.name ?? '');
  const [siteUrl, setSiteUrl] = useState(integration.siteUrl ?? '');
  const [ipnUrl, setIpnUrl] = useState(integration.ipnUrl ?? '');
  const [isActive, setIsActive] = useState(integration.isActive !== false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(t('errors.nameRequired'));
      return;
    }
    startTransition(async () => {
      const result = await updateIntegrationAction(integrationId, {
        name: name.trim(),
        siteUrl,
        ipnUrl,
        isActive,
      });
      if (result.ok) {
        toast.success(t('manage.settings.saved'));
        router.refresh();
      } else {
        const key = result.code ? INTEGRATION_ERROR_CODE[result.code] : undefined;
        setError(t(`errors.${key ?? 'generic'}`));
      }
    });
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-5" noValidate>
      <TextField
        id="manage-name"
        label={t('form.nameLabel')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <TextField
        id="manage-site"
        label={t('form.siteUrlLabel')}
        inputMode="url"
        value={siteUrl}
        onChange={(e) => setSiteUrl(e.target.value)}
      />
      <TextField
        id="manage-ipn"
        label={t('form.ipnUrlLabel')}
        inputMode="url"
        value={ipnUrl}
        onChange={(e) => setIpnUrl(e.target.value)}
      />

      <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border-strong)] bg-[var(--glass-fill)] px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--color-text)]">
            {t('manage.settings.isActive')}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {t('manage.settings.isActiveHint')}
          </span>
        </div>
        <ToggleSwitch
          checked={isActive}
          onCheckedChange={setIsActive}
          aria-label={t('manage.settings.isActive')}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <Button type="submit" loading={isPending} fullWidth>
        {isPending ? t('manage.settings.saving') : t('manage.settings.save')}
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  API Keys tab — list + create + revoke                                     */
/* -------------------------------------------------------------------------- */

function ApiKeysPanel({ integrationId }: { integrationId: string }) {
  const t = useTranslations('dashboard.integrations.manage.keys');
  const tErrors = useTranslations('dashboard.integrations.errors');
  const [keys, setKeys] = useState<ApiKeyListPage | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [label, setLabel] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, startCreate] = useTransition();
  const ranRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listApiKeysAction(integrationId, { page: 1, limit: KEYS_PAGE_SIZE });
    if (result.ok) {
      setKeys(result.data);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
    setLoading(false);
  }, [integrationId]);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    void load();
  }, [load]);

  const createKey = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!label.trim()) {
      setCreateError(tErrors('invalid'));
      return;
    }
    startCreate(async () => {
      const result = await createApiKeyAction(integrationId, label.trim());
      if (result.ok) {
        setNewKey({ publicKey: result.publicKey, privateKey: result.privateKey });
        setLabel('');
        await load();
      } else {
        const key = result.code ? INTEGRATION_ERROR_CODE[result.code] : undefined;
        setCreateError(tErrors(key ?? 'generic'));
      }
    });
  };

  const revoke = (keyId: string, keyLabel: string) => {
    if (!window.confirm(t('confirmRevoke', { label: keyLabel }))) return;
    void (async () => {
      const result = await revokeApiKeyAction(integrationId, keyId);
      if (result.ok) {
        toast.success(t('revoked'));
        await load();
      } else {
        toast.error(tErrors('generic'));
      }
    })();
  };

  return (
    <div className="flex flex-col gap-5">
      {newKey ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">{t('newKey.title')}</p>
          <SecretReveal label={t('newKey.publicKey')} value={newKey.publicKey} />
          <SecretReveal label={t('newKey.privateKey')} value={newKey.privateKey} />
          <p className="text-xs text-[var(--color-warning)]">{t('newKey.warning')}</p>
          <Button variant="outline" size="sm" onClick={() => setNewKey(null)}>
            {t('newKey.dismiss')}
          </Button>
        </div>
      ) : (
        <form onSubmit={createKey} className="flex items-end gap-3">
          {/* Wrap so the flex-1 lands on the TextField's wrapper, not the
              already-w-full <input> inside it. */}
          <div className="min-w-0 flex-1">
            <TextField
              id="key-label"
              label={t('createLabel')}
              placeholder={t('createPlaceholder')}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <Button type="submit" loading={isCreating} leftIcon={<Plus className="h-4 w-4" />}>
            {isCreating ? t('creating') : t('create')}
          </Button>
        </form>
      )}

      {createError && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {createError}
        </p>
      )}

      {loading && <p className="text-sm text-[var(--color-text-muted)]">{t('loading')}</p>}

      {loadError && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {t('loadError')}
        </p>
      )}

      {keys && keys.rows.length === 0 && !loading && (
        <p className="text-sm text-[var(--color-text-muted)]">{t('empty')}</p>
      )}

      {keys && keys.rows.length > 0 && (
        <ul className="flex flex-col gap-3">
          {keys.rows.map((key) => (
            <ApiKeyRow
              key={key._id}
              apiKey={key}
              onRevoke={() => revoke(key._id, key.label ?? '')}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ApiKeyRow({ apiKey, onRevoke }: { apiKey: ApiKey; onRevoke: () => void }) {
  const t = useTranslations('dashboard.integrations.manage.keys');
  const isRevoked = apiKey.isActive === false || apiKey.revokeAt != null;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--glass-fill)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--color-text)]">
            {apiKey.label || t('unlabelled')}
          </span>
          <span
            className={
              isRevoked
                ? 'text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]'
                : 'text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]'
            }
          >
            {isRevoked ? t('statusRevoked') : t('statusActive')}
          </span>
        </div>
        {!isRevoked && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRevoke}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            className="text-[var(--color-danger)] hover:text-[var(--color-danger)]"
          >
            {t('revoke')}
          </Button>
        )}
      </div>
      <ReadOnlyField label={t('publicKey')} value={apiKey.publicKey} copyable monospace truncate />
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Delete tab — type-to-confirm                                              */
/* -------------------------------------------------------------------------- */

function DeletePanel({
  integration,
  integrationId,
  onDeleted,
}: {
  integration: Integration;
  integrationId: string;
  onDeleted: () => void;
}) {
  const t = useTranslations('dashboard.integrations.manage.delete');
  const tErrors = useTranslations('dashboard.integrations.errors');
  const router = useRouter();
  const expected = integration.name ?? '';
  const [confirmName, setConfirmName] = useState('');
  const [isPending, startTransition] = useTransition();
  const canDelete = confirmName.trim() === expected && expected.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;
    startTransition(async () => {
      const result = await deleteIntegrationAction(integrationId);
      if (result.ok) {
        toast.success(t('deleted', { name: expected }));
        router.refresh();
        onDeleted();
      } else {
        toast.error(tErrors('generic'));
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)] bg-[color-mix(in_oklab,var(--color-danger)_10%,transparent)] p-4">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-[var(--color-text)]">{t('warningTitle')}</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {t('warningBody', { name: expected })}
          </p>
        </div>
      </div>

      <TextField
        id="delete-confirm"
        label={t('confirmLabel', { name: expected })}
        placeholder={expected}
        value={confirmName}
        onChange={(e) => setConfirmName(e.target.value)}
        autoComplete="off"
      />

      <Button
        type="submit"
        variant="destructive"
        loading={isPending}
        disabled={!canDelete}
        fullWidth
      >
        {isPending ? t('deleting') : t('delete')}
      </Button>
    </form>
  );
}
