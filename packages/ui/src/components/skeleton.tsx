import { cn } from '../lib/utils';

export interface SkeletonProps {
  /** Size/shape via className, e.g. `h-4 w-32` or `h-10 w-10 rounded-full`. */
  className?: string;
}

/**
 * Loading placeholder block — glass-tinted with a slow shimmer sweep
 * (static under reduced motion; see `skeleton-shimmer` in theme.css).
 * Decorative by contract: always `aria-hidden`, so the loading REGION'S
 * container owns the announcement (`aria-busy`), not each block.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <span aria-hidden="true" className={cn('skeleton-shimmer block rounded-md', className)} />;
}
