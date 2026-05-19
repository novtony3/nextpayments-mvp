import { INTEGRATIONS_PAGE_SIZE, INTEGRATIONS_PARAM } from '@/constants/integrations';
import { IntegrationsView } from '@/components/dashboard/integrations-view';
import { loadIntegrationList } from '@/lib/integrations/backend';

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Integrations — Server Component. The list is fetched server-side (authed
 * via the session cookie, per API.md §6); a failure degrades to a notice
 * rather than throwing into the protected layout.
 */
export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const pageNum = Number(first(sp[INTEGRATIONS_PARAM.PAGE]));
  const page = Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1;

  const list = await loadIntegrationList({ page, limit: INTEGRATIONS_PAGE_SIZE });

  return <IntegrationsView list={list} />;
}
