import {
  ArrowLeftRight,
  Code2,
  FileText,
  LifeBuoy,
  ScanLine,
  Settings2,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { DashboardIconKey } from '@/constants/dashboard';

/**
 * Maps the React-free icon keys in `constants/dashboard` to Lucide
 * components. Lives in a component module (not constants) so the
 * clean-architecture "no React in constants" rule holds.
 */
export const DASHBOARD_ICONS: Record<DashboardIconKey, LucideIcon> = {
  wallet: Wallet,
  transactions: ArrowLeftRight,
  paySettings: Settings2,
  integrations: Code2,
  invoicing: FileText,
  quickPos: ScanLine,
  support: LifeBuoy,
};
