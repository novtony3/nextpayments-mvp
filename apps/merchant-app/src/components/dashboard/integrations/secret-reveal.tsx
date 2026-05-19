'use client';

import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@nextpayments/ui/components/button';

const COPIED_RESET_MS = 1800;

type SecretRevealProps = {
  label: string;
  value: string;
};

/**
 * One-time secret display (ipnSecret / privateKey). Monospace, full value
 * selectable, with a copy button — the backend returns these once, so the
 * caller pairs this with the "shown only once" warning.
 */
export function SecretReveal({ label, value }: SecretRevealProps) {
  const t = useTranslations('dashboard.integrations.success');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      /* clipboard blocked — the value stays selectable for manual copy */
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
      <div className="flex items-stretch gap-2">
        <code className="min-w-0 flex-1 select-all break-all rounded-xl border border-[var(--color-border-strong)] bg-[var(--glass-fill)] px-3 py-2.5 font-mono text-xs text-[var(--color-text)]">
          {value}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={copy}
          leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        >
          {copied ? t('copied') : t('copy')}
        </Button>
      </div>
    </div>
  );
}
