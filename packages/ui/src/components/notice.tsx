'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

import { cn } from '../lib/utils';
import { Card } from './card';

export type NoticeTone = 'info' | 'success' | 'danger' | 'warning';

export interface NoticeProps {
  /** Severity — drives the default icon and its color. Defaults to `info`. */
  tone?: NoticeTone;
  /** Override the default tone icon. */
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const TONE_ICON: Record<NoticeTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  danger: AlertTriangle,
  warning: AlertTriangle,
};

const TONE_ICON_CLASS: Record<NoticeTone, string> = {
  info: 'text-[var(--color-text-subtle)]',
  success: 'text-[var(--color-success)]',
  danger: 'text-[var(--color-danger)]',
  warning: 'text-[var(--color-warning)]',
};

/**
 * Inline notice — a frosted Card with a tone-colored leading icon and a line
 * of muted text on one row. Replaces the repeated
 * `<Card className="flex items-start gap-3 bg-glass …"><Icon/><p/></Card>`
 * pattern across the dashboard. The caller passes already-localized text.
 */
export function Notice({ tone = 'info', icon, children, className }: NoticeProps) {
  const ToneIcon = TONE_ICON[tone];
  return (
    <Card
      glow={false}
      className={cn('flex items-center gap-3 bg-[var(--glass-fill)] px-5 py-4', className)}
    >
      <span className={cn('shrink-0', TONE_ICON_CLASS[tone])} aria-hidden="true">
        {icon ?? <ToneIcon className="h-4 w-4" />}
      </span>
      <p className="text-sm text-[var(--color-text-muted)]">{children}</p>
    </Card>
  );
}
