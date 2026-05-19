import {
  ArrowDownToLine,
  ArrowUpRight,
  Eye,
  FileText,
  RefreshCw,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';

import type { TransactionTab } from '@/lib/fund/types';

/** Lucide icon per transaction tab (kept out of constants per clean-arch). */
export const TX_TAB_ICONS: Record<TransactionTab, LucideIcon> = {
  all: Eye,
  received: ArrowDownToLine,
  sent: ArrowUpRight,
  conversions: RefreshCw,
  invoices: FileText,
  payments: ShoppingCart,
};
