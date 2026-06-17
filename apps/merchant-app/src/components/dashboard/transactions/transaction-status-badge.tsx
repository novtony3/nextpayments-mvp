import { StatusBadge, type StatusTone } from '@/components/shared/status-badge';

/**
 * Lifecycle states (All / Received / Sent tabs), matched exactly:
 *   success / confirmed / completed / approved / paid → success (green)
 *   pending / processing                              → warning (amber)
 *   cancelled / failed / rejected                     → danger  (red)
 */
const LIFECYCLE_TONE: Record<string, StatusTone> = {
  success: 'success',
  confirmed: 'success',
  completed: 'success',
  complete: 'success',
  approved: 'success',
  paid: 'success',
  pending: 'warning',
  processing: 'warning',
  cancelled: 'danger',
  canceled: 'danger',
  failed: 'danger',
  rejected: 'danger',
  expired: 'neutral',
};

/**
 * Resolve a backend status string to a tone. The `status` field is unvalidated
 * (see `transactionRowSchema`) and carries two different vocabularies:
 *  - lifecycle states (above), matched exactly;
 *  - balance-history movement types on the Conversions tab (`deposit`,
 *    `withdraw`, `withdraw_refund`, `fee_deposit`, `fee_withdraw`, …), tinted by
 *    money direction — inflows (deposit / *_refund) → success, outflows
 *    (withdraw / fee charge) stay neutral.
 * Danger is reserved for genuine failure states, never plain outflows.
 */
function statusTone(key: string): StatusTone {
  return LIFECYCLE_TONE[key] ?? (/refund|deposit/.test(key) ? 'success' : 'neutral');
}

/**
 * Colored status label for the transaction list — keeps the raw backend status
 * text (not localized: the value set is open-ended) and tints it by tone.
 */
export function TransactionStatusBadge({ status }: { status: unknown }) {
  const text = typeof status === 'string' && status.trim() !== '' ? status : '';
  const tone = text === '' ? 'neutral' : statusTone(text.toLowerCase());
  return <StatusBadge tone={tone}>{text === '' ? '—' : text}</StatusBadge>;
}
