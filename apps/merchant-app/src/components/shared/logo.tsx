import { cn } from '@nextpayments/ui/lib/utils';

import { BRAND_GRADIENT_STOPS, BRAND_MONOGRAM, BRAND_NAME } from '@/constants/site';

type LogoProps = {
  className?: string;
  textClassName?: string;
  /** Hide the wordmark — useful for tight headers or favicons. */
  iconOnly?: boolean;
  /** Pixel size of the mark. */
  size?: number;
};

/** Stable gradient id — the mark may render several times per page (header,
 * footer, hero); a fixed id keeps the markup small and renders identically
 * each time, so duplicate-id paint is harmless. */
const GRADIENT_ID = 'brand-logo-gradient';

/**
 * MonogramMark — the brand monogram in a rounded-square tile filled with the
 * signature cyan → blue → coral → gold sweep (the only gradient the design
 * system allows besides the aurora). Drawn as SVG so it stays crisp at every
 * size and mirrors the raster favicon / OG card, which share the same stops
 * via `BRAND_GRADIENT_STOPS`.
 */
function MonogramMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={BRAND_NAME}
    >
      <defs>
        <linearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
          {BRAND_GRADIENT_STOPS.map((stop) => (
            <stop key={stop.offset} offset={`${stop.offset}%`} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="24" height="24" rx="6" fill={`url(#${GRADIENT_ID})`} />
      <text
        x="12"
        y="12.75"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize="10.5"
        fontWeight="700"
        letterSpacing="-0.5"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {BRAND_MONOGRAM}
      </text>
    </svg>
  );
}

export function Logo({ className, textClassName, iconOnly, size }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <MonogramMark size={size} />
      {!iconOnly && (
        <span className={cn('text-[15px] font-medium tracking-tight', textClassName)}>
          {BRAND_NAME}
        </span>
      )}
    </span>
  );
}
