import * as React from 'react';

import { cn } from '../lib/utils';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stack vertically instead of horizontally. */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Groups adjacent Buttons into a single segmented control: collapses the
 * gap between pills and squares off the inner edges so they read as one unit.
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = 'horizontal', children, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(
        'inline-flex',
        orientation === 'horizontal'
          ? '[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none'
          : 'flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

ButtonGroup.displayName = 'ButtonGroup';
