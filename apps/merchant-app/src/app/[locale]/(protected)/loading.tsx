import { PageLoader } from '@/components/shared/page-loader';

/**
 * Instant loading boundary for the protected group. Renders inside the
 * already-painted dashboard shell, so switching between dashboard pages shows
 * the shell immediately with a spinner in the content area.
 */
export default function ProtectedLoading() {
  return <PageLoader />;
}
