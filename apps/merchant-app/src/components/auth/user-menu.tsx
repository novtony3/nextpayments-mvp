'use client';

import { BadgeCheck, ChevronDown, LayoutDashboard, LogOut, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState, useTransition } from 'react';

import { Button } from '@nextpayments/ui/components/button';
import { cn } from '@nextpayments/ui/lib/utils';

import { ROUTES } from '@/constants/routes';
import { Link, useRouter } from '@/i18n/routing';
import { logoutAction } from '@/lib/auth/actions';
import type { HeaderUser } from '@/lib/auth/types';

type UserMenuProps = {
  user: HeaderUser;
  /** Called after navigating away (used to close the mobile menu). */
  onNavigate?: () => void;
};

/**
 * Signed-in account menu. Same accessible disclosure pattern as the language
 * switcher (role=menu, keyboard nav, Esc/outside-click close). Shows the
 * user's identity and offers Dashboard + Log out.
 */
export function UserMenu({ user, onNavigate }: UserMenuProps) {
  const t = useTranslations('nav');
  const tAccount = useTranslations('auth.account');
  const tLogout = useTranslations('auth.logout');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  const initial = user.displayName.charAt(0).toUpperCase();
  const verifiedLabel = user.emailVerified
    ? tAccount('verifiedBadge')
    : tAccount('unverifiedBadge');

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    firstItemRef.current?.focus();
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  const handleLogout = () => {
    close(false);
    startTransition(async () => {
      await logoutAction();
      onNavigate?.();
      router.push(ROUTES.LOGIN);
      router.refresh(); // drop cached RSC rendered with the old session
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t('account')}
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className="gap-2 px-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        leftIcon={
          <span
            className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[11px] font-semibold text-[var(--color-accent)]"
            title={verifiedLabel}
          >
            <span aria-hidden="true">{initial}</span>
            <VerifiedBadgeIcon verified={user.emailVerified} label={verifiedLabel} />
          </span>
        }
        rightIcon={
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        }
      >
        <span className="hidden max-w-[12ch] truncate text-xs font-medium sm:inline">
          {user.displayName}
        </span>
      </Button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t('account')}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              close(true);
            }
          }}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[14rem] overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill-strong)] p-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-1 px-3 py-2">
            <p className="truncate text-xs text-[var(--color-text-subtle)]" title={user.email}>
              {user.email}
            </p>
            <VerifiedRow verified={user.emailVerified} label={verifiedLabel} />
          </div>
          <div className="my-1 h-px bg-[var(--glass-border)]" role="separator" />

          <Link
            ref={firstItemRef}
            href={ROUTES.DASHBOARD}
            role="menuitem"
            onClick={() => {
              close(false);
              onNavigate?.();
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--glass-fill)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('dashboard')}
          </Link>

          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--glass-fill)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {tLogout('button')}
          </button>
        </div>
      )}
    </div>
  );
}

type VerifiedProps = { verified: boolean; label: string };

/**
 * Small badge pinned to the bottom-right corner of the avatar circle.
 * - verified → green check on a bg that matches the surface (so the badge
 *   visually punches through the avatar edge)
 * - unverified → amber shield-alert as a "needs attention" cue
 *
 * The label drives `aria-label` for screen readers; the visual icon is
 * hidden from the AT tree to avoid duplicate announcement.
 */
function VerifiedBadgeIcon({ verified, label }: VerifiedProps) {
  const Icon = verified ? BadgeCheck : ShieldAlert;
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        'absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full',
        'ring-2 ring-[var(--color-bg)]',
        verified
          ? 'bg-[var(--color-success)] text-[var(--color-bg)]'
          : 'bg-[var(--color-warning)] text-[var(--color-bg)]',
      )}
    >
      <Icon className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

/** Inline row inside the dropdown that mirrors the avatar's badge state. */
function VerifiedRow({ verified, label }: VerifiedProps) {
  const Icon = verified ? BadgeCheck : ShieldAlert;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-medium',
        verified ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]',
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
