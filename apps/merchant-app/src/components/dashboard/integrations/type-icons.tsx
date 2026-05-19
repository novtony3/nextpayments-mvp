import { Code2, MousePointerClick, ShoppingCart, type LucideIcon } from 'lucide-react';

import type { IntegrationType } from '@/lib/integrations/types';

/** Lucide icon per integration type (kept out of constants per clean-arch). */
export const INTEGRATION_TYPE_ICONS: Record<IntegrationType, LucideIcon> = {
  plugins: ShoppingCart,
  api: Code2,
  buttons: MousePointerClick,
};
