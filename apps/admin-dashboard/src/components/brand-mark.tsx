import { cn } from '@nextpayments/ui/lib/utils';

/**
 * Gemini sparkle mark + wordmark — same silhouette/gradient as the merchant
 * app's logo so the two surfaces feel like one product.
 */
export function BrandMark({
  appName,
  suffix,
  collapsed = false,
}: {
  appName: string;
  suffix: string;
  collapsed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="admin-spark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3ed0f1" />
            <stop offset="35%" stopColor="#4796e3" />
            <stop offset="70%" stopColor="#e87262" />
            <stop offset="100%" stopColor="#f7c948" />
          </linearGradient>
        </defs>
        <path
          d="M12 2 C12 7.5 16.5 7.5 22 12 C16.5 16.5 12 16.5 12 22 C12 16.5 7.5 16.5 2 12 C7.5 7.5 12 7.5 12 2 Z"
          fill="url(#admin-spark)"
        />
      </svg>
      {!collapsed && (
        <span className="text-[15px] font-medium tracking-tight text-[var(--color-text)]">
          {appName}{' '}
          <span className={cn('text-[var(--color-text-subtle)]')}>{suffix}</span>
        </span>
      )}
    </span>
  );
}
