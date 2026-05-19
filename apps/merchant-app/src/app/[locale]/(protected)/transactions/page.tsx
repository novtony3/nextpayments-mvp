import {
  CURRENCY_FILTER_ALL,
  DEFAULT_TRANSACTION_TAB,
  TRANSACTION_TAB_META,
  TRANSACTIONS_PAGE_SIZE,
  TX_PARAM,
} from '@/constants/transactions';
import { TransactionsView } from '@/components/dashboard/transactions/transactions-view';
import { backendFundHistory } from '@/lib/fund/backend';
import { transactionTabSchema, type TransactionsResult } from '@/lib/fund/types';

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Transactions — Server Component. Filters live in the URL so this re-fetches
 * server-side (authed via the session cookie, per API.md §6). The fetch never
 * throws into the tree: a tunnel-down failure becomes a degraded notice.
 */
export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const tab =
    transactionTabSchema.safeParse(first(sp[TX_PARAM.TAB])).data ?? DEFAULT_TRANSACTION_TAB;
  const coin = first(sp[TX_PARAM.COIN]) ?? CURRENCY_FILTER_ALL;
  const pageNum = Number(first(sp[TX_PARAM.PAGE]));
  const page = Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1;

  const kind = TRANSACTION_TAB_META.find((m) => m.key === tab)?.kind ?? 'data';

  let result: TransactionsResult | undefined;
  if (kind === 'data') {
    result = await backendFundHistory(tab, {
      page,
      limit: TRANSACTIONS_PAGE_SIZE,
      coin: coin === CURRENCY_FILTER_ALL ? undefined : coin,
    });
  }

  return <TransactionsView tab={tab} coin={coin} kind={kind} result={result} />;
}
