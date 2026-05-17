import * as React from 'react';

import { Button, type ButtonProps } from './button';

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  /** Required for a11y — icon-only buttons must announce their purpose. */
  'aria-label': string;
  /** The single icon element to render. */
  icon: React.ReactNode;
}

/**
 * Square, icon-only Button. Defaults to `size="icon"` and `variant="ghost"`
 * (header / toolbar usage) and enforces an `aria-label`.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = 'ghost', size = 'icon', ...props }, ref) => (
    <Button ref={ref} variant={variant} size={size} {...props}>
      {icon}
    </Button>
  ),
);

IconButton.displayName = 'IconButton';
