import { cn } from '@nextpayments/ui/lib/utils';

type LogoProps = {
  className?: string;
  textClassName?: string;
  /** Hide the wordmark — useful for tight headers or favicons. */
  iconOnly?: boolean;
  /** Pixel size of the mark. */
  size?: number;
};

/**
 * GeminiMark — 4-point sparkle with the signature multi-color gradient.
 * Same silhouette as the diamond in Gemini Desktop's title bar.
 */
function GeminiMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="gemini-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3ed0f1" />
          <stop offset="35%" stopColor="#4796e3" />
          <stop offset="70%" stopColor="#e87262" />
          <stop offset="100%" stopColor="#f7c948" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 C12 7.5 16.5 7.5 22 12 C16.5 16.5 12 16.5 12 22 C12 16.5 7.5 16.5 2 12 C7.5 7.5 12 7.5 12 2 Z"
        fill="url(#gemini-sparkle)"
      />
    </svg>
  );
}

export function Logo({ className, textClassName, iconOnly, size }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <GeminiMark size={size} />
      {!iconOnly && (
        <span className={cn('text-[15px] font-medium tracking-tight', textClassName)}>
          Nextpayments
        </span>
      )}
    </span>
  );
}
