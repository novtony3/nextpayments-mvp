import { cn } from '@nextpayments/ui/lib/utils';

import { coinGradient } from '@/constants/coins';

/** Soft top highlight layered over the coin gradient for a glossy-token look. */
const COIN_GLOSS = 'radial-gradient(circle at 50% 28%, rgba(255, 255, 255, 0.5), transparent 58%)';

/** Token diameter + on-token ticker size per use: sm = header pill, md = balances
 * list, lg = landing grid. */
const SIZES = {
  sm: { box: 'h-6 w-6', text: 'text-[8px]' },
  md: { box: 'h-9 w-9', text: 'text-[10px]' },
  lg: { box: 'h-12 w-12', text: 'text-[11px]' },
} as const;

type CoinAvatarProps = {
  ticker: string;
  size?: keyof typeof SIZES;
  /** Render the ticker initials on the token (the larger avatars use this). */
  showTicker?: boolean;
  className?: string;
};

/**
 * The one coin token used across the app — a brand-gradient disc with a glossy
 * top highlight and a hairline inner ring, reading its colour from the single
 * {@link coinGradient} source so the same coin looks identical in the header
 * pill, the balances list and the landing grid. Decorative (`aria-hidden`); the
 * surrounding context names the coin.
 */
export function CoinAvatar({
  ticker,
  size = 'md',
  showTicker = false,
  className,
}: CoinAvatarProps) {
  const { box, text } = SIZES[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold text-white',
        'ring-1 ring-inset ring-[var(--glass-highlight)]',
        box,
        showTicker && text,
        className,
      )}
      style={{ backgroundImage: `${COIN_GLOSS}, ${coinGradient(ticker)}` }}
    >
      {showTicker ? ticker.slice(0, 4) : null}
    </span>
  );
}
