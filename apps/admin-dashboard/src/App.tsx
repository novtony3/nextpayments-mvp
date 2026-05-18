import { AdminShell } from '@/components/layout/admin-shell';
import { Home } from '@/pages/home';

export default function App() {
  return (
    <AdminShell>
      <Home />
    </AdminShell>
  );
}
