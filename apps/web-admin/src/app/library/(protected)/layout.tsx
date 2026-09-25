import { requireAdmin } from '@/features/library/server';
import { AdminShell } from '@/features/library/admin-shell';
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell
      email={admin.email}
      readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'}
    >
      {children}
    </AdminShell>
  );
}
