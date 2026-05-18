import { ArrowLeftRight, Store, TrendingUp, Wallet, type LucideIcon } from 'lucide-react';

/**
 * Dummy overview data (UI-only phase). Values here, labels in i18n.
 * `labelKey` → `home.stats.*`, `deltaUp` drives the trend color/arrow.
 */
export const OVERVIEW_STATS: ReadonlyArray<{
  id: string;
  labelKey: `home.stats.${string}`;
  value: string;
  delta: string;
  deltaUp: boolean;
  icon: LucideIcon;
}> = [
  { id: 'volume', labelKey: 'home.stats.volume', value: '$2.84M', delta: '+12.4%', deltaUp: true, icon: TrendingUp },
  { id: 'transactions', labelKey: 'home.stats.transactions', value: '18,402', delta: '+8.1%', deltaUp: true, icon: ArrowLeftRight },
  { id: 'merchants', labelKey: 'home.stats.merchants', value: '1,236', delta: '+3.2%', deltaUp: true, icon: Store },
  { id: 'payouts', labelKey: 'home.stats.payouts', value: '$94.2K', delta: '-2.0%', deltaUp: false, icon: Wallet },
];

export const RECENT_TX: ReadonlyArray<{
  id: string;
  merchant: string;
  amount: string;
  status: 'confirmed' | 'pending';
  time: string;
}> = [
  { id: 'tx1', merchant: 'Acme Store', amount: '0.0428 BTC', status: 'confirmed', time: '2m ago' },
  { id: 'tx2', merchant: 'Globex', amount: '1,200 USDT', status: 'confirmed', time: '11m ago' },
  { id: 'tx3', merchant: 'Initech', amount: '3.10 ETH', status: 'pending', time: '24m ago' },
  { id: 'tx4', merchant: 'Hooli', amount: '850 USDC', status: 'confirmed', time: '38m ago' },
  { id: 'tx5', merchant: 'Stark Industries', amount: '0.50 BTC', status: 'pending', time: '1h ago' },
];
