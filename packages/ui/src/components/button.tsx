import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '../lib/utils';

/**
 * Minimal Slot — merges the Button's props/className onto a single child
 * element so `asChild` works without pulling in @radix-ui/react-slot. Keeps
 * `packages/ui` framework-agnostic (used by both Next.js and Vite apps).
 */
const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }>(
  ({ children, className, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;
    const child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref,
      className: cn(className, child.props.className as string | undefined),
    });
  },
);
Slot.displayName = 'Slot';

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full',
    'text-sm font-medium leading-none transition-all duration-200 select-none',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-[var(--color-bg)]',
  ].join(' '),
  {
    variants: {
      variant: {
        /** Frosted Gemini-blue pill — translucent blue glass, white text. */
        primary:
          'bg-[color-mix(in_oklab,var(--color-brand-blue)_82%,transparent)] text-white backdrop-blur-xl border border-[color-mix(in_oklab,white_22%,transparent)] shadow-[0_8px_28px_-10px_var(--color-brand-blue),inset_0_1px_0_0_var(--glass-highlight)] hover:bg-[var(--color-brand-blue)] hover:brightness-110',
        /** Gemini aurora glass — blue→lilac→coral behind frost. The hero CTA. */
        gradient:
          'bg-brand-gradient text-white backdrop-blur-xl border border-[color-mix(in_oklab,white_22%,transparent)] shadow-[0_10px_32px_-10px_var(--color-brand-lilac),inset_0_1px_0_0_var(--glass-highlight)] hover:opacity-95 hover:brightness-105',
        /** Frosted glass panel — the signature glassmorphism surface. */
        secondary:
          'bg-[var(--glass-fill-strong)] text-[var(--color-text)] backdrop-blur-xl border border-[var(--glass-border)] shadow-[inset_0_1px_0_0_var(--glass-highlight)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]',
        /** Hairline glass — thin frosted edge over the ambient glow. Theme-aware. */
        outline:
          'border border-[var(--glass-border)] bg-[color-mix(in_oklab,var(--color-surface)_28%,transparent)] text-[var(--color-text)] backdrop-blur-md hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]',
        /** No chrome — just text. Used in headers and inline links. */
        ghost:
          'bg-transparent text-[var(--color-text)] hover:bg-[var(--glass-fill)] hover:backdrop-blur-xl',
        /** Subtle frosted fill — for tertiary actions inside glass cards. */
        subtle:
          'bg-[var(--glass-fill)] text-[var(--color-text)] backdrop-blur-md border border-[var(--glass-border)] hover:bg-[var(--glass-fill-strong)]',
        /** Destructive — delete / irreversible actions. */
        destructive:
          'bg-[var(--color-danger)] text-[var(--color-bg)] hover:opacity-90',
        /** Inline text link — no padding, underline on hover. */
        link: 'h-auto rounded-none bg-transparent p-0 text-[var(--color-accent)] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4',
        md: 'h-11 px-5',
        lg: 'h-12 px-7 text-[15px]',
        xl: 'h-14 px-9 text-base',
        icon: 'h-9 w-9 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      // `link` ignores size paddings/heights — keep it inline-sized.
      { variant: 'link', size: ['sm', 'md', 'lg', 'xl', 'icon'], className: 'h-auto px-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the single child as the root element, merging button styles onto it. */
  asChild?: boolean;
  /** Show a spinner and block interaction while preserving layout width. */
  loading?: boolean;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      type = 'button',
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

    if (asChild) {
      return (
        <Slot ref={ref as React.Ref<HTMLElement>} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <Loader2 className="absolute h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        <span
          className={cn(
            'inline-flex items-center gap-2',
            loading && 'opacity-0',
          )}
        >
          {leftIcon}
          {children}
          {rightIcon}
        </span>
      </button>
    );
  },
);

Button.displayName = 'Button';

export { buttonVariants };
