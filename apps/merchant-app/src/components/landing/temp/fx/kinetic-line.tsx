import { cn } from '@nextpayments/ui/lib/utils';

const STAGGER = 0.055; // per-word delay, seconds

interface KineticLineProps {
  text: string;
  className?: string;
  /** Delay before this line's words start, seconds. */
  delay?: number;
  /** Render the words in the animated web3 gradient (hero emphasis). */
  gradient?: boolean;
}

/**
 * Splits a line into words that rise into place with a staggered mask reveal.
 * The motion is pure CSS (`np-kinetic-rise` + per-word `animation-delay`), so
 * the headline paints and animates the instant the page renders — no wait on
 * framer-motion to hydrate (this is above-the-fold / LCP copy). The container
 * carries the readable label; the animated words are aria-hidden so screen
 * readers get clean text. Static under `prefers-reduced-motion`.
 */
export function KineticLine({ text, className, delay = 0, gradient = false }: KineticLineProps) {
  const words = text.split(' ');

  return (
    <span className={cn('inline', className)} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span
            aria-hidden
            className="np-kinetic-rise inline-block"
            style={{ animationDelay: `${delay + i * STAGGER}s` }}
          >
            {/* Gradient lives on an inner span: it animates background-position,
                which would otherwise collide with the rise transform animation. */}
            <span className={cn('inline-block', gradient && 'text-gradient-web3')}>
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        </span>
      ))}
    </span>
  );
}
